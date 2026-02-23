import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Plus, Vote, Users, Trash2 } from "lucide-react";
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

  // Candidate fields
  const [candidates, setCandidates] = useState([{ name: "", manifesto: "", department: "", year: "" }]);

  if (!isAdmin) {
    return (
      <div className="px-4 pt-4 text-center">
        <div className="glass-card rounded-2xl p-8 mt-8">
          <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm font-medium">Admin access required</p>
          <p className="text-xs text-muted-foreground mt-1">Contact your administrator to get access</p>
        </div>
      </div>
    );
  }

  const addCandidate = () => {
    setCandidates([...candidates, { name: "", manifesto: "", department: "", year: "" }]);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length > 1) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  const updateCandidate = (index: number, field: string, value: string) => {
    const updated = [...candidates];
    (updated[index] as any)[field] = value;
    setCandidates(updated);
  };

  const handleCreate = async () => {
    if (!title.trim() || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const validCandidates = candidates.filter((c) => c.name.trim());
    if (validCandidates.length < 2) {
      toast.error("Please add at least 2 candidates");
      return;
    }

    setCreating(true);

    const { data: election, error } = await supabase
      .from("elections")
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        election_type: electionType,
        department: department.trim() || null,
        start_date: new Date().toISOString(),
        end_date: new Date(endDate).toISOString(),
        status,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create election");
      setCreating(false);
      return;
    }

    const candidateInserts = validCandidates.map((c) => ({
      election_id: election.id,
      name: c.name.trim(),
      manifesto: c.manifesto.trim() || null,
      department: c.department.trim() || null,
      year: c.year.trim() || null,
    }));

    const { error: candidateError } = await supabase.from("candidates").insert(candidateInserts);

    if (candidateError) {
      toast.error("Election created but failed to add candidates");
    } else {
      toast.success("Election created successfully! 🎉");
      setTitle("");
      setDescription("");
      setDepartment("");
      setEndDate("");
      setCandidates([{ name: "", manifesto: "", department: "", year: "" }]);
    }
    setCreating(false);
  };

  const electionTypes = ["CR", "GS", "President", "Vice President", "Secretary", "Sports Captain", "Cultural Head", "Other"];

  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold mb-4">Create Election</h1>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Election Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., CR Election - CS Department"
            className="h-12 rounded-xl bg-secondary border-0"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description..."
            className="h-12 rounded-xl bg-secondary border-0"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Election Type</label>
          <div className="flex gap-2 flex-wrap">
            {electionTypes.map((type) => (
              <button
                key={type}
                onClick={() => setElectionType(type)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  electionType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Department</label>
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g., Computer Science"
            className="h-12 rounded-xl bg-secondary border-0"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">End Date *</label>
          <Input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-12 rounded-xl bg-secondary border-0"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Status</label>
          <div className="flex gap-2">
            {["upcoming", "active"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  status === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold">Candidates</label>
            <button
              onClick={addCandidate}
              className="text-primary text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          <div className="space-y-3">
            {candidates.map((candidate, i) => (
              <motion.div
                key={i}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Candidate {i + 1}</span>
                  {candidates.length > 1 && (
                    <button onClick={() => removeCandidate(i)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    value={candidate.name}
                    onChange={(e) => updateCandidate(i, "name", e.target.value)}
                    placeholder="Candidate Name *"
                    className="h-10 rounded-lg bg-secondary border-0 text-sm"
                  />
                  <Input
                    value={candidate.manifesto}
                    onChange={(e) => updateCandidate(i, "manifesto", e.target.value)}
                    placeholder="Manifesto / Agenda"
                    className="h-10 rounded-lg bg-secondary border-0 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={candidate.department}
                      onChange={(e) => updateCandidate(i, "department", e.target.value)}
                      placeholder="Department"
                      className="h-10 rounded-lg bg-secondary border-0 text-sm"
                    />
                    <Input
                      value={candidate.year}
                      onChange={(e) => updateCandidate(i, "year", e.target.value)}
                      placeholder="Year"
                      className="h-10 rounded-lg bg-secondary border-0 text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleCreate}
          disabled={creating}
          className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-base shadow-lg hover:opacity-90 transition-opacity"
        >
          {creating ? "Creating..." : "Create Election"}
        </Button>
      </div>

      <div className="h-8" />
    </div>
  );
};

export default AdminPage;
