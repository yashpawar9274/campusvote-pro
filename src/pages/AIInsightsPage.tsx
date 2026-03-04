import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Send, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const AIInsightsPage = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-election-insights", { body: { question: question.trim() } });
      if (error) throw error;
      setAnswer(data.answer || "No response from AI");
    } catch {
      setAnswer("Failed to get AI insights. Please try again.");
    }
    setLoading(false);
  };

  const suggestions = [
    "What makes a good CR candidate?",
    "Tips for fair elections in college",
    "How to increase voter turnout?",
    "Key responsibilities of a Class Representative",
  ];

  return (
    <div>
      <div className="gradient-header px-5 pt-6 pb-8 rounded-b-[2rem]">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-white/70 mb-4 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">AI Election Insights</h1>
            <p className="text-[11px] text-white/50 font-medium">Powered by AI</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4">
        {!answer && !loading && (
          <div className="space-y-2 mb-6">
            <p className="text-[11px] text-muted-foreground font-bold mb-2 flex items-center gap-1.5"><MessageCircle className="w-3 h-3" /> Try asking:</p>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuestion(s)}
                className="block w-full text-left text-sm glass-card-elevated rounded-xl p-3.5 text-foreground active:scale-[0.98] transition-transform font-medium"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="glass-card-elevated rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-bold">Thinking...</span>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded-lg animate-pulse w-full" />
              <div className="h-3 bg-muted rounded-lg animate-pulse w-4/5" />
              <div className="h-3 bg-muted rounded-lg animate-pulse w-3/5" />
            </div>
          </div>
        )}

        {answer && !loading && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card-elevated rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-primary">AI Response</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-5 max-w-lg mx-auto">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about elections..."
            onKeyDown={(e) => e.key === "Enter" && askAI()}
            className="h-12 rounded-xl bg-card border border-border/50 shadow-xl flex-1 font-medium"
          />
          <button
            onClick={askAI}
            disabled={loading || !question.trim()}
            className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-xl disabled:opacity-50 active:scale-95 transition-transform"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPage;
