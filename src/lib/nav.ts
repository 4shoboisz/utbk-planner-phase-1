import type { IconName } from "@/components/icon";

export type NavItem = { href: string; label: string; icon: IconName; shortcut?: string };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
	{
		label: "Planner",
		items: [
			{ href: "/", label: "Calendar", icon: "nav-calendar" },
			{ href: "/roadmap", label: "Roadmap", icon: "nav-dashboard" },
			{ href: "/progress", label: "Progress", icon: "nav-analytics" },
		],
	},
];

export const SETTINGS_ITEM: NavItem = { href: "/settings", label: "Settings", icon: "settings" };
export const ALL_PAGES: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), SETTINGS_ITEM];

export function pageTitle(pathname: string): string {
	const match = ALL_PAGES.find(
		(p) => pathname === p.href || (p.href !== "/" && pathname.startsWith(p.href + "/"))
	);
	return match?.label ?? "Calendar";
}
