import { getMovieFactForUserWithDeps } from "./fact-service";

describe("fact service", () => {
  it("returns cached fact when latest fact is within 60 seconds", async () => {
    const nowDate = new Date("2026-03-23T12:00:30.000Z");
    const recentDate = new Date("2026-03-23T12:00:00.000Z");

    const prismaMock = {
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({
            id: "user-1",
            favoriteMovie: "Interstellar",
            isGenerating: false,
          }),
      },
      fact: {
        findFirst: jest.fn().mockResolvedValue({
          content: "Interstellar was inspired by real theoretical physics.",
          createdAt: recentDate,
        }),
        create: jest.fn(),
      },
      userUpdateMany: undefined,
    } as any;

    prismaMock.user.updateMany = jest.fn();
    prismaMock.user.update = jest.fn();

    const openaiMock = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    } as any;

    const result = await getMovieFactForUserWithDeps("user-1", {
      prisma: prismaMock,
      openai: openaiMock,
      now: () => nowDate.getTime(),
      sleep: async () => {},
    });

    expect(result.source).toBe("cache");
    expect(result.fact).toContain("Interstellar");
    expect(openaiMock.chat.completions.create).not.toHaveBeenCalled();
  });
});