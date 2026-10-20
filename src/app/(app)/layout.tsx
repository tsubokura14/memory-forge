import { AppBar } from "@/components/app-bar";
import { signOutAction } from "./actions";

// Login 以外の画面の外側。解く画面は、上のバーが違うので、作るときにこのまとまりの外に置く
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppBar signOutAction={signOutAction} />
      {children}
    </>
  );
}
