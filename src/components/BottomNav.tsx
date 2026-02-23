import { useNavigate, useLocation } from "react-router-dom";
import { Home, BarChart3, Plus, User, Vote } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Vote, label: "Elections", path: "/elections" },
  { icon: BarChart3, label: "Results", path: "/results" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const items = isAdmin
    ? [...navItems.slice(0, 2), { icon: Plus, label: "Admin", path: "/admin" }, ...navItems.slice(2)]
    : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t bottom-nav-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all relative"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav"
                  className="absolute inset-0 rounded-xl bg-accent"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-semibold relative z-10 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
