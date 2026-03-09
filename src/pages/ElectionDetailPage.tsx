import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, User, Clock, ShieldCheck, Vote, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  photo_url: string | null;
  manifesto: string | null;
  department: string | null;
  year: string | null;
}

interface Election {
  id: string;
  title: string;
  description: string | null;
  election_type: string;
  status: string;
  end_date: string;
}

const ElectionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => { if (id) fetchData(); }, [id]);

  const fetchData = async () => {
    const { data: electionData } = await supabase.from("elections").select("*").eq("id", id!).single();
    setElection(electionData);
    const { data: candidatesData } = await supabase.from("candidates").select("*").eq("election_id", id!);
    setCandidates(candidatesData || []);
    const { data: voteData } = await supabase.from("votes").select("candidate_id").eq("election_id", id!).eq("voter_id", user?.id || "").maybeSingle();
    if (voteData) { setHasVoted(true); setVotedFor(voteData.candidate_id); }
    setLoading(false);
  };

  const handleVote = async () => {
    if (!selectedCandidate || !user || !id) return;
    setVoting(true);
    const { error } = await supabase.from("votes").insert({ election_id: id, candidate_id: selectedCandidate, voter_id: user.id });
    if (error) {
      if (error.code === "23505") toast.error("You have already voted in this election");
      else toast.error("Failed to cast vote. Please try again.");
    } else {
      toast.success("Vote cast successfully! 🎉");
      setHasVoted(true);
      setVotedFor(selectedCandidate);
    }
    setVoting(false);
  };

  if (loading) {
    return (
      <div className="px-5 pt-6">
        <div className="h-8 bg-muted rounded-lg w-1/2 mb-4 animate-pulse" />
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="glass-card-elevated rounded-2xl p-4 animate-pulse h-24" />)}</div>
      </div>
    );
  }

  if (!election) return <div className="px-5 pt-6 text-center"><p className="text-muted-foreground">Election not found</p></div>;

  const isActive = election.status === "active";

  return (
    <div>
      {/* Header */}
      <div className="gradient-header px-5 pt-6 pb-8 rounded-b-[2rem]">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-white/70 mb-4 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-xl font-extrabold text-white mb-1">{election.title}</h1>
        {election.description && <p className="text-sm text-white/60 mb-3">{election.description}</p>}
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/15 text-white px-2.5 py-1 rounded-lg font-bold backdrop-blur-md">{election.election_type}</span>
          <span className="text-xs text-white/50 flex items-center gap-1"><Clock className="w-3 h-3" /> Ends {new Date(election.end_date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="px-5 -mt-4">
        {/* Vote confirmed banner */}
        <AnimatePresence>
          {hasVoted && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="gradient-success rounded-2xl p-4 mb-5 flex items-center gap-3 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Vote Recorded!</p>
                <p className="text-white/70 text-xs">Your vote has been securely recorded</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <h2 className="text-base font-extrabold mb-3">
          {hasVoted ? "Candidates" : isActive ? "Select a Candidate" : "Candidates"}
        </h2>

        <div className="space-y-3 mb-6">
          {candidates.map((candidate, i) => {
            const isSelected = selectedCandidate === candidate.id;
            const isVotedFor = votedFor === candidate.id;

            return (
              <motion.div
                key={candidate.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => { if (!hasVoted && isActive) setSelectedCandidate(candidate.id); }}
                className={`glass-card-elevated rounded-2xl p-4 transition-all ${
                  !hasVoted && isActive ? "cursor-pointer active:scale-[0.98]" : ""
                } ${isSelected ? "ring-2 ring-primary shadow-lg shadow-primary/10" : ""} ${isVotedFor ? "ring-2 ring-success shadow-lg shadow-success/10" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isVotedFor ? "gradient-success" : isSelected ? "gradient-primary" : "bg-muted"}`}>
                    {candidate.photo_url ? (
                      <img src={candidate.photo_url} alt={candidate.name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <User className={`w-6 h-6 ${isSelected || isVotedFor ? "text-white" : "text-muted-foreground"}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{candidate.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {candidate.department && <span className="text-[10px] text-muted-foreground font-medium">{candidate.department}</span>}
                      {candidate.year && <span className="text-[10px] text-muted-foreground">• {candidate.year}</span>}
                    </div>
                  </div>
                  {isSelected && !hasVoted && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                  {isVotedFor && (
                    <div className="w-7 h-7 rounded-full gradient-success flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                {candidate.manifesto && <p className="text-[11px] text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">{candidate.manifesto}</p>}
              </motion.div>
            );
          })}
        </div>

        {!hasVoted && isActive && (
          <Button
            onClick={handleVote} disabled={!selectedCandidate || voting}
            className="w-full h-13 rounded-2xl gradient-primary text-white font-bold text-base shadow-xl hover:shadow-2xl transition-all mb-6 flex items-center gap-2"
          >
            {voting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Vote className="w-5 h-5" /> Cast Your Vote</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ElectionDetailPage;
