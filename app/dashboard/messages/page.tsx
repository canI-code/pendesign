"use client";
import React, { useState, useEffect } from "react";
import { Send, Search, MoreVertical, Users as UsersIcon, UserPlus, Check, X as XIcon, MessageSquare, Phone, Bot, CheckCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface ChatRequest {
    id: number;
    fromId: string;
    fromName: string;
    toId: string;
    toName: string;
    status: "pending" | "accepted" | "declined";
    timestamp: string;
}

interface ClubMember {
    id: string;
    name: string;
    phone?: string;
    role: "head" | "coordinator" | "member";
    online: boolean;
}

export default function MessagesPage() {
    const { chats, messages, addMessage, addChat, user, markChatAsRead, sendAIMessage, findUserByPhone, startDirectChat } = useApp();
    const [selectedChat, setSelectedChat] = useState(0);
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [phoneSearch, setPhoneSearch] = useState("");
    const [phoneSearchResult, setPhoneSearchResult] = useState<ClubMember | "not_found" | null>(null);
    const [showMembers, setShowMembers] = useState(false);
    const [showPhoneSearch, setShowPhoneSearch] = useState(false);
    const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);

    // Check if we need to open a specific chat
    useEffect(() => {
        const openChatName = sessionStorage.getItem("openChat");
        if (openChatName) {
            const chatIndex = chats.findIndex((c) => c.name === openChatName);
            if (chatIndex !== -1) {
                setSelectedChat(chatIndex);
            }
            sessionStorage.removeItem("openChat");
        }
    }, [chats]);

    // Mark chat as read when selected
    useEffect(() => {
        if (chats.length > 0 && chats[selectedChat]) {
            const currentChat = chats[selectedChat];
            if (currentChat.unread > 0) {
                markChatAsRead(currentChat.id);
            }
        }
    }, [selectedChat, chats, markChatAsRead]);

    const handleSend = () => {
        if (message.trim() && chats.length > 0) {
            const currentChat = chats[selectedChat];
            
            // Handle AI chat differently
            if (currentChat.type === "ai") {
                sendAIMessage(message);
                setMessage("");
                return;
            }

            const newMessage = {
                id: (messages[currentChat.id]?.length || 0) + 1,
                chatId: currentChat.id,
                senderId: user?.id || "me",
                senderName: user?.name || "Me",
                text: message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true,
                read: true,
            };

            addMessage(currentChat.id, newMessage);
            setMessage("");
        }
    };

    const handlePhoneSearch = () => {
        if (phoneSearch.trim()) {
            const foundUser = findUserByPhone(phoneSearch.trim());
            setPhoneSearchResult(foundUser || "not_found");
        }
    };

    const handleStartChatWithUser = (targetUser: ClubMember) => {
        const chatId = startDirectChat(targetUser);
        const chatIndex = chats.findIndex((c) => c.id === chatId);
        if (chatIndex !== -1) {
            setSelectedChat(chatIndex);
        }
        setShowPhoneSearch(false);
        setPhoneSearch("");
        setPhoneSearchResult(null);
    };

    const handleRequestChat = (member: ClubMember) => {
        setSelectedMember(member);
        setShowRequestModal(true);
    };

    const confirmRequestChat = () => {
        if (selectedMember) {
            const newRequest: ChatRequest = {
                id: chatRequests.length + 1,
                fromId: user?.id || "me",
                fromName: user?.name || "You",
                toId: selectedMember.id,
                toName: selectedMember.name,
                status: "pending",
                timestamp: "Just now",
            };
            setChatRequests([...chatRequests, newRequest]);
            setShowRequestModal(false);
            setSelectedMember(null);
            alert(`Chat request sent to ${selectedMember.name}!`);
        }
    };

    const handleAcceptRequest = (request: ChatRequest) => {
        setChatRequests(chatRequests.map(r => 
            r.id === request.id ? { ...r, status: "accepted" } : r
        ));

        const newChat = {
            id: chats.length + 100,
            name: request.fromName,
            lastMessage: "Chat request accepted!",
            time: "Just now",
            unread: 0,
            avatar: request.fromName.charAt(0),
            type: "direct" as const,
            members: undefined,
        };
        addChat(newChat);
        
        alert(`You are now connected with ${request.fromName}!`);
    };

    const handleDeclineRequest = (requestId: number) => {
        setChatRequests(chatRequests.map(r => 
            r.id === requestId ? { ...r, status: "declined" } : r
        ));
        alert("Request declined.");
    };

    const handleCancelRequest = (requestId: number) => {
        if (confirm("Cancel this chat request?")) {
            setChatRequests(chatRequests.filter(r => r.id !== requestId));
            alert("Chat request cancelled.");
        }
    };

    // Get pending requests sent TO the current user
    const pendingRequests = chatRequests.filter(r => r.toId === "me" && r.status === "pending");
    
    // Get pending requests sent BY the current user
    const myPendingRequests = chatRequests.filter(r => r.fromId === (user?.id || "me") && r.status === "pending");

    const filteredChats = chats.filter((chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentChat = chats[selectedChat];
    const currentMessages = currentChat ? messages[currentChat.id] || [] : [];

    if (chats.length === 0) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Chats Yet</h2>
                    <p className="text-neutral-400 mb-6">Join a club to start chatting with members!</p>
                    <a
                        href="/dashboard/clubs"
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl transition-all inline-block"
                    >
                        Browse Clubs
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4">
            {/* Chat List */}
            <div className="w-80 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-neutral-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Messages</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowPhoneSearch(!showPhoneSearch)}
                                className={`p-2 rounded-lg transition-colors ${showPhoneSearch ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-neutral-800 text-neutral-400"}`}
                                title="Search by Phone"
                            >
                                <Phone className="h-4 w-4" />
                            </button>
                            {pendingRequests.length > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {/* Phone Search Section */}
                    {showPhoneSearch && (
                        <div className="mb-4 p-3 bg-neutral-800 rounded-lg">
                            <label className="text-sm text-neutral-400 mb-2 block">Find user by phone number</label>
                            <div className="flex gap-2">
                                <input
                                    type="tel"
                                    placeholder="Enter phone number..."
                                    value={phoneSearch}
                                    onChange={(e) => setPhoneSearch(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-indigo-500 text-sm"
                                />
                                <button
                                    onClick={handlePhoneSearch}
                                    className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            </div>
                            {phoneSearchResult && (
                                <div className="mt-3">
                                    {phoneSearchResult === "not_found" ? (
                                        <p className="text-red-400 text-sm">No user found with this phone number</p>
                                    ) : (
                                        <div className="flex items-center justify-between p-2 bg-neutral-700 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {phoneSearchResult.name?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{phoneSearchResult.name}</p>
                                                    <p className="text-neutral-400 text-xs">{phoneSearchResult.phone}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleStartChatWithUser(phoneSearchResult)}
                                                className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors"
                                                title="Start Chat"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Pending Requests Section */}
                {pendingRequests.length > 0 && (
                    <div className="p-3 border-b border-neutral-800 bg-neutral-800/50">
                        <h3 className="text-sm font-semibold text-neutral-400 mb-2">Chat Requests</h3>
                        {pendingRequests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-2 bg-neutral-800 rounded-lg mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {request.fromName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">{request.fromName}</p>
                                        <p className="text-neutral-400 text-xs">{request.timestamp}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleAcceptRequest(request)}
                                        className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                        title="Accept"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeclineRequest(request.id)}
                                        className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                        title="Decline"
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* My Pending Requests (Outgoing) */}
                {myPendingRequests.length > 0 && (
                    <div className="p-3 border-b border-neutral-800 bg-yellow-900/10">
                        <h3 className="text-sm font-semibold text-yellow-400 mb-2">My Sent Requests</h3>
                        {myPendingRequests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-2 bg-neutral-800 rounded-lg mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {request.toName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">To: {request.toName}</p>
                                        <p className="text-neutral-400 text-xs">{request.timestamp} • Pending</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCancelRequest(request.id)}
                                    className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs flex items-center gap-1"
                                    title="Cancel Request"
                                >
                                    <XIcon className="h-3 w-3" />
                                    Cancel
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {filteredChats.map((chat, idx) => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(idx)}
                            className={`p-4 border-b border-neutral-800 cursor-pointer transition-colors ${selectedChat === idx ? "bg-neutral-800" : "hover:bg-neutral-800/50"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 ${
                                    chat.type === "ai" 
                                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center" 
                                        : chat.type === "club" 
                                            ? "text-3xl flex items-center justify-center" 
                                            : "bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold"
                                }`}>
                                    {chat.type === "ai" ? (
                                        <Bot className="h-5 w-5 text-white" />
                                    ) : chat.type === "club" ? (
                                        chat.avatar
                                    ) : (
                                        chat.name.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-white truncate">{chat.name}</h3>
                                            {chat.type === "ai" && (
                                                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">AI</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-neutral-400">{chat.time}</span>
                                    </div>
                                    <p className="text-sm text-neutral-400 truncate">{chat.lastMessage}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {chat.type === "club" && chat.members && (
                                            <span className="text-xs text-neutral-500">{chat.members.length} members</span>
                                        )}
                                        {chat.type === "direct" && (
                                            <span className="text-xs text-indigo-400">Direct Message</span>
                                        )}
                                    </div>
                                </div>
                                {chat.unread > 0 && (
                                    <div className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {chat.unread}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`${
                            currentChat.type === "ai"
                                ? "w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center"
                                : currentChat.type === "club" 
                                    ? "text-3xl" 
                                    : "w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold"
                        }`}>
                            {currentChat.type === "ai" ? (
                                <Bot className="h-5 w-5 text-white" />
                            ) : currentChat.type === "club" ? (
                                currentChat.avatar
                            ) : (
                                currentChat.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white">{currentChat.name}</h3>
                                {currentChat.type === "ai" && (
                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">AI Assistant</span>
                                )}
                            </div>
                            <p className="text-sm text-neutral-400">
                                {currentChat.type === "ai" 
                                    ? "Always here to help" 
                                    : currentChat.type === "club" 
                                        ? `${currentChat.members?.length || 0} members` 
                                        : "Direct Message"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {currentChat.type === "club" && (
                            <button
                                onClick={() => setShowMembers(!showMembers)}
                                className={`p-2 rounded-lg transition-colors ${showMembers ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-neutral-800 text-neutral-400"}`}
                                title="Show Members"
                            >
                                <UsersIcon className="h-5 w-5" />
                            </button>
                        )}
                        <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors" title="More Options">
                            <MoreVertical className="h-5 w-5 text-neutral-400" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {currentMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-neutral-400">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        currentMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-md ${
                                    msg.isMe 
                                        ? "bg-indigo-600" 
                                        : currentChat.type === "ai" 
                                            ? "bg-emerald-600/20 border border-emerald-500/30" 
                                            : "bg-neutral-800"
                                } rounded-2xl px-4 py-2`}>
                                    {!msg.isMe && (
                                        <p className={`text-xs mb-1 ${currentChat.type === "ai" ? "text-emerald-400" : "text-neutral-400"}`}>
                                            {msg.senderName}
                                        </p>
                                    )}
                                    <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <p className="text-xs text-neutral-300">{msg.time}</p>
                                        {msg.isMe && (
                                            <CheckCheck className={`h-3 w-3 ${msg.read ? "text-blue-400" : "text-neutral-400"}`} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-neutral-800">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            placeholder={currentChat.type === "ai" ? "Ask AI anything..." : "Type a message..."}
                            className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!message.trim()}
                            className={`px-6 py-3 ${
                                currentChat.type === "ai" 
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-600" 
                                    : "bg-gradient-to-r from-indigo-500 to-violet-600"
                            } text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Send Message"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Members Sidebar */}
            {showMembers && currentChat.type === "club" && currentChat.members && (
                <div className="w-72 bg-neutral-900 border border-neutral-800 rounded-xl p-4 overflow-y-auto">
                    <h3 className="text-lg font-bold text-white mb-4">Members ({currentChat.members.length})</h3>
                    <div className="space-y-2">
                        {currentChat.members.map((member) => (
                            <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-neutral-800 rounded-lg transition-colors group">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {member.name.charAt(0)}
                                    </div>
                                    {member.online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{member.name}</p>
                                    <p className="text-neutral-400 text-xs capitalize">{member.role}</p>
                                </div>
                                <button
                                    onClick={() => handleRequestChat(member)}
                                    className="opacity-0 group-hover:opacity-100 p-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-all"
                                    title="Request to Chat"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-neutral-800">
                        <h4 className="text-sm font-semibold text-neutral-400 mb-3">Your Sent Requests</h4>
                        {chatRequests.filter(r => r.fromId === (user?.id || "me")).length === 0 ? (
                            <p className="text-neutral-500 text-xs">No pending requests</p>
                        ) : (
                            <div className="space-y-2">
                                {chatRequests.filter(r => r.fromId === (user?.id || "me")).map((request) => (
                                    <div key={request.id} className="flex items-center justify-between p-2 bg-neutral-800 rounded-lg">
                                        <span className="text-white text-sm">{request.toName}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            request.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                            request.status === "accepted" ? "bg-green-500/20 text-green-400" :
                                            "bg-red-500/20 text-red-400"
                                        }`}>
                                            {request.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Request Chat Modal */}
            {showRequestModal && selectedMember && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                {selectedMember.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedMember.name}</h2>
                                <p className="text-neutral-400 capitalize">{selectedMember.role}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${selectedMember.online ? "bg-green-500" : "bg-neutral-500"}`}></div>
                                    <span className="text-xs text-neutral-400">{selectedMember.online ? "Online" : "Offline"}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-neutral-300 mb-6">
                            Send a chat request to <span className="text-white font-semibold">{selectedMember.name}</span>? 
                            They will be notified and can accept or decline your request.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmRequestChat}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold flex items-center justify-center gap-2"
                            >
                                <UserPlus className="h-5 w-5" />
                                Send Request
                            </button>
                            <button
                                onClick={() => {
                                    setShowRequestModal(false);
                                    setSelectedMember(null);
                                }}
                                className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
