import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import {
  CourseWithProgressWithCategory,
  CoursesList,
} from "@/components/courses-list";

import { Categories } from "./_components/categories";
import { openai } from "@/lib/openai";

type TSimilarCourses = {
  id: string;
  similarity: number;
}[];

interface SearchPageProps {
  searchParams: {
    title: string;
    categoryId: string;
  };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { userId } = auth();
  let courses: CourseWithProgressWithCategory[] = [];

  if (!userId) {
    return redirect("/");
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  if (searchParams.title) {
    try {
      const embedding = await generateEmbedding(searchParams.title);
      const vectorQuery = `[${embedding.join(",")}]`;
      const similarCourses: TSimilarCourses = await db.$queryRaw`
      SELECT
        id,
        1 - (vector <-> ${vectorQuery}::vector) as similarity
      FROM "Course"
      where 1 - (vector <-> ${vectorQuery}::vector) > .5
      ORDER BY  similarity DESC;
    `;
      console.log(searchParams.title, similarCourses);

      const orderedIds = similarCourses.map((course) => course.id);

      // Assuming getCourses accepts an object with a property that is an array of IDs
      courses = await getCourses({
        userId,
        ids: orderedIds,
      });
    } catch (error) {
      console.error("Error in fetching courses by title:", error);
    }
  } else {
    try {
      courses = await getCourses({
        userId,
        ...searchParams,
      });
    } catch (error) {
      console.error("Error in fetching courses:", error);
    }
  }

  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Categories items={categories} />
        <CoursesList items={courses} />
      </div>
    </>
  );
};

export default SearchPage;

async function generateEmbedding(raw: string) {
  // OpenAI recommends replacing newlines with spaces for best results
  const input = raw.replace(/\n/g, " ");
  const embeddingData = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });
  const [{ embedding }] = (embeddingData as any).data;
  return embedding;
}
