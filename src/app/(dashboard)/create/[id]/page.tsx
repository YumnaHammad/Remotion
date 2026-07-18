import { CreateWorkflow } from "@/features/workflow/create-workflow";

export default async function CreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CreateWorkflow projectId={id} />;
}
