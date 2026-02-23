import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ArrowLeft, Check, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: electionData } = await supabase
      .from("elections")
      .select("*")
      .eq("id", id!)
      .single();
    setElection(electionData);

    const { data: candidatesData } = await supabase
      .from("candidates")
      .select("*")
      .eq("election_id", id!);
    setCandidates(candidatesData || []);

    const { data: voteData } = await supabase
      .from("votes")
      .select("candidate_id")
      .eq("election_id", id!)
      .eq("voter_id", user?.id || "")
      .maybeSingle();

    if (voteData) {
      setHasVoted(true);
      setVotedFor(voteData.candidate_id);
    }
    setLoading(false);
  };

  const handleVote = async () => {
    if (!selectedCandidate || !user || !id) return;
    setVoting(true);

    const { error } = await supabase.from("votes").insert({
      election_id: id,
      candidate_id: selectedCandidate,
      voter_id: user.id,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("You have already voted in this election");
      } else {
        toast.error("Failed to cast vote. Please try again.");
      }
    } else {
      toast.success("Vote cast successfully! 🎉");
      setHasVoted(true);
      setVotedFor(selectedCandidate);
    }
    setVoting(false);
  };

  if (loading) {
    return (
      <div className="px-4 pt-4">
        <div className="h-8 bg-muted rounded w-1/2 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="px-4 pt-4 text-center">
        <p className="text-muted-foreground">Election not found</p>
      </div>
    );
  }

  const isActive = election.status === "active";

  return (
    <div className="px-4 pt-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-xl font-bold mb-1">{election.title}</h1>
        {election.description && (
          <p className="text-sm text-muted-foreground mb-3">{election.description}</p>
        )}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs bg-secondary px-2 py-1 rounded-lg font-medium">{election.election_type}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Ends {new Date(election.end_date).toLocaleDateString()}
          </span>
        </div>
      </motion.div>

      {hasVoted && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="gradient-primary rounded-2xl p-4 mb-6 flex items-center gap-3"
        >
          <Check className="w-6 h-6 text-primary-foreground" />
          <div>
            <p className="text-primary-foreground font-semibold text-sm">Vote Recorded!</p>
            <p className="text-primary-foreground/70 text-xs">Your vote has been securely recorded</p>
          </div>
        </motion.div>
      )}

      <h2 className="text-base font-bold mb-3">
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
              transition={{ delay: i * 0.1 }}
              onClick={() => {
                if (!hasVoted && isActive) setSelectedCandidate(candidate.id);
              }}
              className={`glass-card rounded-2xl p-4 transition-all ${
                !hasVoted && isActive ? "cursor-pointer active:scale-[0.98]" : ""
              } ${isSelected ? "ring-2 ring-primary" : ""} ${isVotedFor ? "ring-2 ring-success" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  {candidate.photo_url ? (
                    <img src={candidate.photo_url} alt={candidate.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{candidate.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {candidate.department && (
                      <span className="text-[10px] text-muted-foreground">{candidate.department}</span>
                    )}
                    {candidate.year && (
                      <span className="text-[10px] text-muted-foreground">• {candidate.year}</span>
                    )}
                  </div>
                </div>
                {isSelected && !hasVoted && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                {isVotedFor && (
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                    <Check className="w-4 h-4 text-success-foreground" />
                  </div>
                )}
              </div>
              {candidate.manifesto && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{candidate.manifesto}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {!hasVoted && isActive && (
        <Button
          onClick={handleVote}
          disabled={!selectedCandidate || voting}
          className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-base shadow-lg hover:opacity-90 transition-opacity mb-6"
        >
          {voting ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            "Cast Your Vote"
          )}
        </Button>
      )}
    </div>
  );
};

export default ElectionDetailPage;
