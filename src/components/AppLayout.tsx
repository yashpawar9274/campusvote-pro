import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { useAuth } from "@/contexts/AuthContext";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-lg mx-auto">{children}</main>
      {user && <BottomNav />}
    </div>
  );
};

export default AppLayout;
