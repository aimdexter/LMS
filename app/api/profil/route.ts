import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { nom, prenom, description, studies, categoryId } = await req.json();
    console.log(nom, prenom, description, studies, categoryId);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const embedding = await generateEmbedding(
      nom + prenom + description + studies
    );

    const profil = await db.profil.upsert({
      where: {
        userId: userId,
      },
      update: {
        userId,
        studies,
        nom,
        prenom,
        description,
        categoryId,
      },
      create: {
        userId,
        studies,
        nom,
        prenom,
        description,
        categoryId,
      },
    });

    const existingProfil = await db.profil.findFirst({
      where: {
        userId,
      },
    });

    const newProfile = await db.$executeRaw`
        UPDATE "Profil"
        SET vector = ${embedding}::vector
        WHERE id = ${existingProfil?.id}
    `;

    return NextResponse.json(profil);
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
  const [{ embedding }] = (embeddingData as any).data;
  return embedding;
}
