"use client";
import React, { useState } from "react";
import { Plus, Download, X, Upload, FileText, File, Image as ImageIcon } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function NotesPage() {
    const { notes, addNote, downloadNote, user } = useApp();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [filter, setFilter] = useState("all");
    const [newNote, setNewNote] = useState({
        title: "",
        description: "",
        type: "",
        subject: "",
        price: "",
        isFree: true,
        requiresApproval: false,
    });
    const [noteFile, setNoteFile] = useState<File | null>(null);

    const handleUploadNote = (e: React.FormEvent) => {
        e.preventDefault();

        if (!noteFile) {
            alert("Please select a file to upload");
            return;
        }

        const note = {
            id: notes.length + 1,
            title: newNote.title,
            description: newNote.description,
            type: newNote.type,
            subject: newNote.subject,
            fileUrl: URL.createObjectURL(noteFile),
            fileType: noteFile.type.includes("pdf") ? "pdf" : noteFile.type.includes("image") ? "image" : "other",
            uploaderId: user?.id || "user",
            uploaderName: user?.name || "Anonymous",
            price: parseFloat(newNote.price),
            isFree: newNote.isFree,
            requiresApproval: newNote.requiresApproval,
            downloads: 0,
            uploadDate: new Date().toISOString().split('T')[0],
        };

        addNote(note);
        setShowUploadModal(false);
        setNewNote({
            title: "",
            description: "",
            type: "",
            subject: "",
            price: "",
            isFree: true,
            requiresApproval: false,
        });
        setNoteFile(null);

        alert(`Note "${note.title}" uploaded successfully!`);
    };

    const handleDownloadNote = (noteId: number, noteTitle: string, requiresApproval: boolean, isFree: boolean) => {
        if (requiresApproval) {
            if (confirm(`Request access to download "${noteTitle}"?`)) {
                alert("Download request sent! The uploader will be notified.");
                downloadNote(noteId);
            }
        } else if (!isFree) {
            if (confirm(`This note costs ₹${notes.find(n => n.id === noteId)?.price}. Proceed with download?`)) {
                downloadNote(noteId);
                alert("Download started!");
            }
        } else {
            downloadNote(noteId);
            alert("Download started!");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNoteFile(file);
        }
    };

    const filteredNotes = notes.filter((note) => {
        if (filter === "all") return true;
        if (filter === "free") return note.isFree;
        if (filter === "paid") return !note.isFree;
        return note.type.toLowerCase() === filter.toLowerCase();
    });

    const getFileIcon = (fileType: string) => {
        if (fileType === "pdf") return <FileText className="h-12 w-12 text-red-400" />;
        if (fileType === "image") return <ImageIcon className="h-12 w-12 text-blue-400" />;
        return <File className="h-12 w-12 text-neutral-400" />;
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        Notes & Resources
                    </h1>
                    <p className="text-neutral-400 mt-2">Share and access study materials</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl transition-all"
                >
                    <Plus className="h-5 w-5" />
                    Upload Notes
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                {["all", "free", "paid", "pdf", "notes", "assignments", "presentations"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition capitalize ${filter === f
                                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                                : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-indigo-500"
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                    <div
                        key={note.id}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-indigo-500 transition-all group"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-neutral-800 rounded-lg">
                                {getFileIcon(note.fileType)}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1">{note.title}</h3>
                                <p className="text-neutral-400 text-sm">{note.subject}</p>
                            </div>
                        </div>

                        <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{note.description}</p>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400 text-sm">Type:</span>
                                <span className="text-white capitalize">{note.type}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400 text-sm">Uploader:</span>
                                <span className="text-white">{note.uploaderName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400 text-sm">Downloads:</span>
                                <span className="text-white">{note.downloads}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400 text-sm">Price:</span>
                                <span className="text-white font-bold">
                                    {note.isFree ? "Free" : `₹${note.price}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <span className="px-3 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full capitalize">
                                {note.fileType}
                            </span>
                            {note.requiresApproval && (
                                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full">
                                    Approval Required
                                </span>
                            )}
                            {note.isFree && (
                                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">
                                    Free
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => handleDownloadNote(note.id, note.title, note.requiresApproval, note.isFree)}
                            className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            {note.requiresApproval ? "Request Download" : "Download"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full my-8">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900">
                            <h2 className="text-2xl font-bold text-white">Upload Notes</h2>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-neutral-400" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadNote} className="p-6 space-y-4">
                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newNote.title}
                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                    placeholder="e.g., Data Structures Complete Notes"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Description *</label>
                                <textarea
                                    required
                                    value={newNote.description}
                                    onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                                    placeholder="Describe the content..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-neutral-400 text-sm mb-2">Type *</label>
                                    <select
                                        required
                                        value={newNote.type}
                                        onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="">Select type</option>
                                        <option value="Notes">Notes</option>
                                        <option value="Assignments">Assignments</option>
                                        <option value="Presentations">Presentations</option>
                                        <option value="Question Papers">Question Papers</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-neutral-400 text-sm mb-2">Subject *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newNote.subject}
                                        onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                                        placeholder="e.g., Computer Science"
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Price (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newNote.price}
                                    onChange={(e) => setNewNote({ ...newNote, price: e.target.value })}
                                    placeholder="e.g., 50"
                                    disabled={newNote.isFree}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isFree"
                                        checked={newNote.isFree}
                                        onChange={(e) => setNewNote({ ...newNote, isFree: e.target.checked, price: e.target.checked ? "0" : newNote.price })}
                                        className="w-4 h-4 bg-neutral-800 border-neutral-700 rounded"
                                    />
                                    <label htmlFor="isFree" className="text-neutral-400 text-sm">
                                        This is free to download
                                    </label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="requiresApproval"
                                        checked={newNote.requiresApproval}
                                        onChange={(e) => setNewNote({ ...newNote, requiresApproval: e.target.checked })}
                                        className="w-4 h-4 bg-neutral-800 border-neutral-700 rounded"
                                    />
                                    <label htmlFor="requiresApproval" className="text-neutral-400 text-sm">
                                        Require approval before download (I'll be notified of requests)
                                    </label>
                                </div>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">File *</label>
                                {!noteFile ? (
                                    <label className="flex items-center justify-center gap-2 px-4 py-8 bg-neutral-800 border border-neutral-700 border-dashed rounded-lg text-neutral-400 hover:border-indigo-500 hover:text-indigo-400 cursor-pointer transition-colors">
                                        <Upload className="h-5 w-5" />
                                        <span>Upload PDF, Image, or Document</span>
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-8 w-8 text-indigo-400" />
                                            <div>
                                                <p className="text-white font-medium">{noteFile.name}</p>
                                                <p className="text-neutral-400 text-sm">{(noteFile.size / 1024).toFixed(2)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNoteFile(null)}
                                            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                                        >
                                            <X className="h-5 w-5 text-neutral-400" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold"
                                >
                                    Upload Notes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
