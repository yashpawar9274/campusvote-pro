import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, GraduationCap, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Candidate {
  id: string;
  name: string;
  photo_url: string | null;
  manifesto: string | null;
  department: string | null;
  year: string | null;
}

interface CandidateBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  electionId: string;
  hasVoted: boolean;
  votedFor: string | null;
  isActive: boolean;
  isSelected: boolean;
  onSelectCandidate: (candidateId: string) => void;
}

const CandidateBottomSheet = ({
  open,
  onOpenChange,
  candidate,
  electionId,
  hasVoted,
  votedFor,
  isActive,
  isSelected,
  onSelectCandidate,
}: CandidateBottomSheetProps) => {
  const [candidateVotes, setCandidateVotes] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (!open || !candidate) return;
    let mounted = true;

    const fetchVoteStats = async () => {
      setLoadingStats(true);

      const [totalVotesResult, candidateVotesResult] = await Promise.all([
        supabase.from("votes").select("*", { count: "exact", head: true }).eq("election_id", electionId),
        supabase
          .from("votes")
          .select("*", { count: "exact", head: true })
          .eq("election_id", electionId)
          .eq("candidate_id", candidate.id),
      ]);

      if (!mounted) return;

      setTotalVotes(totalVotesResult.count ?? 0);
      setCandidateVotes(candidateVotesResult.count ?? 0);
      setLoadingStats(false);
    };

    void fetchVoteStats();

    return () => {
      mounted = false;
    };
  }, [candidate, electionId, open]);

  const voteShare = useMemo(() => {
    if (!totalVotes) return 0;
    return Math.round((candidateVotes / totalVotes) * 100);
  }, [candidateVotes, totalVotes]);

  if (!candidate) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} snapPoints={[0.45, 0.9]}>
      <DrawerContent className="max-h-[92vh] rounded-t-3xl border-border/60">
        <DrawerHeader>
          <DrawerTitle className="text-center text-xl font-extrabold">{candidate.name}</DrawerTitle>
          <DrawerDescription className="text-center">
            Candidate profile, manifesto, and live election stats
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-28">
          <div className="mx-auto mb-4">
            <Avatar className="mx-auto h-40 w-40 rounded-3xl border border-border">
              {candidate.photo_url ? (
                <AvatarImage src={candidate.photo_url} alt={candidate.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="rounded-3xl">
                <User className="h-12 w-12 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-xs text-muted-foreground">Votes</p>
              <p className="mt-1 text-lg font-extrabold">{loadingStats ? "..." : candidateVotes}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-xs text-muted-foreground">Share</p>
              <p className="mt-1 text-lg font-extrabold">{loadingStats ? "..." : `${voteShare}%`}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="mt-1 text-lg font-extrabold">{loadingStats ? "..." : totalVotes}</p>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" />
              Vote share progress
            </div>
            <Progress value={voteShare} className="h-2.5" />
            <p className="mt-2 text-xs text-muted-foreground">
              {loadingStats ? "Updating stats..." : `${candidateVotes} out of ${totalVotes} votes`}
            </p>
          </div>

          <div className="mb-5 rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-bold">Candidate info</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>{candidate.department || "Department not provided"}</span>
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>{candidate.year ? `Year ${candidate.year}` : "Year not provided"}</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-bold">Manifesto</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {candidate.manifesto || "No manifesto has been provided yet."}
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-4 backdrop-blur">
          {hasVoted && votedFor === candidate.id ? (
            <Button className="w-full rounded-2xl" disabled>
              <CheckCircle2 className="h-4 w-4" />
              You voted for this candidate
            </Button>
          ) : !hasVoted && isActive ? (
            <Button
              onClick={() => {
                onSelectCandidate(candidate.id);
                onOpenChange(false);
              }}
              className="w-full rounded-2xl"
            >
              {isSelected ? "Selected for voting" : "Select this candidate"}
            </Button>
          ) : (
            <Button className="w-full rounded-2xl" variant="secondary" disabled>
              Voting is not available
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CandidateBottomSheet;
