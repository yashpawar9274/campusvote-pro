import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Vote, Clock, Users, TrendingUp, Sparkles } from "lucide-react";
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: electionsData } = await supabase
      .from("elections")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (electionsData) {
      const enriched = await Promise.all(
        electionsData.map(async (e) => {
          const { count } = await supabase
            .from("candidates")
            .select("*", { count: "exact", head: true })
            .eq("election_id", e.id);
          return { ...e, candidate_count: count || 0 };
        })
      );
      setElections(enriched);
    }

    const { count: activeCount } = await supabase
      .from("elections")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: totalCount } = await supabase
      .from("elections")
      .select("*", { count: "exact", head: true });

    const { count: votedCount } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("voter_id", user?.id || "");

    setStats({
      active: activeCount || 0,
      total: totalCount || 0,
      voted: votedCount || 0,
    });
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/20 text-success";
      case "upcoming": return "bg-warning/20 text-warning";
      case "completed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const statCards = [
    { icon: Vote, label: "Active", value: stats.active, color: "text-primary" },
    { icon: TrendingUp, label: "Total", value: stats.total, color: "text-accent-foreground" },
    { icon: Users, label: "Voted", value: stats.voted, color: "text-success" },
  ];

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={campusVoteLogo} alt="CampusVote" className="w-10 h-10 rounded-xl" />
          <div>
            <h1 className="text-lg font-bold">CampusVote</h1>
            <p className="text-xs text-muted-foreground">Welcome back!</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg font-medium"
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-4 text-center"
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Insight Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="gradient-primary rounded-2xl p-4 mb-6 flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/ai-insights")}
      >
        <Sparkles className="w-8 h-8 text-primary-foreground flex-shrink-0" />
        <div>
          <p className="text-primary-foreground font-semibold text-sm">AI Election Insights</p>
          <p className="text-primary-foreground/70 text-xs">Get AI-powered analysis of elections</p>
        </div>
      </motion.div>

      {/* Recent Elections */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Recent Elections</h2>
          <button
            onClick={() => navigate("/elections")}
            className="text-xs text-primary font-semibold"
          >
            See all
          </button>
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
        ) : elections.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No elections yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {elections.map((election, i) => (
              <motion.div
                key={election.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/elections/${election.id}`)}
                className="glass-card rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{election.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded-md font-medium">
                        {election.election_type}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {election.candidate_count}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${getStatusColor(election.status)}`}>
                    {election.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Ends {new Date(election.end_date).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-muted-foreground py-4">
        Made by <span className="font-semibold text-primary">Yash Pawar</span> • CampusVote v1.0
      </p>
    </div>
  );
};

export default Dashboard;
