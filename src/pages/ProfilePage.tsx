import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { User, Edit2, LogOut, BookOpen, GraduationCap, Hash, Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user?.id || "").maybeSingle();
    if (data) { setProfile(data); setFullName(data.full_name || ""); setDepartment(data.department || ""); setYear(data.year || ""); setRollNumber(data.roll_number || ""); }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, department, year, roll_number: rollNumber }).eq("user_id", user?.id || "");
    if (error) toast.error("Failed to update profile");
    else { toast.success("Profile updated!"); setEditing(false); fetchProfile(); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="px-5 pt-6">
        <div className="h-32 bg-muted rounded-2xl animate-pulse mb-4" />
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
      </div>
    );
  }

  const fields = [
    { label: "Full Name", value: fullName, setter: setFullName, placeholder: "Your full name", icon: User },
    { label: "Department", value: department, setter: setDepartment, placeholder: "e.g., Computer Science", icon: BookOpen },
    { label: "Year", value: year, setter: setYear, placeholder: "e.g., 3rd Year", icon: GraduationCap },
    { label: "Roll Number", value: rollNumber, setter: setRollNumber, placeholder: "e.g., CS2024001", icon: Hash },
  ];

  return (
    <div>
      {/* Profile Header */}
      <div className="gradient-header px-5 pt-6 pb-12 rounded-b-[2rem] text-center">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-extrabold text-white">Profile</h1>
          <button onClick={() => setEditing(!editing)} className="text-white/80 text-xs font-bold flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
            <Edit2 className="w-3 h-3" /> {editing ? "Cancel" : "Edit"}
          </button>
        </div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border-2 border-white/20 shadow-xl mb-3">
            <User className="w-9 h-9 text-white" />
          </div>
          <h2 className="font-extrabold text-lg text-white">{profile?.full_name || "Student"}</h2>
          <p className="text-sm text-white/50 mt-0.5">{user?.email}</p>
        </motion.div>
      </div>

      <div className="px-5 -mt-6">
        <div className="glass-card-elevated rounded-2xl p-5 space-y-4">
          {fields.map((field) => (
            <div key={field.label}>
              <label className="text-[11px] font-bold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <field.icon className="w-3 h-3" /> {field.label}
              </label>
              <Input
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                disabled={!editing}
                placeholder={field.placeholder}
                className="h-12 rounded-xl bg-muted/50 border-0 font-medium disabled:opacity-70"
              />
            </div>
          ))}

          {editing && (
            <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl gradient-primary text-white font-bold shadow-lg">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <div className="mt-5 glass-card-elevated rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              {isDarkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Dark Mode</p>
              <p className="text-[11px] text-muted-foreground">{isDarkMode ? "Dark theme active" : "Light theme active"}</p>
            </div>
          </div>
          <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
        </div>

        <div className="mt-4">
          <Button onClick={signOut} variant="outline" className="w-full h-12 rounded-xl border-destructive/30 text-destructive font-bold hover:bg-destructive/5 flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground py-6">
          CampusVote v1.0 • Made by <span className="font-bold text-primary">Yash Pawar</span>
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
