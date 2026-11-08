import type { Metadata } from "next";
import { ProgressView } from "@/components/progress/progress-overview";
export const metadata: Metadata = { title: "Progress" };
export default function Page() { return <ProgressView />; }
