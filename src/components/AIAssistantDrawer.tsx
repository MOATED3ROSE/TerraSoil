import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  ShieldAlert, 
  Mail, 
  Check, 
  MessageSquare,
  User,
  ArrowRight,
  RefreshCw,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Farm, Field, UserPersona } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  places?: Array<{
    title: string;
    uri: string;
    snippets?: string[];
  }>;
  groundedWithMaps?: boolean;
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: UserPersona;
  currentFarm: Farm;
  selectedField: Field | null;
  onOpenPdfGuide?: () => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activePersona,
  currentFarm,
  selectedField,
  onOpenPdfGuide,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your TerraSoil assistant. Whether you're a farmer exploring carbon grants, an agronomist managing client operations, or an ag-supply corporate buyer tracking Scope 3 insetting, I can help you navigate our field mapping, satellite NDVI metrics, practice logging, and compliance reports.\n\nNow enhanced with live Google Maps Grounding for finding local soil labs, extension services, and ag retailers!\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [useMapsGrounding, setUseMapsGrounding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt chips based on persona
  const getPromptSuggestions = () => {
    if (activePersona === 'farmer') {
      return [
        'How much will I get paid for switching to no-till?',
        'How do I draw my field boundaries on the map?',
        'Is your carbon estimate certified for grants?',
        'Explain Soil Organic Carbon (SOC) in simple words',
      ];
    }
    if (activePersona === 'agronomist') {
      return [
        "What's the difference between Basic and Professional plans?",
        'Can I put my consulting firm logo on the PDF reports?',
        'How does Sentinel-2 NDVI verify cover crops?',
        'How are emission factors calculated under USDA COMET-Farm?',
      ];
    }
    if (activePersona === 'corporate') {
      return [
        'How does TerraSoil support Scope 3 corporate ag-supply insetting?',
        'Are the carbon numbers audit-ready for ESG reporting?',
        'What emission factors does the platform use?',
        'How do I connect our supplier farms to the portal?',
      ];
    }
    // Auditor / Verifier role suggestions
    return [
      'How does the ISO 14064-3 verification workflow operate?',
      'How do I review the cryptographic SHA-256 data lineage?',
      'Where can I log a non-conformance finding for a field?',
      'What evidence is required for limited vs reasonable assurance?',
    ];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          useMapsGrounding,
          latitude: selectedField?.centroid ? selectedField.centroid[0] : 42.06,
          longitude: selectedField?.centroid ? selectedField.centroid[1] : -93.58,
          context: {
            activePersona,
            farmName: currentFarm.name,
            totalAcreage: currentFarm.totalAcreage,
            selectedField: selectedField
              ? {
                  name: selectedField.name,
                  acreage: selectedField.acreage,
                  crop: selectedField.cropType,
                  soc: selectedField.baselineSOCPct,
                  ndvi: selectedField.currentNDVI,
                  practicesCount: selectedField.practices.length,
                }
              : null,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'I could not generate a response. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        places: data.places,
        groundedWithMaps: data.groundedWithMaps,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      // Local fallback adhering strictly to prompt instructions
      let fallback = '';
      const lower = text.toLowerCase();

      if (lower.includes('paid') || lower.includes('payout') || lower.includes('money')) {
        fallback = `That depends on the specific carbon-credit program or grant you're applying through (such as USDA NRCS EQIP or private carbon markets) — we don't set payout amounts. What TerraSoil does is estimate your carbon sequestration based on your logged practices, which you can use as supporting audit documentation. Want me to walk you through how the estimator works?`;
      } else if (lower.includes('difference') || lower.includes('plan') || lower.includes('pricing')) {
        fallback = `Basic (~$39–49/mo or $0.50/acre/yr) is built for an individual farmer tracking their own fields — including mapping, satellite monitoring, and carbon estimates. Professional (~$199/mo) is designed for agronomists and consultants managing multiple client farms — it adds unlimited fields, team seats, and branded PDF reports with your own firm logo. Which sounds closer to your situation?`;
      } else if (lower.includes('certified') || lower.includes('verification')) {
        fallback = `No — our carbon figures are estimates based on standard agronomic emission factors (like USDA COMET-Farm and IPCC Tier 1 defaults), not certified measurements. If you need certified verification for a formal offset credit registry, that typically requires an accredited third-party physical soil core audit, and our downloadable MRV report is built to fit cleanly into that verification workflow.`;
      } else if (lower.includes('soc') || lower.includes('ndvi')) {
        fallback = `Soil Organic Carbon (SOC) is the measurable carbon stored in your soil — higher SOC means richer soil biology and superior water retention. NDVI (Normalized Difference Vegetation Index) is a satellite-derived measure of vegetation health and greenness (from Sentinel-2) that confirms live cover crop growth and residue retention throughout the year.`;
      } else {
        fallback = `TerraSoil provides map-based field tracking, Sentinel-2 NDVI monitoring, practice logging, and carbon sequestration estimates using USDA COMET-Farm and IPCC Tier 1 factors. For specific customer account issues or custom enterprise Scope 3 integrations, please contact our team at support@terrasoil.ag or enterprise@terrasoil.ag.`;
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800/80">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              TerraSoil On-Site Advisor
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-stone-400">
              Agronomic MRV Guidance &bull; Mode: <strong className="text-emerald-400 capitalize">{activePersona}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-200 p-2 rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Notice / Guardrail Banner */}
      <div className="bg-stone-950/60 px-4 py-2 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-400">
        <div className="flex items-center gap-1.5 min-w-0">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">
            Provides platform guidance &amp; estimates. Not a substitute for a certified agronomist.
          </span>
        </div>
        {onOpenPdfGuide && (
          <button
            type="button"
            onClick={onOpenPdfGuide}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-stone-900 border border-emerald-800/80 px-2 py-0.5 rounded-lg transition"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>AI Guide (PDF)</span>
          </button>
        )}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-stone-400">
              {m.role === 'user' ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-stone-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">TerraSoil Assistant</span>
                </>
              )}
              <span>&bull; {m.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-stone-950 text-stone-200 border border-stone-800 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {m.content}

              {/* Render Google Maps Grounded Places and Links */}
              {m.places && m.places.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      Google Maps Places ({m.places.length})
                    </span>
                    <span className="text-[9px] text-stone-400 font-mono">gemini-3.5-flash</span>
                  </div>

                  <div className="space-y-1.5">
                    {m.places.map((place, pIdx) => (
                      <a
                        key={pIdx}
                        href={place.uri || `https://www.google.com/maps/search/${encodeURIComponent(place.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-emerald-600/70 transition block space-y-1 group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-stone-100 group-hover:text-emerald-400 transition truncate">
                            {place.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-emerald-400 transition shrink-0 ml-1" />
                        </div>
                        {place.snippets && place.snippets.length > 0 && (
                          <p className="text-[10px] text-stone-400 italic line-clamp-2">
                            &ldquo;{place.snippets[0]}&rdquo;
                          </p>
                        )}
                        <span className="text-[10px] text-emerald-400 font-medium block">
                          Open in Google Maps ↗
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-stone-400 text-xs py-2 pl-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Consulting agronomic knowledge base...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 bg-stone-950/80 border-t border-stone-800/80">
        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
          Suggested Topics ({activePersona} view):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {getPromptSuggestions().map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s)}
              className="text-left text-[11px] bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-emerald-300 px-2.5 py-1.5 rounded-lg transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Human Escalation Direct Contacts */}
      <div className="px-4 py-2 bg-stone-950 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
        <span>Need human help?</span>
        <div className="flex items-center gap-3">
          <a
            href="mailto:support@terrasoil.ag"
            className="text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Mail className="w-3 h-3" /> support@terrasoil.ag
          </a>
          <span className="text-stone-700">|</span>
          <a
            href="mailto:enterprise@terrasoil.ag"
            className="text-emerald-400 hover:underline"
          >
            Sales
          </a>
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-stone-950 border-t border-stone-800 space-y-2"
      >
        <div className="flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setUseMapsGrounding(!useMapsGrounding)}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition text-[10px] ${
              useMapsGrounding
                ? 'bg-rose-950 text-rose-300 border border-rose-700 shadow-sm'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
            title="Ground queries with Google Maps places using gemini-3.5-flash"
          >
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>Maps Grounding: {useMapsGrounding ? 'ON' : 'Auto'}</span>
          </button>
          <span className="text-stone-400 text-[10px] font-mono">gemini-3.5-flash &bull; Google Maps</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={useMapsGrounding ? "Search agricultural places, soil testing labs, extension offices..." : "Ask about practices, carbon estimates, or pricing..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white p-2 rounded-xl transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
