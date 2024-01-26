"use client";

import qs from "query-string";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchInput = () => {
  const [value, setValue] = useState("");
  // const debouncedValue = useDebounce(value);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCategoryId = searchParams.get("categoryId");

  const executeSearch = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          categoryId: currentCategoryId,
          title: value,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      executeSearch();
    }
  };

  return (
    <div className="relative">
      <Input
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        value={value}
        className="w-full md:w-[300px] pr-9 rounded-full bg-slate-100 focus-visible:ring-slate-200"
        placeholder="Rechercher une formation"
      />
      <button onClick={executeSearch} className="absolute right-3 top-3">
        <Search className="h-5 w-5 text-slate-600" />
      </button>
    </div>
  );
};
