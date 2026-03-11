import { CardView } from "./card-view";

export default async function CardPage({
  params,
  searchParams,
}: {
  params: Promise<{ passId: string }>;
  searchParams: Promise<{ wallet?: string }>;
}) {
  const { passId } = await params;
  const { wallet } = await searchParams;
  return <CardView passId={passId} wallet={wallet ?? null} />;
}
