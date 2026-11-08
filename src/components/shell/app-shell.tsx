import { GlobalDialogs } from "@/components/dialogs/global-dialogs";
import { GlobalSearch } from "./global-search";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { TitleBar } from "./title-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <TitleBar />
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
      <GlobalSearch />
      <GlobalDialogs />
      <KeyboardShortcuts />
    </div>
  );
}
