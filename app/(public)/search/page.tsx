import { SearchCardsView } from "@/components/search/searchCardsView";

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return <SearchCardsView initialQuery={q} />;
}
