import { FileText, Upload, Download, Search, Filter, MoreVertical, File, Image, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

export function Documents() {
  const [searchQuery, setSearchQuery] = useState("");

  const documents = [
    { id: 1, name: "Project Blueprint v2.1.pdf", type: "PDF", size: "2.4 MB", date: "2026-04-20", icon: FileText, color: "text-red-500" },
    { id: 2, name: "Material List.xlsx", type: "Excel", size: "128 KB", date: "2026-04-19", icon: FileSpreadsheet, color: "text-green-500" },
    { id: 3, name: "Site Photo 001.jpg", type: "Image", size: "4.2 MB", date: "2026-04-18", icon: Image, color: "text-blue-500" },
    { id: 4, name: "Safety Guidelines.pdf", type: "PDF", size: "856 KB", date: "2026-04-17", icon: FileText, color: "text-red-500" },
    { id: 5, name: "Floor Plan Rev 3.dwg", type: "CAD", size: "1.8 MB", date: "2026-04-16", icon: File, color: "text-purple-500" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">Documents</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-xs text-gray-600">Type</th>
              <th className="px-4 py-3 text-left text-xs text-gray-600">Size</th>
              <th className="px-4 py-3 text-left text-xs text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-xs text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const Icon = doc.icon;
              return (
                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${doc.color}`} />
                      <span className="text-sm text-gray-700">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.size}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-all" title="Download">
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-all" title="More">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
