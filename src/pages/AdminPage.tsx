import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Plus, Vote, Trash2, ShieldCheck, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [electionType, setElectionType] = useState("CR");
  const [department, setDepartment] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [creating, setCreating] = useState(false);
  const [candidates, setCandidates] = useState([{ name: "", manifesto: "", department: "", year: "" }]);

  if (!isAdmin) {
    return (
      <div className="px-5 pt-6 text-center">
        <div className="glass-card-elevated rounded-2xl p-10 mt-8">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm font-bold">Admin access required</p>
          <p className="text-xs text-muted-foreground mt-1">Contact your administrator</p>
        </div>
      </div>
    );
  }

  const addCandidate = () => setCandidates([...candidates, { name: "", manifesto: "", department: "", year: "" }]);
  const removeCandidate = (index: number) => { if (candidates.length > 1) setCandidates(candidates.filter((_, i) => i !== index)); };
  const updateCandidate = (index: number, field: string, value: string) => { const updated = [...candidates]; (updated[index] as any)[field] = value; setCandidates(updated); };

  const handleCreate = async () => {
    if (!title.trim() || !endDate) { toast.error("Please fill in all required fields"); return; }
    const validCandidates = candidates.filter((c) => c.name.trim());
    if (validCandidates.length < 2) { toast.error("Please add at least 2 candidates"); return; }
    setCreating(true);

    const { data: election, error } = await supabase.from("elections").insert({
      title: title.trim(), description: description.trim() || null, election_type: electionType,
      department: department.trim() || null, start_date: new Date().toISOString(), end_date: new Date(endDate).toISOString(),
      status, created_by: user?.id,
    }).select().single();

    if (error) { toast.error("Failed to create election"); setCreating(false); return; }

    const { error: candidateError } = await supabase.from("candidates").insert(
      validCandidates.map((c) => ({ election_id: election.id, name: c.name.trim(), manifesto: c.manifesto.trim() || null, department: c.department.trim() || null, year: c.year.trim() || null }))
    );

    if (candidateError) toast.error("Election created but failed to add candidates");
    else { toast.success("Election created successfully! 🎉"); setTitle(""); setDescription(""); setDepartment(""); setEndDate(""); setCandidates([{ name: "", manifesto: "", department: "", year: "" }]); }
    setCreating(false);
  };

  const electionTypes = ["CR", "GS", "President", "Vice President", "Secretary", "Sports Captain", "Cultural Head", "Other"];

  return (
    <div>
      <div className="gradient-header px-5 pt-6 pb-8 rounded-b-[2rem]">
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2"><Rocket className="w-5 h-5" /> Create Election</h1>
        <p className="text-white/50 text-xs mt-1">Set up a new election for your campus</p>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        <div className="glass-card-elevated rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block">Election Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., CR Election - CS Department" className="h-12 rounded-xl bg-muted/50 border-0 font-medium" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." className="h-12 rounded-xl bg-muted/50 border-0 font-medium" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block">Election Type</label>
            <div className="flex gap-2 flex-wrap">
              {electionTypes.map((type) => (
                <button key={type} onClick={() => setElectionType(type)}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${electionType === type ? "gradient-primary text-white shadow-md" : "bg-muted text-muted-foreground"}`}
                >{type}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block">Department</label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., Computer Science" className="h-12 rounded-xl bg-muted/50 border-0 font-medium" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block">End Date *</label>
            <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-12 rounded-xl bg-muted/50 border-0 font-medium" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block">Status</label>
            <div className="flex gap-2">
              {["upcoming", "active"].map((s) => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${status === s ? "gradient-primary text-white shadow-md" : "bg-muted text-muted-foreground"}`}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card-elevated rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-extrabold">Candidates</label>
            <button onClick={addCandidate} className="text-primary text-xs font-bold flex items-center gap-1 bg-accent px-3 py-1.5 rounded-full">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          <div className="space-y-3">
            {candidates.map((candidate, i) => (
              <motion.div key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground">Candidate {i + 1}</span>
                  {candidates.length > 1 && <button onClick={() => removeCandidate(i)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>}
                </div>
                <div className="space-y-2">
                  <Input value={candidate.name} onChange={(e) => updateCandidate(i, "name", e.target.value)} placeholder="Candidate Name *" className="h-10 rounded-lg bg-card border-0 text-sm font-medium" />
                  <Input value={candidate.manifesto} onChange={(e) => updateCandidate(i, "manifesto", e.target.value)} placeholder="Manifesto / Agenda" className="h-10 rounded-lg bg-card border-0 text-sm font-medium" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={candidate.department} onChange={(e) => updateCandidate(i, "department", e.target.value)} placeholder="Department" className="h-10 rounded-lg bg-card border-0 text-sm font-medium" />
                    <Input value={candidate.year} onChange={(e) => updateCandidate(i, "year", e.target.value)} placeholder="Year" className="h-10 rounded-lg bg-card border-0 text-sm font-medium" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Button onClick={handleCreate} disabled={creating} className="w-full h-13 rounded-2xl gradient-primary text-white font-bold text-base shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
          {creating ? "Creating..." : <><Rocket className="w-5 h-5" /> Create Election</>}
        </Button>

        <div className="h-8" />
      </div>
    </div>
  );
};

export default AdminPage;
