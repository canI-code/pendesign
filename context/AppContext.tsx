"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    department: string;
    year: string;
    role: string;
    phone?: string;
    phoneVerified?: boolean;
}

interface Event {
    id: number;
    title: string;
    date: string;
    location: string;
    participants: number;
    budget: number;
    status: string;
    description?: string;
    organizer?: string;
    organizerId?: string;
    rating?: number;
    reviews?: Review[];
    images?: string[];
    aiSummary?: string;
}

interface Review {
    id: number;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

interface ResourceImage {
    url: string;
    uploadedAt: string;
}

interface Resource {
    id: number;
    name: string;
    type: string;
    capacity: number;
    features: string[];
    status: string;
    bookedSlots: string[];
    images?: ResourceImage[];
}

interface Club {
    id: number;
    name: string;
    description: string;
    category: string;
    logo: string;
    banner?: string;
    members: number;
    events: number;
    isActive: boolean;
    role: string | null;
    membersList?: ClubMember[];
}

interface ClubMember {
    id: string;
    name: string;
    phone?: string;
    role: "head" | "coordinator" | "member";
    online: boolean;
}

interface Message {
    id: number;
    chatId: number;
    senderId: string;
    senderName: string;
    text: string;
    time: string;
    isMe: boolean;
    read?: boolean;
}

interface Chat {
    id: number;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
    avatar: string;
    type: "club" | "direct" | "ai";
    members?: ClubMember[];
}

interface StoreItem {
    id: number;
    title: string;
    description: string;
    price: number;
    isFree: boolean;
    image: string;
    images?: string[];
    sellerId: string;
    sellerName: string;
    quantity: number;
    category: string;
    condition: string;
    pendingRequests: number;
}

interface Note {
    id: number;
    title: string;
    description: string;
    type: string;
    subject: string;
    fileUrl: string;
    fileType: string;
    uploaderId: string;
    uploaderName: string;
    price: number;
    isFree: boolean;
    requiresApproval: boolean;
    downloads: number;
    uploadDate: string;
}

interface AppContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    events: Event[];
    addEvent: (event: Event) => void;
    deleteEvent: (id: number) => void;
    updateEvent: (id: number, updates: Partial<Event>) => void;
    addEventReview: (eventId: number, review: Review) => void;
    addEventImages: (eventId: number, images: string[]) => void;
    resources: Resource[];
    addResourceImages: (resourceId: number, images: ResourceImage[]) => void;
    bookResource: (id: number, slot: string) => void;
    cancelResourceBooking: (id: number, slot: string) => void;
    clubs: Club[];
    updateClub: (id: number, updates: Partial<Club>) => void;
    joinClub: (id: number) => void;
    leaveClub: (id: number) => void;
    chats: Chat[];
    addChat: (chat: Chat) => void;
    markChatAsRead: (chatId: number) => void;
    messages: { [chatId: number]: Message[] };
    addMessage: (chatId: number, message: Message) => void;
    sendAIMessage: (text: string) => Promise<void>;
    startDirectChat: (targetUser: ClubMember) => number;
    findUserByPhone: (phone: string) => ClubMember | undefined;
    registeredUsers: ClubMember[];
    storeItems: StoreItem[];
    addStoreItem: (item: StoreItem) => void;
    requestStoreItem: (id: number) => void;
    cancelStoreRequest: (id: number) => void;
    notes: Note[];
    addNote: (note: Note) => void;
    downloadNote: (id: number) => void;
    registeredUsers: ClubMember[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock users for simulation - REPLACE WITH DATABASE IN PRODUCTION
// TODO: Remove mock data and fetch from API/Database
const mockUsers: ClubMember[] = [
    // { id: "user1", name: "Alice Johnson", phone: "9876543210", role: "member", online: true },
    // { id: "user2", name: "Bob Smith", phone: "9876543211", role: "coordinator", online: false },
    // { id: "user3", name: "Charlie Brown", phone: "9876543212", role: "member", online: true },
    // { id: "user4", name: "Diana Prince", phone: "9876543213", role: "head", online: true },
];

// AI responses based on context
const getAIResponse = (message: string, events: Event[], clubs: Club[], resources: Resource[]): string => {
    const lowerMessage = message.toLowerCase();
    
    // Events related queries
    if (lowerMessage.includes("event") || lowerMessage.includes("fest") || lowerMessage.includes("hackathon")) {
        const upcomingEvents = events.filter(e => new Date(e.date) > new Date());
        if (upcomingEvents.length > 0) {
            const eventList = upcomingEvents.map(e => `• ${e.title} on ${new Date(e.date).toLocaleDateString()} at ${e.location}`).join("\n");
            return `Here are the upcoming events:\n\n${eventList}\n\nWould you like more details about any specific event?`;
        }
        return "There are no upcoming events at the moment. Check back later or create a new event!";
    }
    
    // Club related queries
    if (lowerMessage.includes("club") || lowerMessage.includes("join") || lowerMessage.includes("member")) {
        const clubList = clubs.map(c => `• ${c.name} (${c.category}) - ${c.members} members`).join("\n");
        return `Here are the available clubs:\n\n${clubList}\n\nYou can join any club from the Clubs page!`;
    }
    
    // Resource related queries
    if (lowerMessage.includes("book") || lowerMessage.includes("room") || lowerMessage.includes("hall") || lowerMessage.includes("resource")) {
        const availableResources = resources.filter(r => r.status === "available");
        if (availableResources.length > 0) {
            const resourceList = availableResources.map(r => `• ${r.name} (${r.type}) - Capacity: ${r.capacity}`).join("\n");
            return `Available resources for booking:\n\n${resourceList}\n\nHead to the Resources page to make a booking!`;
        }
        return "All resources are currently booked. Please check back later.";
    }
    
    // Help queries
    if (lowerMessage.includes("help") || lowerMessage.includes("how") || lowerMessage.includes("what can")) {
        return "I can help you with:\n\n• 📅 Finding upcoming events\n• 🏢 Booking campus resources\n• 👥 Information about clubs\n• 🛒 Store items\n• 📚 Notes and resources\n\nJust ask me anything!";
    }
    
    // Greeting
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
        return "Hello! 👋 I'm your Campus Hive AI assistant. How can I help you today?\n\nYou can ask me about events, clubs, resources, or anything related to campus activities!";
    }
    
    // Default response
    return "I'm not sure I understand. You can ask me about:\n\n• Upcoming events\n• Available clubs\n• Resource bookings\n• Campus activities\n\nHow can I assist you?";
};

// Generate AI summary for reviews
const generateReviewSummary = (reviews: Review[]): string => {
    if (reviews.length === 0) return "";
    
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const positiveCount = reviews.filter(r => r.rating >= 4).length;
    const negativeCount = reviews.filter(r => r.rating <= 2).length;
    
    let summary = "";
    
    if (avgRating >= 4.5) {
        summary = "⭐ Highly rated! Students loved this event.";
    } else if (avgRating >= 3.5) {
        summary = "👍 Generally positive feedback from attendees.";
    } else if (avgRating >= 2.5) {
        summary = "📊 Mixed reviews - some liked it, some didn't.";
    } else {
        summary = "📉 Below average ratings. Room for improvement.";
    }
    
    // Extract common themes from comments
    const allComments = reviews.map(r => r.comment.toLowerCase()).join(" ");
    const themes = [];
    if (allComments.includes("organiz")) themes.push("well-organized");
    if (allComments.includes("amaz") || allComments.includes("great")) themes.push("amazing experience");
    if (allComments.includes("learn")) themes.push("educational");
    if (allComments.includes("fun")) themes.push("fun");
    
    if (themes.length > 0) {
        summary += ` Key highlights: ${themes.join(", ")}.`;
    }
    
    summary += ` Based on ${reviews.length} review${reviews.length > 1 ? "s" : ""}.`;
    
    return summary;
};

export function AppProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [registeredUsers] = useState<ClubMember[]>(mockUsers);
    
