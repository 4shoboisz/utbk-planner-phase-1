import type { Metadata } from "next";
import { Calendar } from "@/components/calendar/calendar";

export const metadata: Metadata = { title: "Calendar" };

export default function Home() {
  return <Calendar />;
}
