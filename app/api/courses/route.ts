import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { title } = await req.json();

    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const embedding = await generateEmbedding(title);
    console.log(embedding);

    const course = await db.course.create({
      data: {
        userId,
        title,
      },
    });

    const existingCourse = await db.course.findFirst({
      where: {
        title: title,
      },
    });

    const newCourse = await db.$executeRaw`
        UPDATE "Course"
        SET vector = ${embedding}::vector
        WHERE id = ${existingCourse?.id}
    `;

    console.log(newCourse);

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

async function generateEmbedding(_input: string) {
  const input = _input.replace(/\n/g, " ");
  const embeddingData = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });
  console.log(embeddingData);
  const [{ embedding }] = (embeddingData as any).data;
  return embedding;
}
