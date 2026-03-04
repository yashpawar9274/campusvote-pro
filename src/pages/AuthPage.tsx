import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import campusVoteLogo from "@/assets/campusvote-logo.png";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
      else toast.success("Welcome back!");
    } else {
      if (!fullName.trim()) { toast.error("Please enter your full name"); setLoading(false); return; }
      const { error } = await signUp(email, password, fullName);
      if (error) toast.error(error.message);
      else toast.success("Check your email to verify your account!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gradient-hero relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px]" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="flex flex-col items-center mb-10 relative z-10"
      >
        <div className="relative">
          <img src={campusVoteLogo} alt="CampusVote" className="w-24 h-24 rounded-3xl mb-5 shadow-2xl ring-2 ring-white/10" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-gradient tracking-tight">CampusVote</h1>
        <p className="text-muted-foreground text-sm mt-2 font-medium">Your voice, your choice</p>
      </motion.div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="glass-card-elevated rounded-3xl p-6">
          {/* Tab switcher */}
          <div className="flex mb-6 bg-muted/50 rounded-2xl p-1">
            {["Sign In", "Sign Up"].map((label, idx) => {
              const active = idx === 0 ? isLogin : !isLogin;
              return (
                <button
                  key={label}
                  onClick={() => setIsLogin(idx === 0)}
                  className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
                >
                  {active && (
                    <motion.div layoutId="auth-tab" className="absolute inset-0 gradient-primary rounded-xl shadow-md" transition={{ type: "spring", duration: 0.5 }} />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div key="name" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <Input
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 rounded-xl bg-muted/50 border-0 text-foreground placeholder:text-muted-foreground font-medium"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              type="email" placeholder="College Email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="h-12 rounded-xl bg-muted/50 border-0 text-foreground placeholder:text-muted-foreground font-medium"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="h-12 rounded-xl bg-muted/50 border-0 pr-12 text-foreground placeholder:text-muted-foreground font-medium"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit" disabled={loading}
              className="w-full h-12 rounded-xl gradient-primary text-white font-bold text-base shadow-lg hover:shadow-xl transition-all group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-8">
          Made by <span className="font-bold text-primary">Yash Pawar</span>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
