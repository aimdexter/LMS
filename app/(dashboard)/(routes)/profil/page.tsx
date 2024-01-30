import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import CreateProfilPage from "./_components/create-profile-form";

const ProfilPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }
  const profil = await db.profil.findFirst({
    where: {
      userId: userId,
    },
  });

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <>
      <CreateProfilPage initData={profil} />
    </>
  );
};

export default ProfilPage;
