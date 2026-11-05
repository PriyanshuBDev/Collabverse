import SearchList from "@/components/Search/SearchList";
const searchTypes = ["workspace", "user", "project", "task"] as const;
type SearchType = (typeof searchTypes)[number];

function isSearchType(value: string): value is SearchType {
  return searchTypes.includes(value as SearchType);
}
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const search = (await searchParams).search;
  const type = (await searchParams).type;
  if (
    !search ||
    search.trim() === "" ||
    !type ||
    type.trim() === "" ||
    !isSearchType(type)
  ) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-900 dark:text-gray-100 lg:text-xl">
        Provide a parameter and correct type for searching
      </div>
    );
  }
  return (
    <div className="dark:text-white w-full h-full text-gray-900 p-5">
      <div className="lg:text-2xl text-lg font-semibold">
        <span className="text-gray-700 dark:text-gray-300 font-normal">
          Search:-{" "}
        </span>{" "}
        {search}
      </div>
      <SearchList search={search} type={type} />
    </div>
  );
}