    // TODO: Replace with API calls in production
    // Events - fetch from /api/events
    const [events, setEvents] = useState<Event[]>([
        {
            id: 1,
            title: "Tech Fest 2026",
            date: "2026-02-15",
            location: "Main Auditorium",
            participants: 450,
            budget: 75000,
            status: "approved",
            description: "Annual technical festival featuring coding competitions, hackathons, tech talks, and workshops. Join us for 3 days of innovation!",
            organizer: "List Append",
            organizerId: "list.append17@gmail.com",
            rating: 4.8,
            reviews: [],
            images: [],
            aiSummary: "",
        },
        {
            id: 2,
            title: "AI/ML Workshop",
            date: "2026-02-20",
            location: "Computer Lab 3",
            participants: 60,
            budget: 15000,
            status: "approved",
            description: "Hands-on workshop on Machine Learning and AI fundamentals using Python and TensorFlow.",
            organizer: "List Append",
            organizerId: "list.append17@gmail.com",
            rating: 4.5,
            reviews: [],
            images: [],
            aiSummary: "",
        },
        {
            id: 3,
            title: "Cultural Night 2026",
            date: "2026-03-01",
            location: "Open Air Theatre",
            participants: 800,
            budget: 120000,
            status: "pending",
            description: "A night of music, dance, and cultural performances from students across all departments.",
            organizer: "List Append",
            organizerId: "list.append17@gmail.com",
            rating: 0,
            reviews: [],
            images: [],
            aiSummary: "",
        },
        {
            id: 4,
            title: "Startup Pitch Competition",
            date: "2026-02-28",
            location: "Seminar Hall A",
            participants: 100,
            budget: 25000,
            status: "approved",
            description: "Present your startup ideas to a panel of investors and industry experts. Win funding for your project!",
            organizer: "List Append",
            organizerId: "list.append17@gmail.com",
            rating: 4.2,
            reviews: [],
            images: [],
            aiSummary: "",
        },
    ]);

