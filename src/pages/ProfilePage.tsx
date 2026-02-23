import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { User, Mail, BookOpen, Calendar, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import campusVoteLogo from "@/assets/campusvote-logo.png";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user?.id || "")
      .maybeSingle();

    if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setDepartment(data.department || "");
      setYear(data.year || "");
      setRollNumber(data.roll_number || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        department,
        year,
        roll_number: rollNumber,
      })
      .eq("user_id", user?.id || "");

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      setEditing(false);
      fetchProfile();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="px-4 pt-4">
        <div className="h-24 bg-muted rounded-2xl animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Profile</h1>
        <button
          onClick={() => setEditing(!editing)}
          className="text-primary text-sm font-semibold flex items-center gap-1"
        >
          <Edit2 className="w-4 h-4" /> {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card rounded-2xl p-6 mb-6 flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-lg">{profile?.full_name || "Student"}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Full Name</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={!editing}
            className="h-12 rounded-xl bg-secondary border-0"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Department</label>
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={!editing}
            placeholder="e.g., Computer Science"
            className="h-12 rounded-xl bg-secondary border-0"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Year</label>
          <Input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={!editing}
            placeholder="e.g., 3rd Year"
            className="h-12 rounded-xl bg-secondary border-0"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Roll Number</label>
          <Input
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            disabled={!editing}
            placeholder="e.g., CS2024001"
            className="h-12 rounded-xl bg-secondary border-0"
          />
        </div>

        {editing && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      <div className="mt-8 space-y-3">
        <Button
          onClick={signOut}
          variant="outline"
          className="w-full h-12 rounded-xl border-destructive text-destructive font-semibold"
        >
          Sign Out
        </Button>
      </div>

      <p className="text-center text-[10px] text-muted-foreground py-6">
        CampusVote v1.0 • Made by <span className="font-semibold text-primary">Yash Pawar</span>
      </p>
    </div>
  );
};

export default ProfilePage;
