import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Vote, Search, ChevronRight } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
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
    const channel = supabase.channel("elections-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "elections" }, () => fetchElections())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchElections = async () => {
    const { data } = await supabase.from("elections").select("*").order("created_at", { ascending: false });
    setElections(data || []);
    setLoading(false);
  };

  const filtered = elections.filter((e) => {
    const matchesFilter = filter === "all" || e.status === filter;
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = ["all", "active", "upcoming", "completed"];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-success/15 text-success border border-success/20 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />Live</span>;
      case "upcoming": return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-warning/15 text-warning border border-warning/20">Soon</span>;
      case "completed": return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">Done</span>;
      default: return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="gradient-header px-5 pt-6 pb-8 rounded-b-[2rem]">
        <h1 className="text-xl font-extrabold text-white mb-4">Elections</h1>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search elections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-white/10 backdrop-blur-md border-white/10 text-white placeholder:text-white/40 font-medium"
          />
        </div>
      </div>

      <div className="px-5 -mt-3">
        {/* Filter chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${
                filter === f
                  ? "gradient-primary text-white shadow-md"
                  : "bg-card text-muted-foreground border border-border/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card-elevated rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-muted rounded-lg w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card-elevated rounded-2xl p-10 text-center mt-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Vote className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">No elections found</p>
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
                className="glass-card-elevated rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{election.title}</h3>
                    {election.description && (
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{election.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-md font-bold">
                        {election.election_type}
                      </span>
                      {election.department && (
                        <span className="text-[10px] text-muted-foreground font-medium">{election.department}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(election.status)}
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectionsPage;
