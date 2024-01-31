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
import CreateProfilPage from "../profil/_components/create-profile-form";
import { Banner } from "@/components/banner";

type TSimilarCourses = {
  id: string;
  similarity: number;
}[];
type TProfileVector = {
  vector: string;
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
  let coursesProfile: CourseWithProgressWithCategory[] = [];

  if (!userId) {
    return redirect("/");
  }

  const profil = await db.profil.findUnique({
    where: {
      userId,
    },
  });

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  if (profil) {
    try {
      const profilVector: TProfileVector = await db.$queryRaw`
      SELECT
        vector::text
      FROM "Profil"
      where id = ${profil.id}
    `;
      const similarCourses: TSimilarCourses = await db.$queryRaw`
      SELECT
        id,
        1 - (vector <-> ${profilVector[0].vector}::vector) as similarity
      FROM "Course"
      where 1 - (vector <-> ${profilVector[0].vector}::vector) > .3
      ORDER BY  similarity DESC;
    `;
      const orderedIds = similarCourses.map((course) => course.id);

      coursesProfile = await getCourses({
        userId,
        ids: orderedIds,
      });
      console.log(similarCourses);
    } catch (error) {
      console.error("Error in fetching courses by title:", error);
    }
  }

  if (searchParams.title) {
    try {
      const embedding = await generateEmbedding(searchParams.title);
      const vectorQuery = `[${embedding.join(",")}]`;
      const similarCourses: TSimilarCourses = await db.$queryRaw`
      SELECT
        id,
        1 - (vector <-> ${vectorQuery}::vector) as similarity
      FROM "Course"
      where 1 - (vector <-> ${vectorQuery}::vector) > .4
      ORDER BY  similarity DESC;
    `;

      const orderedIds = similarCourses.map((course) => course.id);

      courses = await getCourses({
        userId,
        ids: orderedIds,
      });
      console.log(courses);
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

  if (profil == null) {
    return <CreateProfilPage />;
  } else {
    return (
      <>
        <div className="px-6 pt-6 md:hidden md:mb-0 block">
          <SearchInput />
        </div>
        <div className="p-6 space-y-4">
          <Categories items={categories} />
          <CoursesList items={courses} />
        </div>
        <div className="p-6 space-y-4">
          <Banner label="Nous vous recommandant à base de votre profil les formations suivantes" />
          <CoursesList items={coursesProfile} />
        </div>
      </>
    );
  }
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