    // Resources - fetch from /api/resources
    const [resources, setResources] = useState<Resource[]>([
        {
            id: 1,
            name: "Main Auditorium",
            type: "hall",
            capacity: 500,
            features: ["Projector", "Sound System", "AC", "Stage Lighting", "Green Room"],
            status: "available",
            bookedSlots: [],
            images: [],
        },
        {
            id: 2,
            name: "Seminar Hall A",
            type: "hall",
            capacity: 150,
            features: ["Projector", "Whiteboard", "AC", "Video Conferencing"],
            status: "available",
            bookedSlots: [],
            images: [],
        },
        {
            id: 3,
            name: "Computer Lab 3",
            type: "lab",
            capacity: 60,
            features: ["40 PCs", "High-speed Internet", "AC", "Projector"],
            status: "available",
            bookedSlots: [],
            images: [],
        },
        {
            id: 4,
            name: "Open Air Theatre",
            type: "outdoor",
            capacity: 1000,
            features: ["Stage", "Sound System", "Lighting", "Seating Area"],
            status: "available",
            bookedSlots: [],
            images: [],
        },
        {
            id: 5,
            name: "Conference Room B",
            type: "room",
            capacity: 30,
            features: ["Smart TV", "Whiteboard", "AC", "Video Conferencing"],
            status: "booked",
            bookedSlots: ["2026-02-01 10:00-12:00"],
            images: [],
        },
    ]);

    // Clubs - fetch from /api/clubs
    const [clubs, setClubs] = useState<Club[]>([
        {
            id: 1,
            name: "Tech Club",
            description: "Technical club for coding enthusiasts. We organize hackathons, coding competitions, and tech workshops.",
            category: "Technical",
            logo: "💻",
            banner: "",
            members: 156,
            events: 12,
            isActive: true,
            role: "head",
            membersList: [
                { id: "list.append17@gmail.com", name: "List Append", phone: "9876543210", role: "head", online: true },
            ],
        },
        {
            id: 2,
            name: "Robotics Club",
            description: "Build robots, drones, and IoT projects. Participate in national and international robotics competitions.",
            category: "Technical",
            logo: "🤖",
            banner: "",
            members: 89,
            events: 8,
            isActive: true,
            role: "member",
            membersList: [],
        },
        {
            id: 3,
            name: "Drama Society",
            description: "Express yourself through theatre, street plays, and dramatic performances. Join us for cultural events!",
            category: "Cultural",
            logo: "🎭",
            banner: "",
            members: 120,
            events: 15,
            isActive: true,
            role: null,
            membersList: [],
        },
        {
            id: 4,
            name: "Photography Club",
            description: "Capture moments, learn editing, and showcase your work. Weekly photo walks and monthly exhibitions.",
            category: "Creative",
            logo: "📷",
            banner: "",
            members: 95,
            events: 20,
            isActive: true,
            role: "coordinator",
            membersList: [
                { id: "list.append17@gmail.com", name: "List Append", phone: "9876543210", role: "coordinator", online: true },
            ],
        },
        {
            id: 5,
            name: "Music Club",
            description: "From classical to rock, express yourself through music. Open jam sessions every weekend!",
            category: "Cultural",
            logo: "🎵",
            banner: "",
            members: 78,
            events: 10,
            isActive: true,
            role: null,
            membersList: [],
        },
    ]);

