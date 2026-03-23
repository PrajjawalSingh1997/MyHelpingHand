

import { TodayContent } from "@/app/today/page";

export async function generateStaticParams() {
  return Array.from({ length: 90 }, (_, i) => ({
    dayNumber: String(i + 1),
  }));
}

export default async function DayPage({ params }: { params: Promise<{ dayNumber: string }> }) {
  const { dayNumber } = await params;
  return <TodayContent dayNumber={parseInt(dayNumber)} />;
}
