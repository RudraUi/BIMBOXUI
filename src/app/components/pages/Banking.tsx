import { DollarSign, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useEffect } from "react";
import { useSidebar } from "../../context/SidebarContext";

export function Banking() {
  const { setMode } = useSidebar();

  useEffect(() => {
    setMode("main");
  }, [setMode]);
  const accounts = [
    { id: 1, name: "Operating Account", balance: "$450,250", type: "Checking", bank: "First National Bank" },
    { id: 2, name: "Project Reserve", balance: "$1,200,000", type: "Savings", bank: "Commerce Bank" },
    { id: 3, name: "Payroll Account", balance: "$180,500", type: "Checking", bank: "First National Bank" },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "debit",
      description: "Material Purchase - BuildMart Supplies",
      amount: "$12,500",
      date: "2026-04-22",
      category: "Procurement",
    },
    {
      id: 2,
      type: "credit",
      description: "Client Payment - Downtown Tower",
      amount: "$85,000",
      date: "2026-04-21",
      category: "Revenue",
    },
    {
      id: 3,
      type: "debit",
      description: "Payroll - April 2026",
      amount: "$45,600",
      date: "2026-04-20",
      category: "Payroll",
    },
    {
      id: 4,
      type: "debit",
      description: "Equipment Rental - Construction Equipment Co",
      amount: "$8,200",
      date: "2026-04-19",
      category: "Equipment",
    },
    {
      id: 5,
      type: "credit",
      description: "Client Payment - Riverside Residential",
      amount: "$42,000",
      date: "2026-04-18",
      category: "Revenue",
    },
  ];

  const stats = [
    { label: "Total Balance", value: "$1,830,750", change: "+12.5%", trend: "up" },
    { label: "Monthly Income", value: "$127,000", change: "+8.2%", trend: "up" },
    { label: "Monthly Expenses", value: "$66,300", change: "-3.1%", trend: "down" },
    { label: "Net Profit", value: "$60,700", change: "+15.4%", trend: "up" },
  ];

  return (
    <div className="h-screen overflow-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Banking</h1>
        <p className="text-gray-600">Manage financial accounts and transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Accounts */}
      <div className="mb-8">
        <h2 className="text-xl mb-4">Bank Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-blue-100 text-sm mb-1">{account.type}</p>
                  <h3 className="text-xl">{account.name}</h3>
                </div>
                <CreditCard className="w-8 h-8 text-blue-200" />
              </div>
              <div className="mb-2">
                <p className="text-blue-100 text-xs mb-1">Available Balance</p>
                <p className="text-3xl">{account.balance}</p>
              </div>
              <p className="text-blue-100 text-sm">{account.bank}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {transaction.type === "credit" ? (
                      <ArrowDownRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-900 mb-1">{transaction.description}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{transaction.date}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        {transaction.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`text-lg ${
                  transaction.type === "credit" ? "text-green-600" : "text-red-600"
                }`}>
                  {transaction.type === "credit" ? "+" : "-"}{transaction.amount}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
