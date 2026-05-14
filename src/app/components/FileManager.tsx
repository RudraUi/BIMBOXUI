import { Folder, FileText, Image, FileSpreadsheet, File, MoreVertical, Download, Trash2, Edit, FolderPlus, Upload, Search, Share2, Link2, Mail, Copy, Check, X, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

type FileType = "folder" | "pdf" | "image" | "excel" | "cad" | "document";

interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size?: string;
  date: string;
  parentId: string | null;
  owner?: string;
  sharedWith?: string[];
  itemCount?: number;
}

export function FileManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FileType | "all">("all");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<"file" | "folder">("file");
  const [uploadedItemName, setUploadedItemName] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [items, setItems] = useState<FileItem[]>([
    { id: "f1", name: "Projects", type: "folder", date: "2026-04-20", parentId: null, owner: "You", sharedWith: ["Sarah M", "John D"], itemCount: 24 },
    { id: "f2", name: "Design", type: "folder", date: "2026-04-19", parentId: null, owner: "You", sharedWith: ["Mike R"], itemCount: 12 },
    { id: "f3", name: "Media", type: "folder", date: "2026-04-18", parentId: null, owner: "Sarah M", sharedWith: ["You", "Anna K", "Tom B"], itemCount: 156 },
    { id: "f4", name: "Archives", type: "folder", date: "2026-04-17", parentId: null, owner: "You", itemCount: 48 },

    { id: "1", name: "Blueprint.pdf", type: "pdf", size: "2.4 MB", date: "2026-04-20", parentId: "f1", owner: "You", sharedWith: ["Sarah M"] },
    { id: "2", name: "Guidelines.pdf", type: "pdf", size: "856 KB", date: "2026-04-17", parentId: "f1", owner: "John D" },
    { id: "3", name: "Contract.pdf", type: "pdf", size: "1.2 MB", date: "2026-04-15", parentId: "f1", owner: "You" },

    { id: "4", name: "FloorPlan.dwg", type: "cad", size: "1.8 MB", date: "2026-04-16", parentId: "f2", owner: "Mike R", sharedWith: ["You"] },
    { id: "5", name: "Elevation.dwg", type: "cad", size: "2.1 MB", date: "2026-04-14", parentId: "f2", owner: "You" },

    { id: "6", name: "Photo_001.jpg", type: "image", size: "4.2 MB", date: "2026-04-18", parentId: "f3", owner: "Sarah M" },
    { id: "7", name: "Photo_002.jpg", type: "image", size: "3.8 MB", date: "2026-04-18", parentId: "f3", owner: "You" },

    { id: "9", name: "Materials.xlsx", type: "excel", size: "128 KB", date: "2026-04-19", parentId: null, owner: "You", sharedWith: ["Team"] },
    { id: "10", name: "Budget.xlsx", type: "excel", size: "256 KB", date: "2026-04-16", parentId: null, owner: "Sarah M", sharedWith: ["You", "John D"] },
  ]);

  const getIcon = (type: FileType) => {
    switch (type) {
      case "folder": return Folder;
      case "pdf": return FileText;
      case "image": return Image;
      case "excel": return FileSpreadsheet;
      default: return File;
    }
  };

  const getFileStyle = (type: FileType) => {
    return "bg-gray-100 text-gray-700";
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.charAt(0);
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-blue-200 text-blue-700",
      "bg-green-200 text-green-700",
      "bg-purple-200 text-purple-700",
      "bg-pink-200 text-pink-700",
      "bg-yellow-200 text-yellow-700",
    ];
    return colors[index % colors.length];
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleRename = (id: string) => {
    const newName = prompt("Enter new name:");
    if (newName) {
      setItems(items.map(item =>
        item.id === id ? { ...item, name: newName } : item
      ));
    }
  };

  const createFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      const newFolder: FileItem = {
        id: `f${Date.now()}`,
        name: folderName,
        type: "folder",
        date: new Date().toISOString().split('T')[0],
        parentId: currentFolderId,
        owner: "You",
        itemCount: 0,
      };
      setItems([...items, newFolder]);
    }
  };

  const handleShare = (item: FileItem) => {
    setSelectedItem(item);
    setShareModalOpen(true);
    setLinkCopied(false);
  };

  const copyShareLink = () => {
    const link = `https://app.example.com/share/${selectedItem?.id}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleUploadClick = () => {
    setUploadModalOpen(true);
  };

  const simulateUpload = (type: "file" | "folder", fileName: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadType(type);
    setUploadedItemName(fileName);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadModalOpen(false);
            setSuccessModalOpen(true);

            const newItem: FileItem = {
              id: `${Date.now()}`,
              name: fileName,
              type: type === "folder" ? "folder" : "pdf",
              size: type === "folder" ? undefined : "1.2 MB",
              date: new Date().toISOString().split('T')[0],
              parentId: currentFolderId,
              owner: "You",
              itemCount: type === "folder" ? 0 : undefined,
            };
            setItems([...items, newItem]);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateUpload("file", files[0].name);
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const folderName = files[0].webkitRelativePath.split('/')[0];
      simulateUpload("folder", folderName);
    }
  };

  const filteredItems = items.filter(item => {
    if (item.parentId !== currentFolderId) return false;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const currentFolder = items.find(item => item.id === currentFolderId);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Minimal Header */}
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            {currentFolder ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentFolderId(currentFolder.parentId)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl tracking-tight text-gray-900">{currentFolder.name}</h1>
              </div>
            ) : (
              <h1 className="text-2xl tracking-tight text-gray-900">Files</h1>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={createFolder}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              New Folder
            </button>
            <button onClick={handleUploadClick} className="px-5 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
              Upload
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FileType | "all")}
            className="px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200"
          >
            <option value="all">All</option>
            <option value="folder">Folders</option>
            <option value="pdf">PDF</option>
            <option value="image">Images</option>
            <option value="excel">Spreadsheets</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Folder className="w-16 h-16 mb-3 opacity-20" />
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredItems.map((item) => {
              const Icon = getIcon(item.type);
              if (item.type === "folder") {
                return (
                  <div
                    key={item.id}
                    className="group relative"
                    onDoubleClick={() => setCurrentFolderId(item.id)}
                  >
                    <div className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md hover:border-gray-300">
                      <div className="flex items-start justify-between mb-2">
                        <Folder className="w-8 h-8 text-gray-400" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-opacity">
                              <MoreVertical className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShare(item)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRename(item.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs text-gray-900 font-medium mb-1 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400 mb-2">{item.itemCount} items</p>
                      {item.sharedWith && item.sharedWith.length > 0 && (
                        <div className="flex items-center -space-x-1">
                          {item.sharedWith.slice(0, 3).map((person, idx) => (
                            <div
                              key={idx}
                              className={`w-5 h-5 rounded-full ${getAvatarColor(idx)} flex items-center justify-center text-xs border border-white`}
                              title={person}
                            >
                              {getInitials(person)}
                            </div>
                          ))}
                          {item.sharedWith.length > 3 && (
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 border border-white">
                              +{item.sharedWith.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={item.id}
                    className="group relative"
                  >
                    <div className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md hover:border-gray-300">
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-8 h-8 rounded ${getFileStyle(item.type)} flex items-center justify-center`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-opacity">
                              <MoreVertical className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShare(item)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRename(item.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs text-gray-900 font-medium mb-1 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400 mb-2">{item.size}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{item.owner}</span>
                        {item.sharedWith && item.sharedWith.length > 0 && (
                          <div className="flex items-center -space-x-1">
                            {item.sharedWith.slice(0, 2).map((person, idx) => (
                              <div
                                key={idx}
                                className={`w-4 h-4 rounded-full ${getAvatarColor(idx)} flex items-center justify-center border border-white`}
                                style={{ fontSize: '7px' }}
                                title={person}
                              >
                                {getInitials(person)}
                              </div>
                            ))}
                            {item.sharedWith.length > 2 && (
                              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 border border-white" style={{ fontSize: '7px' }}>
                                +{item.sharedWith.length - 2}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share {selectedItem?.name}</DialogTitle>
            <DialogDescription>
              Share this {selectedItem?.type} with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Link2 className="w-4 h-4 text-gray-600" />
              <input
                type="text"
                readOnly
                value={`https://app.example.com/share/${selectedItem?.id}`}
                className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
              />
              <button
                onClick={copyShareLink}
                className="px-3 py-1.5 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Share via</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">Email</span>
                </button>
                <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">More</span>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload</DialogTitle>
            <DialogDescription>
              Choose files or folders to upload
            </DialogDescription>
          </DialogHeader>
          {isUploading ? (
            <div className="py-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                <div className="text-center">
                  <p className="text-sm text-gray-700 mb-2">Uploading {uploadedItemName}...</p>
                  <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{uploadProgress}%</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mb-3" />
                <span className="text-sm text-gray-700 mb-1">Upload Files</span>
                <span className="text-xs text-gray-500">Click to browse</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
                <FolderPlus className="w-8 h-8 text-gray-400 mb-3" />
                <span className="text-sm text-gray-700 mb-1">Upload Folder</span>
                <span className="text-xs text-gray-500">Click to browse</span>
                <input
                  type="file"
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  onChange={handleFolderSelect}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg text-gray-900 mb-2">Upload Successful</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              {uploadType === "folder" ? "Folder" : "File"} "{uploadedItemName}" has been uploaded successfully
            </p>
            <button
              onClick={() => setSuccessModalOpen(false)}
              className="px-6 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
