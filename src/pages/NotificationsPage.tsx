import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Vote, Clock, CheckCheck, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  election_id: string | null;
  created_at: string;
}

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setNotifications(data);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user?.id || "");
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "election": return <Vote className="w-5 h-5 text-primary" />;
      case "reminder": return <Clock className="w-5 h-5 text-warning" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="text-xs text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-primary font-semibold flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center mt-8">
          <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm font-medium">No notifications yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            You'll be notified when new elections are created
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  if (!notif.is_read) markAsRead(notif.id);
                  if (notif.election_id) navigate(`/elections/${notif.election_id}`);
                }}
                className={`glass-card rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform ${
                  !notif.is_read ? "border-l-4 border-l-primary" : "opacity-70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm ${!notif.is_read ? "font-bold" : "font-medium"}`}>
                      {notif.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <div className="h-8" />
    </div>
  );
};

export default NotificationsPage;