    // Chats - fetch from /api/chats
    const [chats, setChats] = useState<Chat[]>([
        {
            id: 0,
            name: "AI Assistant",
            lastMessage: "How can I help you today?",
            time: "Now",
            unread: 0,
            avatar: "🤖",
            type: "ai",
        },
        // Other chats fetched from database
    ]);

    // Messages - fetch from /api/messages
    const [messages, setMessages] = useState<{ [chatId: number]: Message[] }>({
        0: [
            { id: 1, chatId: 0, senderId: "ai", senderName: "AI Assistant", text: "Hello! 👋 I'm your Campus Hive AI assistant. How can I help you today?\n\nYou can ask me about events, clubs, resources, or anything related to campus activities!", time: "Now", isMe: false, read: true },
        ],
        // Other messages fetched from database
    });

    // Default AI message for resetting chat
    const defaultAIMessage: Message = {
        id: 1, chatId: 0, senderId: "ai", senderName: "AI Assistant", 
        text: "Hello! 👋 I'm your Campus Hive AI assistant. How can I help you today?\n\nYou can ask me about events, clubs, resources, or anything related to campus activities!", 
        time: "Now", isMe: false, read: true
    };

    // Custom setUser that clears messages when user changes
    const handleSetUser = (newUser: User | null) => {
        // If logging out or switching users, reset messages
        if (!newUser || (user && newUser.id !== user.id)) {
            setMessages({
                0: [defaultAIMessage],
            });
            setChats([{
                id: 0,
                name: "AI Assistant",
                lastMessage: "How can I help you today?",
                time: "Now",
                unread: 0,
                avatar: "🤖",
                type: "ai",
            }]);
        }
        setUser(newUser);
    };

    // Store Items - fetch from /api/store
    const [storeItems, setStoreItems] = useState<StoreItem[]>([
        {
            id: 1,
            title: "Engineering Mathematics Textbook",
            description: "Brand new, unused. Complete syllabus covered. Perfect for 1st and 2nd year students.",
            price: 450,
            isFree: false,
            image: "",
            images: [],
            sellerId: "list.append17@gmail.com",
            sellerName: "List Append",
            quantity: 1,
            category: "Books",
            condition: "New",
            pendingRequests: 2,
        },
        {
            id: 2,
            title: "Arduino Starter Kit",
            description: "Complete Arduino UNO kit with sensors, LEDs, jumper wires, and project book. Used for 1 semester.",
            price: 1200,
            isFree: false,
            image: "",
            images: [],
            sellerId: "list.append17@gmail.com",
            sellerName: "List Append",
            quantity: 1,
            category: "Electronics",
            condition: "Good",
            pendingRequests: 3,
        },
        {
            id: 3,
            title: "Scientific Calculator (Casio fx-991ES)",
            description: "Works perfectly. Selling because I graduated. Comes with cover.",
            price: 800,
            isFree: false,
            image: "",
            images: [],
            sellerId: "list.append17@gmail.com",
            sellerName: "List Append",
            quantity: 1,
            category: "Electronics",
            condition: "Good",
            pendingRequests: 1,
        },
        {
            id: 4,
            title: "Free Lab Coat",
            description: "White lab coat, size M. Used for chemistry lab. Giving away for free!",
            price: 0,
            isFree: true,
            image: "",
            images: [],
            sellerId: "list.append17@gmail.com",
            sellerName: "List Append",
            quantity: 2,
            category: "Clothing",
            condition: "Fair",
            pendingRequests: 5,
        },
        {
            id: 5,
            title: "Data Structures Notes Bundle",
            description: "Handwritten notes for DSA. Includes all topics with solved examples.",
            price: 150,
            isFree: false,
            image: "",
            images: [],
            sellerId: "list.append17@gmail.com",
            sellerName: "List Append",
            quantity: 3,
            category: "Notes",
            condition: "Good",
            pendingRequests: 4,
        },
    ]);

