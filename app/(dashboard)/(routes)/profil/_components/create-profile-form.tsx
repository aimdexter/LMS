"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Profil } from "@prisma/client";

const formSchema = z.object({
  nom: z.string().min(1, {
    message: "Title is required",
  }),
  prenom: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().min(1, {
    message: "Title is required",
  }),
  studies: z.string().min(1, {
    message: "Title is required",
  }),
  categoryId: z.string().min(1, {
    message: "Title is required",
  }),
});

const CreateProfilPage = ({ initData }: { initData: Profil }) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initData,
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/profil", values);
      router.push(`/search`);
      router.refresh();
      toast.success("Profil créé");
    } catch {
      toast.error("Quelque chose s'est mal passé");
    }
  };

  return (
    <div className="md:items-center md:justify-center h-full p-6">
      <div>
        <h1 className="text-2xl">Création de profil</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-8"
          >
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre nom</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'votre nom'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prenom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre prénom</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Votre prénom'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre niveau d’étude</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Votre niveau d’étude'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une Catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Catégories</SelectLabel>
                          <SelectItem value="19dcda07-9267-4c15-86af-0c3a4ab157ac">
                            Computer Science
                          </SelectItem>
                          <SelectItem value="40f90b1c-be0a-4136-981d-8f2b1b071e65">
                            Music
                          </SelectItem>
                          <SelectItem value="d554bb53-18c9-489e-8ed6-34fc260b1243">
                            Fitness
                          </SelectItem>
                          <SelectItem value="e7170dba-2e13-49a1-afc4-a4a7056ee1de">
                            Photography
                          </SelectItem>
                          <SelectItem value="2be944b0-ca39-400a-8d84-e99ea3631b61">
                            Accounting
                          </SelectItem>
                          <SelectItem value="7416e146-bdbe-412f-971b-13add39e292b">
                            Engineering
                          </SelectItem>
                          <SelectItem value="442579fd-a59f-45fa-9b9d-c8ce11769339">
                            Filming
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="e.g. 'Votre bio'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Link href="/">
                <Button type="button" variant="ghost">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Continuer
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateProfilPage;
