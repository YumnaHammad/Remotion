import { notFound } from "next/navigation";
import { ShowcaseDetail } from "@/features/showcase/showcase-detail";
import { getTemplateById } from "@/templates/catalog";

export default async function ShowcaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = getTemplateById(id);
  if (!template) notFound();
  return <ShowcaseDetail template={template} />;
}