    // Notes - fetch from /api/notes
    const [notes, setNotes] = useState<Note[]>([
        {
            id: 1,
            title: "Data Structures Complete Notes",
            description: "Comprehensive notes covering arrays, linked lists, trees, graphs, sorting, and searching algorithms with solved examples.",
            type: "Notes",
            subject: "Data Structures",
            fileUrl: "",
            fileType: "pdf",
            uploaderId: "list.append17@gmail.com",
            uploaderName: "List Append",
            price: 0,
            isFree: true,
            requiresApproval: false,
            downloads: 156,
            uploadDate: "2026-01-15",
        },
        {
            id: 2,
            title: "Machine Learning Cheat Sheet",
            description: "Quick reference for ML algorithms, formulas, and Python code snippets. Perfect for exam prep!",
            type: "Cheat Sheet",
            subject: "Machine Learning",
            fileUrl: "",
            fileType: "pdf",
            uploaderId: "list.append17@gmail.com",
            uploaderName: "List Append",
            price: 50,
            isFree: false,
            requiresApproval: false,
            downloads: 89,
            uploadDate: "2026-01-20",
        },
        {
            id: 3,
            title: "Database Management Lab Manual",
            description: "Complete lab manual with SQL queries, ER diagrams, and normalization examples.",
            type: "Lab Manual",
            subject: "DBMS",
            fileUrl: "",
            fileType: "pdf",
            uploaderId: "list.append17@gmail.com",
            uploaderName: "List Append",
            price: 0,
            isFree: true,
            requiresApproval: true,
            downloads: 234,
            uploadDate: "2026-01-10",
        },
        {
            id: 4,
            title: "Operating Systems Previous Year Papers",
            description: "Last 5 years question papers with solutions. Covers all important topics.",
            type: "Previous Papers",
            subject: "Operating Systems",
            fileUrl: "",
            fileType: "pdf",
            uploaderId: "list.append17@gmail.com",
            uploaderName: "List Append",
            price: 100,
            isFree: false,
            requiresApproval: false,
            downloads: 312,
            uploadDate: "2026-01-25",
        },
        {
            id: 5,
            title: "Web Development Project Report Template",
            description: "Ready-to-use project report template following university guidelines. Just fill in your content!",
            type: "Template",
            subject: "Web Development",
            fileUrl: "",
            fileType: "pdf",
            uploaderId: "list.append17@gmail.com",
            uploaderName: "List Append",
            price: 0,
            isFree: true,
            requiresApproval: false,
            downloads: 178,
            uploadDate: "2026-01-28",
        },
    ]);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const addEvent = (event: Event) => {
        setEvents([...events, event]);
    };

    const deleteEvent = (id: number) => {
        setEvents(events.filter((e) => e.id !== id));
    };

