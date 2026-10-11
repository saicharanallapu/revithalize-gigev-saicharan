import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  User,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  MapPin,
  Fuel,
  IndianRupee,
} from 'lucide-react';
import { DeliveryPlatform } from '../types';
import { formatINR } from '../utils/formatters';

interface AdvisorMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

interface AiAdvisorPageProps {
  initialContext?: {
    city: string;
    platform: string;
    dailyKm: number;
    vehicleType: string;
    monthlyFuelSaved: number;
    ownershipModel: string;
  };
}

export const AiAdvisorPage: React.FC<AiAdvisorPageProps> = ({ initialContext }) => {
  // Context state
  const [city, setCity] = useState<string>(initialContext?.city || 'Bengaluru');
  const [platform, setPlatform] = useState<string>(initialContext?.platform || 'Zomato');
  const [dailyKm, setDailyKm] = useState<number>(initialContext?.dailyKm || 85);
  const [vehicleType, setVehicleType] = useState<string>(
    initialContext?.vehicleType || 'High-Speed Electric Scooter'
  );
  const [ownershipModel, setOwnershipModel] = useState<string>(
    initialContext?.ownershipModel || 'Loan EMI (NBFC)'
  );

  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Message conversation
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Namaste! I am **Revitalize EV Advisor**, your dedicated financial intelligence consultant for Indian gig delivery mobility.

I help riders on **Zomato, Swiggy, Zepto, Blinkit, and Porter** maximize their take-home earnings by cutting fuel expenses. 

You can ask me questions like:
- *"I ride 90 km/day in ${city}. Should I buy an Ather/Ola on EMI or use a battery swap scooter like Zypp?"*
- *"Can I get an EV loan without a formal salary slip or ITR?"*
- *"How does the PM E-DRIVE central subsidy apply to me at the dealership?"*
- *"What are the risks with battery degradation in Indian summers and monsoons?"*

Select a prompt below or type your custom scenario!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const presetQuestions = [
    `I deliver 90 km/day for ${platform} in ${city}. Is it better to buy on EMI or subscribe to a battery swap scooter?`,
    `Can I get an EV loan without traditional salary slips as a gig delivery partner?`,
    `How does the PM E-DRIVE subsidy affect my purchase price at the dealership?`,
    `How much extra income can I save per month if I switch from a Hero Splendor (50 kmpl) to an EV?`,
  ];

  const handleSendMessage = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || loading) return;

    const userMsg: AdvisorMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          city,
          platform,
          dailyKm,
          vehicleType,
          ownershipType: ownershipModel,
        }),
      });

      const json = await response.json();

      if (json.success && json.advice) {
        const assistantMsg: AdvisorMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: json.advice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: json.source,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: AdvisorMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Unable to complete financial simulation:** ${
            json.error || 'Server error'
          }. Please try again shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: AdvisorMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Connection failed: ${err.message}. Please verify the server is running.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simple Markdown-like renderer for AI advice
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return (
      <div className="space-y-2 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-sm sm:text-base font-extrabold text-slate-900 mt-2 mb-1">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-base font-extrabold text-slate-900 mt-2.5 mb-1">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const content = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 pl-1">
                <span className="text-emerald-600 font-bold">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
              </div>
            );
          }
          if (line.trim().length === 0) {
            return <div key={idx} className="h-1.5" />;
          }
          return (
            <p
              key={idx}
              className="text-xs sm:text-sm text-slate-700"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
            />
          );
        })}
      </div>
    );
  };

  const formatInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-600">$1</em>');
  };

  return (
    <div className="space-y-6 py-4 sm:py-8">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-5 space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <Bot className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Server-Side Gemini 3.8 Flash Engine
          </span>
          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
            Revitalize Mobility
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          AI EV Financial Advisor for Gig Workers
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
          Get hyper-specific financial guidance tailored to your exact city, delivery platform, daily kilometer count, and credit profile in Indian Rupees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Worker Profile Context Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Active Consultation Profile
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                Auto-Synced
              </span>
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">City:</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Pune">Pune</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Ahmedabad">Ahmedabad</option>
              </select>
            </div>

            {/* Platform */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Gig Delivery Platform:
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium"
              >
                <option value="Zomato">Zomato</option>
                <option value="Swiggy">Swiggy</option>
                <option value="Zepto">Zepto</option>
                <option value="Blinkit">Blinkit</option>
                <option value="Shadowfax">Shadowfax</option>
                <option value="Porter">Porter</option>
                <option value="Rapido">Rapido</option>
              </select>
            </div>

            {/* Daily Distance */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Daily Distance:</span>
                <span className="font-bold text-emerald-800">{dailyKm} km/day</span>
              </div>
              <input
                type="range"
                min="30"
                max="180"
                step="5"
                value={dailyKm}
                onChange={(e) => setDailyKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Vehicle Being Evaluated:
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium"
              >
                <option value="High-Speed Electric Scooter (Ather/Ola/TVS)">
                  High-Speed Electric Scooter (Ather/Ola/TVS)
                </option>
                <option value="Battery-Swap Scooter (Zypp/Battery Smart)">
                  Battery-Swap Scooter (Zypp/Battery Smart)
                </option>
                <option value="3W Cargo Electric Loader (Euler/Mahindra)">
                  3W Cargo Electric Loader (Euler/Mahindra)
                </option>
                <option value="Hero Splendor 110cc Petrol Comparison">
                  Hero Splendor 110cc Petrol Comparison
                </option>
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Financing Preference:
              </label>
              <select
                value={ownershipModel}
                onChange={(e) => setOwnershipModel(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium"
              >
                <option value="Loan EMI (NBFC / Specialized EV lender)">Loan EMI (NBFC)</option>
                <option value="Daily/Weekly Rental from Hub">Daily Rental / Lease</option>
                <option value="Full Upfront Cash Buy">Full Cash Buy</option>
                <option value="Battery-as-a-Service Subscription">Battery-as-a-Service (BaaS)</option>
              </select>
            </div>
          </div>

          {/* Quick FAQ / Prompt Starters */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 space-y-2">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide block">
              Suggested Questions:
            </span>
            <div className="space-y-1.5">
              {presetQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left p-2 rounded-lg bg-white border border-emerald-200/80 hover:bg-emerald-50 text-[11px] text-slate-700 font-medium transition-colors hover:text-emerald-950"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Consultation Interface (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[650px] bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm ${
                      isUser
                        ? 'bg-emerald-900 text-white rounded-tr-none'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      renderFormattedText(msg.text)
                    )}

                    <div
                      className={`flex items-center justify-between pt-2 mt-2 border-t text-[10px] ${
                        isUser
                          ? 'border-emerald-800 text-emerald-300'
                          : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <div className="flex items-center gap-2">
                          {msg.source && (
                            <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                              Engine: {msg.source}
                            </span>
                          )}
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="hover:text-slate-700 transition-colors flex items-center gap-1"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4 text-xs text-slate-600 flex items-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>Computing financial projections for {platform} in {city}...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/70">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask financial question (e.g. 'Is buying Ather on EMI better than renting for 80km/day?')..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={loading}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
              <button
                type="submit"
                disabled={loading || !inputQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="text-[10px] text-slate-400 mt-2 text-center">
              AI advice is for financial assessment purposes. Subsidies & loan approvals depend on official RTO & bank underwriting.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
