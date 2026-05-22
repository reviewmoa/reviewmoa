import { CategoryCardsPage } from "@/components/reviewmoa/pages/categoryCardsPage";

export default async function Page({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;

  return <CategoryCardsPage categorySlug={categorySlug} />;
}
