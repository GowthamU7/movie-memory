import { prisma } from "../lib/prisma";
import { openai } from "../lib/openai";

const CACHE_WINDOW_MS = 60 * 1000;
const LOCK_WAIT_MS = 1200;
const LOCK_POLL_INTERVAL_MS = 150;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMovieFactForUser(userId: string) {
  return getMovieFactForUserWithDeps(userId, {
    prisma,
    openai,
    now: () => Date.now(),
    sleep,
  });
}

type Deps = {
  prisma: typeof prisma;
  openai: typeof openai;
  now: () => number;
  sleep: (ms: number) => Promise<void>;
};

export async function getMovieFactForUserWithDeps(userId: string, deps: Deps) {
  const { prisma, openai, now, sleep } = deps;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      favoriteMovie: true,
      isGenerating: true,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.favoriteMovie) {
    throw new Error("MOVIE_NOT_SET");
  }

  const movie = user.favoriteMovie;

  const latestFact = await prisma.fact.findFirst({
    where: { userId, movie },
    orderBy: { createdAt: "desc" },
  });

  if (latestFact && now() - latestFact.createdAt.getTime() < CACHE_WINDOW_MS) {
    return {
      fact: latestFact.content,
      createdAt: latestFact.createdAt,
      source: "cache",
    };
  }

  if (user.isGenerating) {
    const start = now();

    while (now() - start < LOCK_WAIT_MS) {
      await sleep(LOCK_POLL_INTERVAL_MS);

      const refreshedFact = await prisma.fact.findFirst({
        where: { userId, movie },
        orderBy: { createdAt: "desc" },
      });

      if (
        refreshedFact &&
        now() - refreshedFact.createdAt.getTime() < CACHE_WINDOW_MS
      ) {
        return {
          fact: refreshedFact.content,
          createdAt: refreshedFact.createdAt,
          source: "cache-after-wait",
        };
      }

      const refreshedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { isGenerating: true },
      });

      if (!refreshedUser?.isGenerating) {
        break;
      }
    }
  }

  const lockResult = await prisma.user.updateMany({
    where: {
      id: userId,
      isGenerating: false,
    },
    data: {
      isGenerating: true,
    },
  });

  if (lockResult.count === 0) {
    const retryFact = await prisma.fact.findFirst({
      where: { userId, movie },
      orderBy: { createdAt: "desc" },
    });

    if (retryFact && now() - retryFact.createdAt.getTime() < CACHE_WINDOW_MS) {
      return {
        fact: retryFact.content,
        createdAt: retryFact.createdAt,
        source: "cache-race-retry",
      };
    }

    throw new Error("GENERATION_IN_PROGRESS");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You generate short, accurate, fun movie facts. Keep the response to 1 or 2 sentences.",
        },
        {
          role: "user",
          content: `Give a short, interesting, non-obvious fact about the movie "${movie}".`,
        },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("EMPTY_OPENAI_RESPONSE");
    }

    const savedFact = await prisma.fact.create({
      data: {
        userId,
        movie,
        content,
      },
    });

    return {
      fact: savedFact.content,
      createdAt: savedFact.createdAt,
      source: "generated",
    };
  } catch (error) {
    const fallbackFact = await prisma.fact.findFirst({
      where: { userId, movie },
      orderBy: { createdAt: "desc" },
    });

    if (fallbackFact) {
      return {
        fact: fallbackFact.content,
        createdAt: fallbackFact.createdAt,
        source: "fallback-cache",
      };
    }

    throw error;
  } finally {
    await prisma.user.update({
      where: { id: userId },
      data: { isGenerating: false },
    });
  }
}