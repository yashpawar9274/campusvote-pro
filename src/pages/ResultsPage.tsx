import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BarChart3, Trophy, Users } from "lucide-react";

interface ElectionResult {
  id: string;
  title: string;
  election_type: string;
  status: string;
  candidates: {
    id: string;
    name: string;
    votes: number;
  }[];
  totalVotes: number;
}

const ResultsPage = () => {
  const [results, setResults] = useState<ElectionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();

    const channel = supabase
      .channel("votes-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "votes" }, () => {
        fetchResults();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchResults = async () => {
    const { data: elections } = await supabase
      .from("elections")
      .select("*")
      .in("status", ["active", "completed"])
      .order("created_at", { ascending: false });

    if (!elections) { setLoading(false); return; }

    const enriched = await Promise.all(
      elections.map(async (election) => {
        const { data: candidates } = await supabase
          .from("candidates")
          .select("id, name")
          .eq("election_id", election.id);

        const { data: votes } = await supabase
          .from("votes")
          .select("candidate_id")
          .eq("election_id", election.id);

        const candidatesWithVotes = (candidates || []).map((c) => ({
          ...c,
          votes: (votes || []).filter((v) => v.candidate_id === c.id).length,
        }));

        candidatesWithVotes.sort((a, b) => b.votes - a.votes);

        return {
          id: election.id,
          title: election.title,
          election_type: election.election_type,
          status: election.status,
          candidates: candidatesWithVotes,
          totalVotes: (votes || []).length,
        };
      })
    );

    setResults(enriched);
    setLoading(false);
  };

  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold mb-4">Live Results</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 animate-pulse h-40" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center mt-8">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No results available yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, ri) => (
            <motion.div
              key={result.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: ri * 0.1 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm">{result.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-md font-medium">
                      {result.election_type}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {result.totalVotes} votes
                    </span>
                  </div>
                </div>
                {result.status === "active" && (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-success/20 text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> LIVE
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {result.candidates.map((candidate, ci) => {
                  const percentage = result.totalVotes > 0
                    ? Math.round((candidate.votes / result.totalVotes) * 100)
                    : 0;

                  return (
                    <div key={candidate.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {ci === 0 && result.totalVotes > 0 && (
                            <Trophy className="w-3.5 h-3.5 text-warning" />
                          )}
                          <span className="text-sm font-medium">{candidate.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{candidate.votes} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: ci * 0.1 }}
                          className={`h-full rounded-full ${ci === 0 ? "gradient-primary" : "bg-muted-foreground/30"}`}
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
  );
};

export default ResultsPage;
