import { redirect } from "next/navigation";

export default async function DashboardEventRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/schedule/${id}`);
}
