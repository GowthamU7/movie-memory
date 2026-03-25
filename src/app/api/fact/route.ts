import { NextResponse } from "next/server";
import { getSession } from "../../../lib/session";
import { prisma } from "../../../lib/prisma";
import { openai } from "../../../lib/openai";
import { getMovieFactForUser } from "../../../services/fact-service";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getMovieFactForUser(session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fact route failed:", error);

    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (error.message === "MOVIE_NOT_SET") {
        return NextResponse.json(
          { error: "Favorite movie is not set" },
          { status: 400 }
        );
      }

      if (error.message === "GENERATION_IN_PROGRESS") {
        return NextResponse.json(
          { error: "Fact generation is already in progress. Please retry." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate movie fact." },
      { status: 500 }
    );
  }
}