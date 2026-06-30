import { TodayContent } from "@/app/(dashboard)/today/page";

export default async function DayPage({ params }: { params: Promise<{ dayNumber: string }> }) {
  const { dayNumber } = await params;
  return <TodayContent dayNumber={parseInt(dayNumber)} />;
}
