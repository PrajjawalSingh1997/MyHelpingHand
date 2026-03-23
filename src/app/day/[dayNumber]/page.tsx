"use client";
import { use } from "react";
import { TodayContent } from "@/app/today/page";

export default function DayPage({ params }: { params: Promise<{ dayNumber: string }> }) {
  const { dayNumber } = use(params);
  return <TodayContent dayNumber={parseInt(dayNumber)} />;
}
