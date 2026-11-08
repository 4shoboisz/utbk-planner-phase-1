"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDaysIcon, MapIcon, PlusIcon, SettingsIcon, TrendingUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openOverlay } from "@/stores/overlay-store";
import { cn } from "@/lib/utils";
import Image from "next/image";

const links = [
	{ href: "/", label: "Calendar", icon: CalendarDaysIcon },
	{ href: "/roadmap", label: "Roadmap", icon: MapIcon },
	{ href: "/progress", label: "Progress", icon: TrendingUpIcon },
];

export function TitleBar() {
	const pathname = usePathname();
	return (
		<header className="flex h-[53px] w-full shrink-0 items-center border-b border-hairline glass-panel px-3 pt-[env(safe-area-inset-top)] sm:px-4">
			<Link
				href="/"
				className="mr-2 hidden items-center gap-2 outline-none sm:flex"
			>
				<span className="flex size-7 items-center justify-center overflow-hidden rounded-lg bg-brand">
					<Image src="/utbk-planner-mark.svg" alt="UTBK Planner" width={28} height={28} className="size-full" priority />
				</span>
				<span className="text-[14px] font-semibold text-fg">
					UTBK Planner
				</span>
			</Link>
			<nav
				aria-label="Primary"
				className="flex h-full items-center gap-1 max-sm:flex-1"
			>
				{links.map(({ href, label, icon: Glyph }) => {
					const active =
						href === "/" ? pathname === "/" : pathname.startsWith(href);
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								"press flex h-full items-center gap-1.5 border-b-2 px-2.5 text-[13px] outline-none sm:px-3",
								active
									? "border-[var(--brand-lime)] text-fg"
									: "border-transparent text-fg-2 hover-fine:text-fg"
							)}
						>
							<Glyph className="size-3.5 sm:hidden" />
							<span>{label}</span>
						</Link>
					);
				})}
			</nav>
			<div className="ml-auto flex items-center gap-1.5">
				<Button
					variant="brand"
					size="sm"
					onClick={() => openOverlay({ kind: "event" })}
					className="gap-1.5"
				>
					<PlusIcon className="size-3.5" />
					<span className="max-sm:hidden">Add schedule</span>
				</Button>
				<Link
					href="/settings"
					aria-label="Settings"
					className="press flex size-8 items-center justify-center rounded-lg text-fg-2 outline-none hover-fine:bg-hover hover-fine:text-fg"
				>
					<SettingsIcon className="size-4" />
				</Link>
			</div>
		</header>
	);
}
