import { AppBar } from "@/components/app-bar";
import { signOutAction } from "./actions";

// Login と、Subject の画面（Setup と Solve。src/app/subjects/[id]/）以外の画面の外側
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppBar signOutAction={signOutAction} />
      {children}
    </>
  );
}
