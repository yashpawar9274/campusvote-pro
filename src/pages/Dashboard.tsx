import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Vote, Users, TrendingUp, Sparkles, ChevronRight, Zap } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { useNavigate } from "react-router-dom";
import campusVoteLogo from "@/assets/campusvote-logo.png";

interface ElectionSummary {
  id: string;
  title: string;
  election_type: string;
  status: string;
  end_date: string;
  candidate_count: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState<ElectionSummary[]>([]);
  const [stats, setStats] = useState({ active: 0, total: 0, voted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: electionsData } = await supabase
      .from("elections").select("*").order("created_at", { ascending: false }).limit(5);

    if (electionsData) {
      const enriched = await Promise.all(
        electionsData.map(async (e) => {
          const { count } = await supabase.from("candidates").select("*", { count: "exact", head: true }).eq("election_id", e.id);
          return { ...e, candidate_count: count || 0 };
        })
      );
      setElections(enriched);
    }

    const { count: activeCount } = await supabase.from("elections").select("*", { count: "exact", head: true }).eq("status", "active");
    const { count: totalCount } = await supabase.from("elections").select("*", { count: "exact", head: true });
    const { count: votedCount } = await supabase.from("votes").select("*", { count: "exact", head: true }).eq("voter_id", user?.id || "");

    setStats({ active: activeCount || 0, total: totalCount || 0, voted: votedCount || 0 });
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-success/15 text-success border border-success/20 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />Live</span>;
      case "upcoming": return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-warning/15 text-warning border border-warning/20">Soon</span>;
      case "completed": return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">Done</span>;
      default: return null;
    }
  };

  const statCards = [
    { icon: Zap, label: "Active", value: stats.active, gradient: "gradient-primary" },
    { icon: TrendingUp, label: "Total", value: stats.total, gradient: "gradient-success" },
    { icon: Vote, label: "Voted", value: stats.voted, gradient: "gradient-warning" },
  ];

  return (
    <div className="relative">
      {/* Hero Header */}
      <div className="gradient-header px-5 pt-6 pb-10 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.img
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              src={campusVoteLogo} alt="CampusVote"
              className="w-11 h-11 rounded-2xl shadow-lg ring-2 ring-white/20"
            />
            <div>
              <h1 className="text-lg font-extrabold text-white">CampusVote</h1>
              <p className="text-[11px] text-white/60 font-medium">Welcome back! 👋</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10"
            >
              <stat.icon className="w-5 h-5 mx-auto mb-1 text-white/80" />
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-[10px] text-white/50 font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-5 -mt-4">
        {/* AI Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-elevated rounded-2xl p-4 mb-5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform shine-effect"
          onClick={() => navigate("/ai-insights")}
        >
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">AI Election Insights</p>
            <p className="text-muted-foreground text-[11px]">Get AI-powered analysis & tips</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>

        {/* Recent Elections */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold">Recent Elections</h2>
            <button onClick={() => navigate("/elections")} className="text-xs text-primary font-bold flex items-center gap-0.5">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </button>
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
          ) : elections.length === 0 ? (
            <div className="glass-card-elevated rounded-2xl p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Vote className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No elections yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {elections.map((election, i) => (
                <motion.div
                  key={election.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  onClick={() => navigate(`/elections/${election.id}`)}
                  className="glass-card-elevated rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{election.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-md font-bold">
                          {election.election_type}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" /> {election.candidate_count}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(election.status)}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Ends {new Date(election.end_date).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-muted-foreground py-4">
          Made by <span className="font-bold text-primary">Yash Pawar</span> • CampusVote v1.0
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
