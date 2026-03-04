import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BarChart3, Trophy, Users, TrendingUp } from "lucide-react";

interface ElectionResult {
  id: string;
  title: string;
  election_type: string;
  status: string;
  candidates: { id: string; name: string; votes: number }[];
  totalVotes: number;
}

const ResultsPage = () => {
  const [results, setResults] = useState<ElectionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    const channel = supabase.channel("votes-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "votes" }, () => fetchResults())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchResults = async () => {
    const { data: elections } = await supabase.from("elections").select("*").in("status", ["active", "completed"]).order("created_at", { ascending: false });
    if (!elections) { setLoading(false); return; }

    const enriched = await Promise.all(
      elections.map(async (election) => {
        const { data: candidates } = await supabase.from("candidates").select("id, name").eq("election_id", election.id);
        const { data: votes } = await supabase.from("votes").select("candidate_id").eq("election_id", election.id);
        const candidatesWithVotes = (candidates || []).map((c) => ({ ...c, votes: (votes || []).filter((v) => v.candidate_id === c.id).length }));
        candidatesWithVotes.sort((a, b) => b.votes - a.votes);
        return { id: election.id, title: election.title, election_type: election.election_type, status: election.status, candidates: candidatesWithVotes, totalVotes: (votes || []).length };
      })
    );
    setResults(enriched);
    setLoading(false);
  };

  return (
    <div>
      <div className="gradient-header px-5 pt-6 pb-8 rounded-b-[2rem]">
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Live Results
        </h1>
        <p className="text-white/50 text-xs mt-1">Real-time vote tracking</p>
      </div>

      <div className="px-5 -mt-4">
        {loading ? (
          <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="glass-card-elevated rounded-2xl p-4 animate-pulse h-44" />)}</div>
        ) : results.length === 0 ? (
          <div className="glass-card-elevated rounded-2xl p-10 text-center mt-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">No results available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, ri) => (
              <motion.div
                key={result.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: ri * 0.1 }}
                className="glass-card-elevated rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm">{result.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-md font-bold">{result.election_type}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {result.totalVotes} votes</span>
                    </div>
                  </div>
                  {result.status === "active" && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-success/15 text-success border border-success/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> LIVE
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {result.candidates.map((candidate, ci) => {
                    const percentage = result.totalVotes > 0 ? Math.round((candidate.votes / result.totalVotes) * 100) : 0;
                    return (
                      <div key={candidate.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {ci === 0 && result.totalVotes > 0 && (
                              <div className="w-5 h-5 rounded-full gradient-warning flex items-center justify-center">
                                <Trophy className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <span className={`text-sm ${ci === 0 && result.totalVotes > 0 ? "font-bold" : "font-medium"}`}>{candidate.name}</span>
                          </div>
                          <span className="text-xs font-bold text-muted-foreground">{candidate.votes} <span className="text-[10px] font-medium">({percentage}%)</span></span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1.2, delay: ci * 0.15, ease: "easeOut" }}
                            className={`h-full rounded-full ${ci === 0 ? "gradient-primary" : ci === 1 ? "bg-primary/40" : "bg-muted-foreground/20"}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
