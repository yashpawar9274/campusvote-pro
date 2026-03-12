import { useEffect, useMemo, useState } from "react";
import { BarChart3, GraduationCap, ShieldCheck, User, X } from "lucide-react";
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

interface CandidateCompareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: [Candidate, Candidate];
  electionId: string;
  hasVoted: boolean;
  votedFor: string | null;
  isActive: boolean;
  selectedCandidate: string | null;
  onSelectCandidate: (candidateId: string) => void;
}

interface CandidateStats {
  votes: number;
  share: number;
}

const CandidateCompareSheet = ({
  open,
  onOpenChange,
  candidates,
  electionId,
  hasVoted,
  isActive,
  selectedCandidate,
  onSelectCandidate,
}: CandidateCompareSheetProps) => {
  const [stats, setStats] = useState<Record<string, CandidateStats>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || candidates.length < 2) return;
    let mounted = true;

    const fetchStats = async () => {
      setLoading(true);
      const [totalResult, ...candidateResults] = await Promise.all([
        supabase.from("votes").select("*", { count: "exact", head: true }).eq("election_id", electionId),
        ...candidates.map((c) =>
          supabase.from("votes").select("*", { count: "exact", head: true }).eq("election_id", electionId).eq("candidate_id", c.id)
        ),
      ]);

      if (!mounted) return;
      const total = totalResult.count ?? 0;
      setTotalVotes(total);

      const newStats: Record<string, CandidateStats> = {};
      candidates.forEach((c, i) => {
        const votes = candidateResults[i].count ?? 0;
        newStats[c.id] = { votes, share: total ? Math.round((votes / total) * 100) : 0 };
      });
      setStats(newStats);
      setLoading(false);
    };

    void fetchStats();
    return () => { mounted = false; };
  }, [open, candidates, electionId]);

  const [a, b] = candidates;

  const renderColumn = (candidate: Candidate) => {
    const s = stats[candidate.id] || { votes: 0, share: 0 };
    const isSelected = selectedCandidate === candidate.id;

    return (
      <div className="flex-1 min-w-0">
        <div className="flex flex-col items-center mb-3">
          <Avatar className="h-16 w-16 rounded-2xl border border-border mb-2">
            {candidate.photo_url ? (
              <AvatarImage src={candidate.photo_url} alt={candidate.name} className="object-cover" />
            ) : null}
            <AvatarFallback className="rounded-2xl">
              <User className="h-6 w-6 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xs font-extrabold text-center truncate w-full">{candidate.name}</h3>
        </div>

        <div className="space-y-2 mb-3">
          <div className="rounded-xl border border-border bg-card p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Votes</p>
            <p className="text-sm font-extrabold">{loading ? "..." : s.votes}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Share</span>
              <span className="text-[10px] font-bold">{loading ? "..." : `${s.share}%`}</span>
            </div>
            <Progress value={s.share} className="h-1.5" />
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <GraduationCap className="h-3 w-3 text-primary flex-shrink-0" />
            <span className="truncate">{candidate.department || "N/A"}</span>
          </p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-primary flex-shrink-0" />
            <span>{candidate.year ? `Year ${candidate.year}` : "N/A"}</span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-2.5 mb-3">
          <h4 className="text-[10px] font-bold mb-1">Manifesto</h4>
          <p className="text-[10px] leading-relaxed text-muted-foreground line-clamp-6 whitespace-pre-line">
            {candidate.manifesto || "No manifesto provided."}
          </p>
        </div>

        {!hasVoted && isActive && (
          <Button
            size="sm"
            variant={isSelected ? "default" : "outline"}
            className="w-full rounded-xl text-xs h-9"
            onClick={() => {
              onSelectCandidate(candidate.id);
              onOpenChange(false);
            }}
          >
            {isSelected ? "Selected ✓" : "Select"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] rounded-t-3xl border-border/60">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-center text-base font-extrabold">Compare Candidates</DrawerTitle>
          <DrawerDescription className="text-center text-xs">
            Side-by-side comparison of stats and manifestos
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-6">
          <div className="flex gap-3">
            {renderColumn(a)}
            <div className="w-px bg-border flex-shrink-0 my-4" />
            {renderColumn(b)}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CandidateCompareSheet;
