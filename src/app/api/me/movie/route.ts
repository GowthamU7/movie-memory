import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/session";
import { prisma } from "../../../../lib/prisma";

function validateMovie(input: unknown) {
  if (typeof input !== "string") {
    return "Movie is required.";
  }

  const trimmed = input.trim();

  if (trimmed.length < 2) {
    return "Movie must be at least 2 characters.";
  }

  if (trimmed.length > 100) {
    return "Movie must be at most 100 characters.";
  }

  return null;
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const movie = body?.movie;

    const validationError = validateMovie(movie);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const trimmedMovie = movie.trim();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { favoriteMovie: trimmedMovie },
      select: {
        id: true,
        favoriteMovie: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Failed to update favorite movie:", error);
    return NextResponse.json(
      { error: "Something went wrong while saving your movie." },
      { status: 500 }
    );
  }
}