import { useState, useEffect } from "react";
import {
  X,
  User,
  Bell,
  ShoppingBag,
  CreditCard,
  Lock,
  Sliders,
  HelpCircle,
  LogOut,
  Check,
  Trash2,
  ChevronRight,
  ArrowLeft,
  MessageSquare,
  Phone,
  Shield,
  Volume2,
  Calendar,
  Send,
  Loader2,
  Monitor,
  Laptop
} from "lucide-react";
import { toast } from "sonner";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  onLogout?: () => void;
}

export function ProfileModal({ isOpen, onClose, initialTab = "profile", onLogout }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<string>("profile");
  
  // Nested sub-views
  const [securityView, setSecurityView] = useState<"main" | "change-password" | "sessions">("main");
  const [helpView, setHelpView] = useState<"main" | "live-chat" | "call-support">("main");

  // User Profile editable state
  const [userInfo, setUserInfo] = useState({
    fullName: "Rudra Narayan Dash",
    email: "rudra@bimbox.ai",
    phone: "+91 78344 48689",
    organization: "BIMBOX Technologies",
    role: "Project Manager"
  });
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New Model uploaded", desc: "Forge project 'Tower Block A' was updated by Arjun S.", time: "2 mins ago", unread: true },
    { id: 2, text: "File Transfer done", desc: "BIM export package (123 MB) transferred successfully", time: "2 mins ago", unread: false },
    { id: 3, text: "Image Upload complete", desc: "Profile picture updated successfully", time: "1 min ago", unread: false },
    { id: 4, text: "Document Review", desc: "Contract draft reviewed with comments added", time: "5 mins ago", unread: false },
    { id: 5, text: "Meeting Reminder", desc: "Project kickoff meeting scheduled for tomorrow at 10 AM", time: "10 mins ago", unread: false },
    { id: 6, text: "Backup Completed", desc: "Full system backup completed without errors", time: "15 mins ago", unread: false },
    { id: 7, text: "User Registration", desc: "New user registered: John Doe", time: "20 mins ago", unread: false }
  ]);

  // Orders State
  const [orders] = useState([
    { id: "ORD-2841", name: "BIM Starter Pack", date: "Mar 8, 2026", price: "₹4,999", status: "Active" },
    { id: "ORD-2840", name: "BIM Starter Pack", date: "Feb 8, 2026", price: "₹4,999", status: "Completed" },
    { id: "ORD-2839", name: "BIM Starter Pack", date: "Jan 8, 2026", price: "₹4,999", status: "Pending" },
    { id: "ORD-2838", name: "BIM Starter Pack", date: "Dec 8, 2025", price: "₹4,999", status: "Cancelled" }
  ]);

  // Payment History State
  const [payments] = useState([
    { id: "TXN-90182", date: "Mar 8, 2026", method: "Visa **** 4242", amount: "₹4,999", status: "Success" },
    { id: "TXN-90181", date: "Feb 8, 2026", method: "Visa **** 4242", amount: "₹4,999", status: "Success" },
    { id: "TXN-90180", date: "Jan 8, 2026", method: "Visa **** 4242", amount: "₹4,999", status: "Success" }
  ]);

  // Security Sub-states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: "Chrome - Windows 11", location: "Bhubaneswar, IN", active: true },
    { id: 2, device: "Safari - iOS 16", location: "Bhubaneswar, IN", active: false }
  ]);

  // Preferences state
  const [preferences, setPreferences] = useState({
    appearance: "Light",
    language: "English",
    timezone: "Asia/Kolkata (IST)",
    dateFormat: "DD/MM/YYYY"
  });
  const [timezonePickerOpen, setTimezonePickerOpen] = useState(false);
  const [dateFormatPickerOpen, setDateFormatPickerOpen] = useState(false);

  // FAQs State (opened accordions)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Live Chat state
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "bot", text: "Hello Rudra! Welcome to BIMBOX support. How can I help you coordinate your clash files today?", time: "11:20 AM" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Set tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSecurityView("main");
      setHelpView("main");
      setEditField(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleEditClick = (field: keyof typeof userInfo) => {
    setEditField(field);
    setEditValue(userInfo[field]);
  };

  const handleSaveField = (field: keyof typeof userInfo) => {
    setUserInfo(prev => ({ ...prev, [field]: editValue }));
    setEditField(null);
    toast.success(`${field.replace(/([A-Z])/g, " $1")} updated successfully`);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    toast.success("Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSecurityView("main");
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botResponses = [
        "We are analyzing the model clash logs. Checking Forge client endpoints...",
        "Your payment transaction ORD-2841 is currently active and sound.",
        "To sync your calendar, go to Feed Preferences or set up a Slack integration webhook.",
        "I've registered your query. A technical lead will coordinate with you shortly."
      ];
      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-4xl h-[600px] bg-white rounded-3xl overflow-hidden shadow-2xl flex border border-slate-200">
        
        {/* LEFT PROFILE SIDEBAR */}
        <div className="w-64 bg-slate-50 border-r border-slate-205 flex flex-col justify-between p-5 text-left shrink-0">
          <div className="space-y-6">
            {/* Header / Avatar */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                RN
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black text-slate-800 truncate">{userInfo.fullName}</h3>
                <span className="text-[10px] text-slate-400 font-bold block truncate">{userInfo.email}</span>
              </div>
            </div>

            {/* Sidebar Navigation items */}
            <div className="space-y-1.5">
              {[
                { id: "profile", label: "Profile Info", icon: User },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "orders", label: "My Orders", icon: ShoppingBag },
                { id: "payments", label: "Payment History", icon: CreditCard },
                { id: "security", label: "Security", icon: Lock },
                { id: "preferences", label: "Preference", icon: Sliders },
                { id: "help", label: "Help & Support", icon: HelpCircle }
              ].map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSecurityView("main");
                      setHelpView("main");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-650 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <button
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer border border-transparent"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* RIGHT PANEL CONTENT */}
        <div className="flex-1 bg-white p-8 overflow-y-auto text-left relative flex flex-col justify-between">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-slate-105 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* DYNAMIC VIEWS */}
          <div className="flex-1">
            
            {/* TAB 1: PROFILE INFO */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-black text-slate-805">Profile Info</h2>
                  
                  {/* Large Avatar Card */}
                  <div className="flex items-center gap-4 mt-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xl shadow-lg shadow-blue-500/10">
                        RN
                      </div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-black text-slate-800 leading-none">{userInfo.fullName}</h3>
                      <span className="text-xs text-slate-400 font-semibold block mt-1">{userInfo.email}</span>
                      <span className="text-[10px] text-green-500 font-bold block mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Online
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-4 max-w-xl">
                  {[
                    { key: "fullName", label: "Full Name", editable: true },
                    { key: "email", label: "Email", editable: false },
                    { key: "phone", label: "Phone", editable: true },
                    { key: "organization", label: "Organization", editable: true },
                    { key: "role", label: "Role", editable: true }
                  ].map((field) => {
                    const isEditing = editField === field.key;
                    return (
                      <div key={field.key} className="flex items-center justify-between py-1.5 border-b border-slate-50 min-h-[44px]">
                        <div className="w-1/3 text-xs font-semibold text-slate-400">
                          {field.label}
                        </div>
                        <div className="flex-1 flex items-center justify-between gap-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full px-3 py-1 bg-slate-50 border border-slate-205 rounded-lg text-xs font-semibold focus:bg-white focus:outline-hidden"
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-800">
                              {(userInfo as any)[field.key]}
                            </span>
                          )}

                          {field.editable && (
                            <div className="shrink-0">
                              {isEditing ? (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleSaveField(field.key as any)}
                                    className="h-6 px-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditField(null)}
                                    className="h-6 px-2.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-slate-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleEditClick(field.key as any)}
                                  className="h-6 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-slate-805">Notifications</h2>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Your recent activity and alerts</p>
                </div>

                <div className="space-y-2.5 max-w-2xl mt-4 max-h-[380px] overflow-y-auto pr-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                        notif.unread
                          ? "bg-blue-50/20 border-blue-100 hover:border-blue-200"
                          : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3 text-left min-w-0">
                        {notif.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-800">{notif.text}</h4>
                          <p className="text-[10px] text-slate-450 font-semibold mt-0.5 leading-normal">{notif.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[8.5px] text-slate-400 font-bold">{notif.time}</span>
                        <div className="flex gap-1.5">
                          {notif.unread && (
                            <button
                              onClick={() => {
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                                toast.success("Marked as read");
                              }}
                              className="w-5.5 h-5.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-blue-600 cursor-pointer"
                              title="Mark read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setNotifications(prev => prev.filter(n => n.id !== notif.id));
                              toast.success("Notification cleared");
                            }}
                            className="w-5.5 h-5.5 rounded-lg border border-red-100 bg-red-50/30 hover:bg-red-50 flex items-center justify-center text-red-650 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-xs font-bold">
                      No notifications found.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: MY ORDERS */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-slate-805">My Orders</h2>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">All your product purchases and subscriptions</p>
                </div>

                <div className="space-y-3 mt-5 max-w-2xl max-h-[380px] overflow-y-auto pr-2">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/20 text-left flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-850">{order.name}</h4>
                          <span className="text-[9px] text-slate-400 font-bold">{order.id} - {order.date}</span>
                        </div>
                        <span className="text-xs font-extrabold text-blue-600 block">{order.price}</span>
                      </div>
                      
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                        order.status === "Active"
                          ? "bg-green-50 text-green-600"
                          : order.status === "Completed"
                            ? "bg-blue-50 text-blue-600"
                            : order.status === "Pending"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-pink-50 text-pink-600"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PAYMENT HISTORY */}
            {activeTab === "payments" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-slate-805">Payment History</h2>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Billing ledger and invoices download</p>
                </div>

                <div className="mt-5 max-w-2xl overflow-hidden border border-slate-200/80 rounded-2xl">
                  <table className="w-full text-xs text-left text-slate-650">
                    <thead className="text-[9px] font-black bg-slate-50 text-slate-400 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Invoice ID</th>
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5">Method</th>
                        <th className="px-4 py-2.5">Amount</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-800">{p.id}</td>
                          <td className="px-4 py-3 text-[10px]">{p.date}</td>
                          <td className="px-4 py-3 text-[10px]">{p.method}</td>
                          <td className="px-4 py-3 font-bold text-slate-700">{p.amount}</td>
                          <td className="px-4 py-3">
                            <span className="px-1.5 py-0.25 rounded-md bg-emerald-50 text-emerald-650 text-[9px] font-bold">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: SECURITY */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {securityView === "main" ? (
                  <>
                    <div>
                      <h2 className="text-base font-black text-slate-805">Security</h2>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Manage your password, sessions, and account access</p>
                    </div>

                    <div className="mt-6 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 max-w-xl">
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-800">Password</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Last changed 30 days ago</p>
                        </div>
                        <button
                          onClick={() => setSecurityView("change-password")}
                          className="h-7 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                        >
                          Change
                        </button>
                      </div>

                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-800">Two-Factor Auth</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Not enabled</p>
                        </div>
                        <button
                          onClick={() => toast.info("Two-Factor Auth configuration sandbox initialized")}
                          className="h-7 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                        >
                          Enable
                        </button>
                      </div>

                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-800">Phone</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">2 sessions active</p>
                        </div>
                        <button
                          onClick={() => setSecurityView("sessions")}
                          className="h-7 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                        >
                          Manage
                        </button>
                      </div>

                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-800">Organization</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">5 recent logins</p>
                        </div>
                        <button
                          onClick={() => alert("Recent logins list: \n1. Chrome/Windows - 11:20 AM\n2. Chrome/Windows - 9:15 AM\n3. Safari/iOS - Yesterday\n4. Chrome/Windows - 2 days ago\n5. Chrome/Windows - 3 days ago")}
                          className="h-7 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </>
                ) : securityView === "change-password" ? (
                  <div className="space-y-4 max-w-md animate-in fade-in duration-100">
                    <button
                      onClick={() => setSecurityView("main")}
                      className="flex items-center gap-1 text-[10px] text-slate-450 hover:text-slate-700 font-bold transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Change Password</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Choose a strong password to keep your account safe.</p>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-3 pt-2">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••"
                          className="w-full mt-1 px-3 py-1.75 bg-slate-50 border border-slate-205 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••"
                          className="w-full mt-1 px-3 py-1.75 bg-slate-50 border border-slate-205 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••"
                          className="w-full mt-1 px-3 py-1.75 bg-slate-50 border border-slate-205 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="px-4 py-1.75 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          Update Password
                        </button>
                        <button
                          type="button"
                          onClick={() => setSecurityView("main")}
                          className="px-4 py-1.75 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-bold cursor-pointer hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-xl animate-in fade-in duration-100">
                    <button
                      onClick={() => setSecurityView("main")}
                      className="flex items-center gap-1 text-[10px] text-slate-450 hover:text-slate-700 font-bold transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Active Sessions</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">These devices are currently logged in to your account.</p>
                    </div>

                    <div className="space-y-3 mt-4">
                      {activeSessions.map((session) => (
                        <div key={session.id} className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3 text-left">
                            {session.device.includes("Safari") ? <Laptop className="w-5 h-5 text-slate-400" /> : <Monitor className="w-5 h-5 text-slate-400" />}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800">{session.device}</span>
                                {session.active && (
                                  <span className="px-1.5 py-0.25 rounded-md bg-green-50 text-green-650 text-[8px] font-black uppercase">This Device</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">{session.location}</span>
                            </div>
                          </div>
                          {!session.active && (
                            <button
                              onClick={() => {
                                setActiveSessions(prev => prev.filter(s => s.id !== session.id));
                                toast.success("Signed out of session successfully");
                              }}
                              className="h-6 px-2.5 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 rounded-lg text-[9.5px] font-bold transition-colors cursor-pointer"
                            >
                              Sign out
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setActiveSessions(prev => prev.filter(s => s.active));
                        toast.success("Signed out of all other devices successfully");
                      }}
                      className="mt-2 text-[10px] text-red-550 hover:text-red-650 font-black cursor-pointer text-left block"
                    >
                      Sign out of all other devices
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: PREFERENCE */}
            {activeTab === "preferences" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-slate-805">Preferences</h2>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Customize how BIMBOX AI looks and behaves for you</p>
                </div>

                <div className="mt-5 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 max-w-xl">
                  {/* Appearance Toggle */}
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Appearance</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{preferences.appearance} Mode active</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = preferences.appearance === "Light" ? "Dark" : "Light";
                        setPreferences(prev => ({ ...prev, appearance: next }));
                        toast.info(`Theme toggled to ${next} Mode`);
                      }}
                      className="h-7 px-3 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                    >
                      Toggle
                    </button>
                  </div>

                  {/* Language */}
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Language</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{preferences.language}</p>
                    </div>
                    <button
                      onClick={() => toast.info("Language settings sandbox active")}
                      className="h-7 px-3 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Timezone Selection dropdown */}
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Timezone</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{preferences.timezone}</p>
                      </div>
                      <button
                        onClick={() => setTimezonePickerOpen(!timezonePickerOpen)}
                        className="h-7 px-3 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                      >
                        {timezonePickerOpen ? "Close" : "Edit"}
                      </button>
                    </div>
                    {timezonePickerOpen && (
                      <div className="p-2 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-wrap gap-1.5 mt-1 animate-in fade-in duration-100">
                        {["Asia/Kolkata (IST)", "UTC", "US/Eastern", "Europe/London"].map((tz) => (
                          <button
                            key={tz}
                            onClick={() => {
                              setPreferences(prev => ({ ...prev, timezone: tz }));
                              setTimezonePickerOpen(false);
                              toast.success(`Timezone changed to ${tz}`);
                            }}
                            className={`px-2.5 py-1 text-[9.5px] font-bold rounded-lg border cursor-pointer transition-all ${
                              preferences.timezone === tz
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {tz}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date Format Selection dropdown */}
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Date Format</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{preferences.dateFormat}</p>
                      </div>
                      <button
                        onClick={() => setDateFormatPickerOpen(!dateFormatPickerOpen)}
                        className="h-7 px-3 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                      >
                        {dateFormatPickerOpen ? "Close" : "Edit"}
                      </button>
                    </div>
                    {dateFormatPickerOpen && (
                      <div className="p-2 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-wrap gap-1.5 mt-1 animate-in fade-in duration-100">
                        {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => {
                              setPreferences(prev => ({ ...prev, dateFormat: fmt }));
                              setDateFormatPickerOpen(false);
                              toast.success(`Date format changed to ${fmt}`);
                            }}
                            className={`px-2.5 py-1 text-[9.5px] font-bold rounded-lg border cursor-pointer transition-all ${
                              preferences.dateFormat === fmt
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: HELP & SUPPORT */}
            {activeTab === "help" && (
              <div className="space-y-4">
                {helpView === "main" ? (
                  <div className="space-y-5 animate-in fade-in duration-100">
                    <div>
                      <h2 className="text-base font-black text-slate-850">Help & Support</h2>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Get immediate coordinate assistance and technical support</p>
                    </div>

                    {/* Support Cards Grid */}
                    <div className="grid grid-cols-2 gap-4 max-w-2xl">
                      <button
                        onClick={() => setHelpView("live-chat")}
                        className="p-4 border border-slate-200 rounded-2xl text-left bg-blue-50/10 hover:bg-blue-50/20 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div>
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-650 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <h4 className="text-xs font-black text-slate-800 mt-3">Live Chat</h4>
                          <span className="text-[9.5px] text-slate-450 font-bold block mt-1">Chat with support team</span>
                          <span className="text-[8.5px] text-green-500 font-bold block mt-1">● Online Now</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        onClick={() => setHelpView("call-support")}
                        className="p-4 border border-slate-200 rounded-2xl text-left bg-emerald-50/10 hover:bg-emerald-50/20 hover:border-emerald-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div>
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-650 flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4" />
                          </div>
                          <h4 className="text-xs font-black text-slate-800 mt-3">Call Us</h4>
                          <span className="text-[9.5px] text-slate-450 font-bold block mt-1">Speak to support expert</span>
                          <span className="text-[8.5px] text-slate-450 font-bold block mt-1">24/7 Available</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Accordion FAQ list */}
                    <div className="max-w-2xl">
                      <h4 className="text-xs font-black text-slate-750 uppercase tracking-wider mb-3">Frequently Asked Questions</h4>
                      <div className="border border-slate-205 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                        {[
                          { q: "What are the system requirements?", a: "BIMBOX AI runs on any modern browser supporting WebGL 2.0 (Chrome, Safari, Firefox). We recommend at least 8GB of RAM for smooth rendering of federated IFC models." },
                          { q: "How do I reset my password?", a: "Go to the Security tab on the left profile menu, select Change next to Password, enter your current password, and type in a new one." },
                          { q: "Can I cancel my subscription?", a: "Yes, you can cancel or change your plan at any time by coordinating with billing inside the Live Chat or emailing accounts@bimbox.ai." },
                          { q: "How do I change my profile picture?", a: "Your profile picture is currently linked to your organization directory. To request a manual override, open the Live Chat support tool." },
                          { q: "What payment methods are accepted?", a: "We support all major credit cards (Visa, MasterCard, Amex), UPI, and net banking options. Corporate invoicing is also available." },
                          { q: "How do I invite team members?", a: "You can configure and invite roster participants within the specific project dashboard setting or in coordination invite wizard." }
                        ].map((faq, idx) => {
                          const isFaqOpen = openFaqIndex === idx;
                          return (
                            <div key={idx} className="bg-white">
                              <button
                                onClick={() => setOpenFaqIndex(isFaqOpen ? null : idx)}
                                className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/50"
                              >
                                <span className="text-xs font-extrabold text-slate-750">{faq.q}</span>
                                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isFaqOpen ? "rotate-90" : ""}`} />
                              </button>
                              {isFaqOpen && (
                                <div className="px-4 pb-3 text-[10.5px] text-slate-500 font-semibold leading-relaxed animate-in fade-in slide-in-from-top-1 duration-100">
                                  {faq.a}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : helpView === "live-chat" ? (
                  /* HELP SUB-VIEW 1: SUPPORT CHAT VIEW */
                  <div className="flex flex-col h-[480px] justify-between max-w-2xl border border-slate-200 rounded-3xl overflow-hidden bg-slate-50 animate-in fade-in duration-100">
                    {/* Header */}
                    <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => setHelpView("main")}
                        className="w-7 h-7 hover:bg-slate-105 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div className="text-left flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-800 leading-none">Live Chat</h4>
                        <span className="text-[9px] text-green-500 font-bold block mt-1">● Online Now</span>
                      </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col justify-start">
                      {chatMessages.map((msg) => {
                        const isBot = msg.sender === "bot";
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[80%] rounded-2xl p-3 text-left ${
                              isBot
                                ? "bg-white border border-slate-105 text-slate-700 mr-auto rounded-tl-none"
                                : "bg-blue-600 text-white ml-auto rounded-tr-none"
                            }`}
                          >
                            <p className="text-[11px] font-semibold leading-relaxed">{msg.text}</p>
                            <span className={`text-[8px] font-bold mt-1.5 self-end ${
                              isBot ? "text-slate-400" : "text-blue-200"
                            }`}>
                              {msg.time}
                            </span>
                          </div>
                        );
                      })}
                      {isTyping && (
                        <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-2xl px-3 py-2 text-slate-450 mr-auto rounded-tl-none shrink-0 w-fit">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span className="text-[9.5px] font-bold">Representative is typing...</span>
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendChatMessage} className="bg-white p-3 border-t border-slate-250 flex items-center gap-2.5 shrink-0">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-1.75 bg-slate-50 border border-slate-205 rounded-xl text-xs font-semibold placeholder-slate-450 text-slate-800 focus:bg-white focus:outline-hidden"
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-all disabled:pointer-events-none"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                ) : (
                  /* HELP SUB-VIEW 2: PHONE CALL DIRECTORY */
                  <div className="space-y-4 max-w-xl animate-in fade-in duration-100">
                    <button
                      onClick={() => setHelpView("main")}
                      className="flex items-center gap-1 text-[10px] text-slate-450 hover:text-slate-700 font-bold transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Call Support</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Please coordinate using our dedicated helpline numbers.</p>
                    </div>

                    <div className="bg-green-50/20 border border-green-100 rounded-2xl p-4 text-center space-y-1.5">
                      <span className="text-[9px] font-black text-green-600 uppercase tracking-wider block">Toll-Free Customer Care</span>
                      <h2 className="text-lg font-black text-slate-850">+91 1800-453-4534</h2>
                      <span className="text-[8.5px] text-slate-450 font-bold block">Toll-Free, 24/7 Available</span>
                    </div>

                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
                      {[
                        { title: "Sales & Billing", number: "+91 24-4565-5585", hours: "Mon - Fri, 9AM - 6PM IST" },
                        { title: "Customer Support", number: "+91 22-7890-1234", hours: "24/7 Support" },
                        { title: "Technical Assistance", number: "+91 11-2345-6789", hours: "Mon - Sun, 8AM - 8PM IST" }
                      ].map((phone, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between">
                          <div className="text-left space-y-0.5">
                            <h4 className="text-xs font-black text-slate-800">{phone.title}</h4>
                            <span className="text-[9.5px] text-slate-450 font-semibold block">{phone.hours}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-blue-600 block">{phone.number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
