import { UserPlus, Search, Mail, Phone, MoreVertical, Shield, User } from "lucide-react";
import { useState } from "react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  status: "Active" | "Away" | "Offline";
  isPartner?: boolean;
}

export function Team() {
  const [searchQuery, setSearchQuery] = useState("");

  const members: TeamMember[] = [
    { id: 1, name: "Samuel Rodriguez", role: "Project Manager", email: "samuel@bimbox.com", phone: "+1 234 567 8901", avatar: "S", status: "Active" },
    { id: 2, name: "John Doe", role: "Site Engineer", email: "john@bimbox.com", phone: "+1 234 567 8902", avatar: "J", status: "Active" },
    { id: 3, name: "Jane Smith", role: "Architect", email: "jane@partner.com", phone: "+1 234 567 8903", avatar: "J", status: "Active", isPartner: true },
    { id: 4, name: "Mike Johnson", role: "BIM Specialist", email: "mike@bimbox.com", phone: "+1 234 567 8904", avatar: "M", status: "Away" },
    { id: 5, name: "Sarah Lee", role: "Safety Officer", email: "sarah@bimbox.com", phone: "+1 234 567 8905", avatar: "S", status: "Active" },
    { id: 6, name: "Tom Brown", role: "Contractor", email: "tom@partner.com", phone: "+1 234 567 8906", avatar: "T", status: "Offline", isPartner: true },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Away": return "bg-orange-500";
      case "Offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">Team Members</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-auto">
        <div className="divide-y divide-gray-100">
          {members.map((member) => (
            <div key={member.id} className="p-4 hover:bg-gray-50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                      {member.avatar}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm text-gray-900">{member.name}</h4>
                      {member.isPartner && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Partner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{member.role}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-all">
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
