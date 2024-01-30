const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();
import fs from "fs";
import csv from "csv-parser";
import { openai } from "../lib/openai";

const results: any[] = [];
const myCourses: any[] = [];

// Function to read CSV and return data
async function readCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
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

async function main() {
  try {
    const filePath = "courses.csv";
    const csvData = await readCSV(filePath);

    for (const row of csvData) {
      const embedding = await generateEmbedding(
        row.title + row.description + row.categorie + row.price + row.imageUrl
      );

      const course = await database.course.create({
        data: {
          title: row.title,
          userId: row.userId,
          description: row.description,
          categoryId: row.categoryId,
          price: 200,
          isPublished: true,
          imageUrl: row.imageUrl,
        },
      });

      console.log(course);

      // const existingCourse = await database.course.findFirst({
      //   where: {
      //     title: row.title,
      //   },
      // });

      const newCourse = await database.$executeRaw`
        UPDATE "Course"
        SET vector = ${embedding}::vector
        WHERE id = ${course?.id}
    `;
    }
  } catch (error) {
    console.log("Error seeding the database categories", error);
  } finally {
    await database.$disconnect();
  }
}

main();
