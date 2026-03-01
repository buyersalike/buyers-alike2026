import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Bot, SkipForward } from "lucide-react";

const QUESTIONS = [
  {
    id: "location",
    bot: "Great choices! 🎉 Now, where are you based?",
    placeholder: "e.g., Toronto, Canada",
    field: "location",
    type: "input",
    required: true,
  },
  {
    id: "investment_range",
    bot: "Nice! What's your typical investment range for opportunities? 💰",
    placeholder: "e.g., $50,000 - $500,000",
    field: "investment_range",
    type: "input",
    required: false,
  },
  {
    id: "partnership_goals",
    bot: "What are your primary partnership goals? 🤝",
    placeholder: "e.g., Joint ventures, co-investing in real estate, scaling a franchise...",
    field: "partnership_goals",
    type: "textarea",
    required: false,
  },
  {
    id: "bio",
    bot: "Almost done! Tell us a bit about yourself — this is what others will see on your profile. 💬",
    placeholder: "e.g., Serial entrepreneur looking for strategic partnerships in tech...",
    field: "bio",
    type: "textarea",
    required: true,
  },
];

export default function ProfileChat({ onNext, userData }) {
  const [messages, setMessages] = useState([
    { type: "bot", text: "You're doing amazing! Let's add a few more details to help you stand out. 🌟" }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(prev => [...prev, { type: "bot", text: QUESTIONS[0].bot }]);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const advance = (newAnswers) => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < QUESTIONS.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { type: "bot", text: QUESTIONS[nextQuestion].bot }]);
        setCurrentQuestion(nextQuestion);
      }, 500);
    } else {
      setDone(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: "bot",
          text: "Perfect! 🎊 You're all set. Let's find some opportunities for you..."
        }]);
        // Pass all collected answers to parent
        setTimeout(() => onNext(newAnswers), 1500);
      }, 500);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const question = QUESTIONS[currentQuestion];
    setMessages(prev => [...prev, { type: "user", text: userInput }]);
    const newAnswers = { ...answers, [question.field]: userInput };
    setAnswers(newAnswers);
    setUserInput("");
    advance(newAnswers);
  };

  const handleSkip = () => {
    setMessages(prev => [...prev, { type: "user", text: "Skipped ⏭" }]);
    // Pass current answers unchanged (no new field added for skipped question)
    advance(answers);
  };

  const question = QUESTIONS[currentQuestion];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-3xl"
    >
      <div className="p-8 rounded-3xl flex flex-col" style={{ background: '#fff', border: '2px solid #000', height: '600px' }}>
        {/* Chat Header */}
        <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: '2px solid #000' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#D8A11F' }}>
            <Bot className="w-6 h-6" style={{ color: '#fff' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold" style={{ color: '#000' }}>BuyersAlike Assistant</h3>
            <p className="text-sm" style={{ color: '#666' }}>
              Question {Math.min(currentQuestion + 1, QUESTIONS.length)} of {QUESTIONS.length}
            </p>
          </div>
          {/* Mini progress dots */}
          <div className="flex gap-1.5">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i <= currentQuestion ? '#D8A11F' : '#ddd' }}
              />
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.type === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'
                  }`}
                  style={{
                    background: message.type === 'user' ? '#D8A11F' : '#f5f5f5',
                    color: message.type === 'user' ? '#fff' : '#000',
                    border: message.type === 'user' ? 'none' : '1px solid #ddd'
                  }}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        {!done && currentQuestion < QUESTIONS.length && (
          <form onSubmit={handleSubmit} className="space-y-2">
            {question.type === 'input' ? (
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={question.placeholder}
                className="text-base"
                style={{ background: '#fff', border: '2px solid #000', color: '#000' }}
                autoFocus
              />
            ) : (
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={question.placeholder}
                className="text-base resize-none"
                style={{ background: '#fff', border: '2px solid #000', color: '#000' }}
                rows={3}
                autoFocus
              />
            )}
            <div className="flex gap-2">
              {!question.required && (
                <Button
                  type="button"
                  onClick={handleSkip}
                  variant="outline"
                  className="gap-1.5"
                  style={{ borderColor: '#ddd', color: '#666' }}
                >
                  <SkipForward className="w-4 h-4" />
                  Skip
                </Button>
              )}
              <Button
                type="submit"
                disabled={!userInput.trim()}
                className="flex-1 py-5 rounded-xl gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                style={{ background: '#D8A11F', color: '#fff' }}
              >
                {currentQuestion === QUESTIONS.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}