    const updateEvent = (id: number, updates: Partial<Event>) => {
        setEvents(events.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    };

    const addEventReview = (eventId: number, review: Review) => {
        setEvents(
            events.map((e) => {
                if (e.id === eventId) {
                    const newReviews = [...(e.reviews || []), review];
                    const avgRating = newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length;
                    return { ...e, reviews: newReviews, rating: avgRating };
                }
                return e;
            })
        );
    };

    const bookResource = (id: number, slot: string) => {
        setResources(
            resources.map((r) =>
                r.id === id
                    ? { ...r, status: "booked", bookedSlots: [...r.bookedSlots, slot] }
                    : r
            )
        );
    };

    const cancelResourceBooking = (id: number, slot: string) => {
        setResources(
            resources.map((r) => {
                if (r.id === id) {
                    const newSlots = r.bookedSlots.filter((s) => s !== slot);
                    return { 
                        ...r, 
                        bookedSlots: newSlots,
                        status: newSlots.length === 0 ? "available" : r.status
                    };
                }
                return r;
            })
        );
    };

    const joinClub = (id: number) => {
        const club = clubs.find((c) => c.id === id);
        if (club) {
            setClubs(
                clubs.map((c) =>
                    c.id === id ? { ...c, role: "member", members: c.members + 1 } : c
                )
            );

            const newChat: Chat = {
                id: chats.length + 1,
                name: club.name,
                lastMessage: "You joined the club!",
                time: "Just now",
                unread: 0,
                avatar: club.logo,
                type: "club",
                members: club.membersList,
            };
            setChats([...chats, newChat]);

            setMessages({
                ...messages,
                [newChat.id]: [
                    {
                        id: 1,
                        chatId: newChat.id,
                        senderId: "system",
                        senderName: "System",
                        text: `Welcome to ${club.name}! Feel free to introduce yourself.`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isMe: false,
                    },
                ],
            });
        }
    };

    const leaveClub = (id: number) => {
        const club = clubs.find((c) => c.id === id);
        if (club) {
            setClubs(
                clubs.map((c) =>
                    c.id === id ? { ...c, role: null, members: c.members - 1 } : c
                )
            );
            setChats(chats.filter((chat) => chat.name !== club.name));
        }
    };

    const addChat = (chat: Chat) => {
        setChats([...chats, chat]);
    };

    const addMessage = (chatId: number, message: Message) => {
        setMessages({
            ...messages,
            [chatId]: [...(messages[chatId] || []), message],
        });

        setChats(
            chats.map((chat) =>
                chat.id === chatId
                    ? { ...chat, lastMessage: message.text, time: "Just now" }
                    : chat
            )
        );

        // Simulate bot response after 2 seconds
        setTimeout(() => {
            const chat = chats.find((c) => c.id === chatId);
            if (chat && chat.members && chat.members.length > 0) {
                const randomMember = chat.members[Math.floor(Math.random() * chat.members.length)];
                const botResponse: Message = {
                    id: (messages[chatId]?.length || 0) + 2,
                    chatId,
                    senderId: randomMember.id,
                    senderName: randomMember.name,
                    text: getRandomResponse(),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: false,
                };

                setMessages((prev) => ({
                    ...prev,
                    [chatId]: [...(prev[chatId] || []), botResponse],
                }));

                setChats((prevChats) =>
                    prevChats.map((c) =>
                        c.id === chatId
                            ? { ...c, lastMessage: botResponse.text, time: "Just now", unread: c.unread + 1 }
                            : c
                    )
                );
            }
        }, 2000);
    };

    const getRandomResponse = () => {
        const responses = [
            "That's interesting!",
            "I agree with you.",
            "Thanks for sharing!",
            "Let's discuss this further.",
            "Great point!",
            "I'll look into that.",
            "Sounds good to me!",
            "Can you elaborate?",
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    const addStoreItem = (item: StoreItem) => {
        setStoreItems([...storeItems, item]);
    };

    const requestStoreItem = (id: number) => {
        setStoreItems(
            storeItems.map((item) =>
                item.id === id
                    ? { ...item, quantity: item.quantity - 1, pendingRequests: item.pendingRequests + 1 }
                    : item
            )
        );
    };

    const cancelStoreRequest = (id: number) => {
        setStoreItems(
            storeItems.map((item) =>
                item.id === id && item.pendingRequests > 0
                    ? { ...item, quantity: item.quantity + 1, pendingRequests: item.pendingRequests - 1 }
                    : item
            )
        );
    };

    const addNote = (note: Note) => {
        setNotes([...notes, note]);
    };

    const downloadNote = (id: number) => {
        setNotes(
            notes.map((note) =>
                note.id === id ? { ...note, downloads: note.downloads + 1 } : note
            )
        );
    };

    // New functions for enhanced features
    const markChatAsRead = (chatId: number) => {
        setChats(
            chats.map((chat) =>
                chat.id === chatId ? { ...chat, unread: 0 } : chat
            )
        );
        setMessages((prev) => ({
            ...prev,
            [chatId]: (prev[chatId] || []).map((msg) => ({ ...msg, read: true })),
        }));
    };

    const sendAIMessage = async (text: string) => {
        const userMessage: Message = {
            id: (messages[0]?.length || 0) + 1,
            chatId: 0,
            senderId: user?.id || "user",
            senderName: user?.name || "You",
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
            read: true,
        };

        setMessages((prev) => ({
            ...prev,
            0: [...(prev[0] || []), userMessage],
        }));

        setChats((prevChats) =>
            prevChats.map((c) =>
                c.id === 0 ? { ...c, lastMessage: text, time: "Just now" } : c
            )
        );

        // Call real AI API
        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    context: {
                        events: events.map(e => ({
                            title: e.title,
                            date: e.date,
                            location: e.location,
                            status: e.status,
                            participants: e.participants
                        })),
                        clubs: clubs.map(c => ({
                            name: c.name,
                            category: c.category,
                            members: c.members,
                            isActive: c.isActive
                        })),
                        resources: resources.map(r => ({
                            name: r.name,
                            type: r.type,
                            capacity: r.capacity,
                            status: r.status
                        }))
                    }
                }),
            });

