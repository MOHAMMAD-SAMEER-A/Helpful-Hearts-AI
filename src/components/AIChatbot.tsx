import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import chatbotIcon from "@/assets/chatbot-icon.png";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your caring AI assistant. 💙 How can I help you today? I can guide you through getting help, volunteering, or answer any questions you have.",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: input },
      {
        role: "assistant",
        content: "Thank you for reaching out! While I'm a demo chatbot, in a full version I would help you with personalized guidance, connect you with resources, or assist in finding the right community support. Would you like to fill out a help request form or volunteer form?",
      },
    ];

    setMessages(newMessages);
    setInput("");
  };

  return (
    <>
      {/* Chatbot Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="hero"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 hover:scale-110 transition-transform"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <img src={chatbotIcon} alt="AI Assistant" className="h-8 w-8" />
        )}
      </Button>

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] shadow-2xl z-40 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-warm rounded-t-lg">
            <div className="flex items-center gap-3">
              <img src={chatbotIcon} alt="AI Assistant" className="h-10 w-10" />
              <div className="flex-1">
                <h3 className="font-semibold text-primary-foreground">AI Care Assistant</h3>
                <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Here to help with kindness
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button onClick={handleSend} variant="hero" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default AIChatbot;
