import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Vote, Clock, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

interface Election {
  id: string;
  title: string;
  description: string | null;
  election_type: string;
  department: string | null;
  status: string;
  start_date: string;
  end_date: string;
}

const ElectionsPage = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElections();

    const channel = supabase
      .channel("elections-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "elections" }, () => {
        fetchElections();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchElections = async () => {
    const { data } = await supabase
      .from("elections")
      .select("*")
      .order("created_at", { ascending: false });
    setElections(data || []);
    setLoading(false);
  };

  const filtered = elections.filter((e) => {
    const matchesFilter = filter === "all" || e.status === filter;
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = ["all", "active", "upcoming", "completed"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/20 text-success";
      case "upcoming": return "bg-warning/20 text-warning";
      case "completed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold mb-4">Elections</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search elections..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-secondary border-0"
        />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
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
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center mt-8">
          <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No elections found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((election, i) => (
            <motion.div
              key={election.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/elections/${election.id}`)}
              className="glass-card rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{election.title}</h3>
                  {election.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{election.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-md font-medium">
                      {election.election_type}
                    </span>
                    {election.department && (
                      <span className="text-xs text-muted-foreground">{election.department}</span>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${getStatusColor(election.status)}`}>
                  {election.status}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElectionsPage;
