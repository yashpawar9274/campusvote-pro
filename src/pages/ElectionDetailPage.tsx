import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, User, Clock, ShieldCheck, Vote, Sparkles, GitCompareArrows } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import CandidateBottomSheet from "@/components/CandidateBottomSheet";
import CandidateCompareSheet from "@/components/CandidateCompareSheet";
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [detailedCandidate, setDetailedCandidate] = useState<Candidate | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<Candidate[]>([]);
  const [showCompare, setShowCompare] = useState(false);

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

  const fireConfetti = () => {
    const count = 250;
    const defaults = { origin: { y: 0.6 }, zIndex: 9999 };
    confetti({ ...defaults, particleCount: Math.floor(count * 0.25), spread: 26, startVelocity: 55, colors: ["#1abc9c", "#16a085", "#3498db"] });
    confetti({ ...defaults, particleCount: Math.floor(count * 0.2), spread: 60, colors: ["#f39c12", "#e74c3c", "#9b59b6"] });
    confetti({ ...defaults, particleCount: Math.floor(count * 0.35), spread: 100, decay: 0.91, scalar: 0.8, colors: ["#1abc9c", "#3498db"] });
    confetti({ ...defaults, particleCount: Math.floor(count * 0.1), spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    confetti({ ...defaults, particleCount: Math.floor(count * 0.1), spread: 120, startVelocity: 45 });
  };

  const handleVote = async () => {
    if (!selectedCandidate || !user || !id) return;
    setVoting(true);
    const { error } = await supabase.from("votes").insert({ election_id: id, candidate_id: selectedCandidate, voter_id: user.id });
    if (error) {
      if (error.code === "23505") toast.error("You have already voted in this election");
      else toast.error("Failed to cast vote. Please try again.");
    } else {
      setHasVoted(true);
      setVotedFor(selectedCandidate);
      setShowSuccessModal(true);
      setTimeout(fireConfetti, 200);
    }
    setVoting(false);
    setShowConfirmDialog(false);
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

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold">
            {compareMode ? "Select 2 to Compare" : hasVoted ? "Candidates" : isActive ? "Select a Candidate" : "Candidates"}
          </h2>
          {candidates.length >= 2 && (
            <Button
              variant={compareMode ? "default" : "outline"}
              size="sm"
              className="rounded-xl text-xs h-8 gap-1.5"
              onClick={() => {
                setCompareMode(!compareMode);
                setCompareSelection([]);
              }}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              {compareMode ? "Cancel" : "Compare"}
            </Button>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {candidates.map((candidate, i) => {
            const isSelected = selectedCandidate === candidate.id;
            const isVotedFor = votedFor === candidate.id;
            const isCompareSelected = compareSelection.some((c) => c.id === candidate.id);

            return (
              <motion.div
                key={candidate.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => {
                  if (compareMode) {
                    setCompareSelection((prev) => {
                      const exists = prev.find((c) => c.id === candidate.id);
                      if (exists) return prev.filter((c) => c.id !== candidate.id);
                      if (prev.length >= 2) return prev;
                      const next = [...prev, candidate];
                      if (next.length === 2) {
                        setTimeout(() => setShowCompare(true), 100);
                      }
                      return next;
                    });
                  } else {
                    setDetailedCandidate(candidate);
                  }
                }}
                className={`glass-card-elevated rounded-2xl p-4 transition-all cursor-pointer active:scale-[0.98] ${isSelected ? "ring-2 ring-primary shadow-lg shadow-primary/10" : ""} ${isVotedFor ? "ring-2 ring-success shadow-lg shadow-success/10" : ""} ${isCompareSelected ? "ring-2 ring-accent-foreground shadow-lg" : ""}`}
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
            onClick={() => setShowConfirmDialog(true)}
            disabled={!selectedCandidate || voting}
            className="w-full h-13 rounded-2xl gradient-primary text-white font-bold text-base shadow-xl hover:shadow-2xl transition-all mb-6 flex items-center gap-2"
          >
            <Vote className="w-5 h-5" /> Cast Your Vote
          </Button>
        )}
      </div>

      <CandidateBottomSheet
        open={Boolean(detailedCandidate)}
        onOpenChange={(open) => {
          if (!open) setDetailedCandidate(null);
        }}
        candidate={detailedCandidate}
        electionId={election.id}
        hasVoted={hasVoted}
        votedFor={votedFor}
        isActive={isActive}
        isSelected={selectedCandidate === detailedCandidate?.id}
        onSelectCandidate={setSelectedCandidate}
      />

      {compareSelection.length === 2 && (
        <CandidateCompareSheet
          open={showCompare}
          onOpenChange={(open) => {
            setShowCompare(open);
            if (!open) setCompareSelection([]);
          }}
          candidates={compareSelection as [Candidate, Candidate]}
          electionId={election.id}
          hasVoted={hasVoted}
          votedFor={votedFor}
          isActive={isActive}
          selectedCandidate={selectedCandidate}
          onSelectCandidate={(id) => {
            setSelectedCandidate(id);
            setCompareMode(false);
            setCompareSelection([]);
          }}
        />
      )}


      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-3xl border-border/40 max-w-sm mx-auto">
          <AlertDialogHeader>
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Vote className="w-7 h-7 text-white" />
            </div>
            <AlertDialogTitle className="text-center text-lg font-extrabold">Confirm Your Vote</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-muted-foreground">
              You're voting for <span className="font-bold text-foreground">{candidates.find(c => c.id === selectedCandidate)?.name}</span>.
              <br />This action <span className="font-bold text-destructive">cannot be undone</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleVote}
              disabled={voting}
              className="w-full h-12 rounded-2xl gradient-primary text-white font-bold shadow-lg"
            >
              {voting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Yes, Cast My Vote"}
            </AlertDialogAction>
            <AlertDialogCancel className="w-full h-12 rounded-2xl font-bold mt-0">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card-elevated rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 350, damping: 18 }}
                className="w-20 h-20 rounded-3xl gradient-success flex items-center justify-center mx-auto mb-5 shadow-xl"
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="text-2xl font-extrabold mb-2">Vote Cast! 🎉</h2>
                <p className="text-muted-foreground text-sm mb-1">Your vote for</p>
                <p className="font-extrabold text-primary text-lg mb-1">
                  {candidates.find(c => c.id === votedFor)?.name}
                </p>
                <p className="text-muted-foreground text-sm mb-6">has been securely recorded.</p>

                <div className="flex items-center justify-center gap-2 bg-success/10 text-success rounded-2xl px-4 py-3 mb-6 border border-success/20">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold">Verified & Encrypted</span>
                </div>

                <Button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full h-12 rounded-2xl gradient-primary text-white font-bold shadow-lg"
                >
                  <Sparkles className="w-4 h-4" /> Done
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ElectionDetailPage;

