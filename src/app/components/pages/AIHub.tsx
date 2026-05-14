import { Brain, Send, Sparkles, TrendingUp, FileText, AlertTriangle, DollarSign } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSidebar } from "../../context/SidebarContext";

type SuggestionColor = "orange" | "green" | "blue" | "purple";

type Message = {
  id: number;
  role: "user" | "ai";
  message: string;
  time: string;
  chartTitle?: string;
};

const suggestions: Array<{ id: number; text: string; icon: typeof AlertTriangle; color: SuggestionColor }> = [
  { id: 1, text: "Show me delayed projects", icon: AlertTriangle, color: "orange" },
  { id: 2, text: "Compare vendor pricing for steel", icon: DollarSign, color: "green" },
  { id: 3, text: "Generate site progress report for Downtown Tower", icon: FileText, color: "blue" },
  { id: 4, text: "Analyze budget vs actual spend", icon: TrendingUp, color: "purple" },
];

const initialConversation: Message[] = [
  {
    id: 1,
    role: "user",
    message: "Show me projects at risk of delay",
    time: "10:30 AM",
  },
  {
    id: 2,
    role: "ai",
    message: "I found 3 projects at risk of delay. Tech Park Phase 2 is the highest risk because material delivery is 12 days behind schedule. Metro Mall Expansion has weather drag on foundation work, and Downtown Tower Complex needs structural inspection closure within 5 days.",
    time: "10:30 AM",
    chartTitle: "Project Timeline Variance",
  },
];

function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function generateResponse(prompt: string) {
  const query = prompt.toLowerCase();

  if (query.includes("delay")) {
    return {
      message: "Current risk view: Tech Park Phase 2 is 12 days behind due to material shortage, Metro Mall Expansion is carrying weather risk, and Downtown Tower Complex needs inspection closeout this week.",
      chartTitle: "Delay Risk Summary",
    };
  }

  if (query.includes("vendor") || query.includes("pricing") || query.includes("steel")) {
    return {
      message: "Steel pricing is currently most competitive with MetalCorp Industries. Compared with the next two vendors, their average unit rate is 6% lower and on-time delivery is still above 90%.",
      chartTitle: "Vendor Pricing Comparison",
    };
  }

  if (query.includes("budget") || query.includes("spend")) {
    return {
      message: "Budget variance is concentrated in Tech Park Phase 2 and Metro Mall Expansion. Labor remains within target, but materials are trending 8% above plan across the active portfolio.",
      chartTitle: "Budget vs Actual Spend",
    };
  }

  if (query.includes("report") || query.includes("progress")) {
    return {
      message: "Site progress report generated for preview: structural works are advancing on Downtown Tower Complex, Riverside Residential is still in pre-construction review, and Green Valley Homes has moved into post-completion tracking.",
      chartTitle: "Weekly Progress Snapshot",
    };
  }

  return {
    message: "I can summarize delays, vendor performance, budgets, or progress reports. Try asking for a project risk view, cost variance, or procurement comparison.",
    chartTitle: "Suggested Next Actions",
  };
}

export function AIHub() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<Message[]>(initialConversation);
  const { setMode } = useSidebar();

  useEffect(() => {
    setMode("main");
  }, [setMode]);

  const liveInsights = useMemo(() => {
    const delayedSignals = conversation.filter((entry) => entry.message.toLowerCase().includes("delay")).length;
    const budgetSignals = conversation.filter((entry) => entry.message.toLowerCase().includes("budget")).length;
    return [
      { label: "High Priority", value: `${Math.max(3, delayedSignals)} active delay signals`, tone: "purple" },
      { label: "Cost Savings", value: budgetSignals > 0 ? "$45K savings opportunity identified" : "Budget review available on demand", tone: "blue" },
      { label: "On Track", value: "32 projects progressing within plan", tone: "green" },
      { label: "Procurement", value: "5 deliveries arriving tomorrow", tone: "orange" },
    ];
  }, [conversation]);

  const submitMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const time = getCurrentTime();
    const aiResponse = generateResponse(trimmed);

    setConversation((current) => [
      ...current,
      { id: Date.now(), role: "user", message: trimmed, time },
      {
        id: Date.now() + 1,
        role: "ai",
        message: aiResponse.message,
        time: getCurrentTime(),
        chartTitle: aiResponse.chartTitle,
      },
    ]);
    setMessage("");
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl">AI Assistant</h1>
            <p className="text-sm text-gray-600">AI-Powered Insights & Analysis</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;
                  const colorClasses = {
                    orange: "from-orange-500 to-orange-600",
                    green: "from-green-500 to-green-600",
                    blue: "from-blue-500 to-blue-600",
                    purple: "from-purple-500 to-purple-600",
                  }[suggestion.color];

                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => submitMessage(suggestion.text)}
                      className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm flex-1">{suggestion.text}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {conversation.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-3xl ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200"} rounded-2xl p-4`}>
                    <p className={`text-sm whitespace-pre-wrap ${msg.role === "ai" ? "text-gray-900" : ""}`}>
                      {msg.message}
                    </p>
                    {msg.chartTitle && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-2">Chart: {msg.chartTitle}</p>
                        <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-12 h-12 text-blue-600" />
                        </div>
                      </div>
                    )}
                    <p className={`text-xs mt-2 ${msg.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                      {msg.time}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm">
                      S
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask anything about your projects..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      submitMessage(message);
                    }
                  }}
                />
                <button
                  onClick={() => submitMessage(message)}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Try delays, vendor pricing, budget variance, or site progress prompts.
              </p>
            </div>
          </div>
        </div>

        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-auto">
          <h3 className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Live Insights
          </h3>

          <div className="space-y-3">
            {liveInsights.map((insight) => (
              <div
                key={insight.label}
                className={`p-3 rounded-lg border ${
                  insight.tone === "purple" ? "bg-purple-50 border-purple-200 text-purple-900" :
                  insight.tone === "blue" ? "bg-blue-50 border-blue-200 text-blue-900" :
                  insight.tone === "green" ? "bg-green-50 border-green-200 text-green-900" :
                  "bg-orange-50 border-orange-200 text-orange-900"
                }`}
              >
                <p className="text-xs mb-1">{insight.label}</p>
                <p className="text-sm">{insight.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => submitMessage("Generate weekly project report")}
                className="w-full px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
              >
                Generate Weekly Report
              </button>
              <button
                onClick={() => submitMessage("Analyze budget variance")}
                className="w-full px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
              >
                Analyze Budget Variance
              </button>
              <button
                onClick={() => submitMessage("Compare vendor performance")}
                className="w-full px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
              >
                Compare Vendor Performance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