            const data = await res.json();
            const responseText = data.response || getAIResponse(text, events, clubs, resources);

            const aiResponse: Message = {
                id: (messages[0]?.length || 0) + 2,
                chatId: 0,
                senderId: "ai",
                senderName: "AI Assistant",
                text: responseText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: false,
                read: false,
            };

            setMessages((prev) => ({
                ...prev,
                0: [...(prev[0] || []), aiResponse],
            }));

            setChats((prevChats) =>
                prevChats.map((c) =>
                    c.id === 0 ? { ...c, lastMessage: aiResponse.text.substring(0, 30) + "...", time: "Just now", unread: 1 } : c
                )
            );
        } catch (error) {
            // Fallback to local response on error
            const aiResponse: Message = {
                id: (messages[0]?.length || 0) + 2,
                chatId: 0,
                senderId: "ai",
                senderName: "AI Assistant",
                text: getAIResponse(text, events, clubs, resources),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: false,
                read: false,
            };

            setMessages((prev) => ({
                ...prev,
                0: [...(prev[0] || []), aiResponse],
            }));

            setChats((prevChats) =>
                prevChats.map((c) =>
                    c.id === 0 ? { ...c, lastMessage: aiResponse.text.substring(0, 30) + "...", time: "Just now", unread: 1 } : c
                )
            );
        }
    };

    const findUserByPhone = (phone: string): ClubMember | undefined => {
        return registeredUsers.find((u) => u.phone === phone);
    };

    const addEventImages = (eventId: number, images: string[]) => {
        setEvents(
            events.map((e) =>
                e.id === eventId
                    ? { ...e, images: [...(e.images || []), ...images].slice(0, 5) }
                    : e
            )
        );
    };

    const addResourceImages = (resourceId: number, images: ResourceImage[]) => {
        setResources(
            resources.map((r) =>
                r.id === resourceId
                    ? { ...r, images: [...(r.images || []), ...images].slice(0, 5) }
                    : r
            )
        );
    };

    const updateClub = (id: number, updates: Partial<Club>) => {
        setClubs(clubs.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    };

    const startDirectChat = (targetUser: ClubMember): number => {
        const existingChat = chats.find(
            (c) => c.type === "direct" && c.name === targetUser.name
        );
        if (existingChat) return existingChat.id;

        const newChatId = Math.max(...chats.map((c) => c.id)) + 1;
        const newChat: Chat = {
            id: newChatId,
            name: targetUser.name,
            lastMessage: "Start a conversation",
            time: "Now",
            unread: 0,
            avatar: targetUser.avatar || "👤",
            type: "direct",
            members: [targetUser],
        };
        setChats([...chats, newChat]);
        setMessages((prev) => ({ ...prev, [newChatId]: [] }));
        return newChatId;
    };

    return (
        <AppContext.Provider
            value={{
                user,
                setUser: handleSetUser,
                events,
                addEvent,
                deleteEvent,
                updateEvent,
                addEventReview,
                addEventImages,
                resources,
                bookResource,
                cancelResourceBooking,
                addResourceImages,
                clubs,
                joinClub,
                leaveClub,
                updateClub,
                chats,
                addChat,
                messages,
                addMessage,
                markChatAsRead,
                sendAIMessage,
                startDirectChat,
                storeItems,
                addStoreItem,
                requestStoreItem,
                cancelStoreRequest,
                notes,
                addNote,
                downloadNote,
                registeredUsers,
                findUserByPhone,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
