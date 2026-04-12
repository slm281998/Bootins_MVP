import { useState, useRef, useEffect } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis ton tuteur Bootins. Comment puis-je t'aider dans ton apprentissage aujourd'hui ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("api/chatbot/message/", { message: input });
      
      const aiMessage = { 
        role: "assistant", 
        content: response.data.reply || response.data.message 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Désolé, j'ai une petite panne technique. Réessaie dans un instant !" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* RESPONSIVE: Positionnement ajusté (bottom-4 sur mobile, bottom-6 sur desktop) */
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60] flex flex-col items-end">
      
      {/* Fenêtre de Chat */}
      {isOpen && (
        <div className={cn(
          "mb-4 flex flex-col bg-white rounded-3xl shadow-2xl border overflow-hidden animate-in slide-in-from-bottom-5",
          /* RESPONSIVE: Largeur adaptative (100% de la largeur - marges) sur mobile */
          "w-[calc(100vw-2rem)] sm:w-80 md:w-96",
          /* RESPONSIVE: Hauteur un peu plus courte sur mobile */
          "h-[450px] md:h-[500px]"
        )}>
          {/* Header */}
          <div className="bg-primary p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold text-sm md:text-base">Assistance IA Bootins</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Zone des messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
            {messages.map((msg, index) => (
              <div key={index} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
                  msg.role === "user" 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start italic text-slate-400 text-[10px] md:text-xs items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> Le tuteur réfléchit...
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 md:p-4 border-t flex gap-2 bg-white shrink-0">
            <Input 
              placeholder="Pose ta question..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button type="submit" size="icon" disabled={loading} className="rounded-xl shrink-0">
              <Send size={18} />
            </Button>
          </form>
        </div>
      )}

      {/* Bouton Flottant principal */}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "rounded-full shadow-xl hover:scale-110 transition-all active:scale-95",
          /* RESPONSIVE: Taille légèrement plus petite sur mobile */
          "h-12 w-12 md:h-14 md:w-14"
        )}
      >
        {isOpen ? <X size={24} md:size={28} /> : <MessageCircle size={24} md:size={28} />}
      </Button>
    </div>
  );
}