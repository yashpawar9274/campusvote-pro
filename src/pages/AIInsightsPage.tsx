import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Send } from "lucide-react";
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
      const { data, error } = await supabase.functions.invoke("ai-election-insights", {
        body: { question: question.trim() },
      });

      if (error) throw error;
      setAnswer(data.answer || "No response from AI");
    } catch (err: any) {
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
    <div className="px-4 pt-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold">AI Election Insights</h1>
          <p className="text-xs text-muted-foreground">Powered by AI</p>
        </div>
      </motion.div>

      {!answer && !loading && (
        <div className="space-y-2 mb-6">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Try asking:</p>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setQuestion(s); }}
              className="block w-full text-left text-sm glass-card rounded-xl p-3 text-foreground active:scale-[0.98] transition-transform"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold">Thinking...</span>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded animate-pulse w-full" />
            <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
            <div className="h-3 bg-muted rounded animate-pulse w-3/5" />
          </div>
        </div>
      )}

      {answer && !loading && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary">AI Response</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
        </motion.div>
      )}

      <div className="fixed bottom-20 left-0 right-0 px-4 max-w-lg mx-auto">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about elections..."
            onKeyDown={(e) => e.key === "Enter" && askAI()}
            className="h-12 rounded-xl bg-card border shadow-lg flex-1"
          />
          <button
            onClick={askAI}
            disabled={loading || !question.trim()}
            className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPage;
