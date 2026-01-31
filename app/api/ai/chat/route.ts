import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are Campus Hive AI, a friendly and helpful assistant for a campus management platform. 

You help students with:
1. **Events**: Information about campus events, hackathons, fests, workshops
2. **Resources**: Booking halls, rooms, labs, equipment
3. **Clubs**: Joining clubs, club activities, member information
4. **Store**: Buying/selling items within campus
5. **Notes**: Sharing and accessing academic resources

Your personality:
- Friendly, warm, and approachable - you're like a helpful friend!
- You can engage in casual conversation (greetings, how are you, small talk)
- Use emojis occasionally to be engaging 😊
- Be conversational and natural
- Always be helpful and offer assistance

IMPORTANT: You CAN respond to general greetings and casual conversation!
- If someone says "hi", "hello", greet them back warmly
- If someone asks "how are you", respond naturally like a friendly assistant
- If someone thanks you, respond graciously
- After casual chat, you can offer to help with campus-related tasks

Context you have access to:
- Current events on campus
- Available resources for booking
- List of clubs and their details
- Store items available

Format your responses nicely with bullet points when listing multiple items.`;

export async function POST(request: NextRequest) {
    try {
        const { message, context } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
            // Fallback to intelligent mock responses
            const response = generateMockResponse(message, context);
            return NextResponse.json({
                response,
                source: 'mock',
            });
        }

        // Use Google Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Build context from provided data
        let contextString = '';
        if (context) {
            if (context.events && context.events.length > 0) {
                contextString += `\n\nCurrent Events:\n${context.events.map((e: any) => 
                    `- ${e.title} on ${e.date} at ${e.location} (${e.status})`
                ).join('\n')}`;
            }
            if (context.clubs && context.clubs.length > 0) {
                contextString += `\n\nClubs:\n${context.clubs.map((c: any) => 
                    `- ${c.name}: ${c.description} (${c.members} members)`
                ).join('\n')}`;
            }
            if (context.resources && context.resources.length > 0) {
                contextString += `\n\nResources:\n${context.resources.map((r: any) => 
                    `- ${r.name} (${r.type}) - ${r.status}, capacity: ${r.capacity}`
                ).join('\n')}`;
            }
        }

        const fullPrompt = `${SYSTEM_PROMPT}${contextString}\n\nUser: ${message}\n\nAssistant:`;

        const result = await model.generateContent(fullPrompt);
        const response = result.response.text();

        return NextResponse.json({
            response,
            source: 'gemini',
        });
    } catch (error: any) {
        console.error('AI Chat error:', error);
        
        // Fallback to mock response on error
        const { message, context } = await request.clone().json().catch(() => ({ message: '', context: null }));
        const response = generateMockResponse(message || '', context);
        
        return NextResponse.json({
            response,
            source: 'fallback',
            error: error.message,
        });
    }
}

function generateMockResponse(message: string, context: any): string {
    const lowerMessage = message.toLowerCase();

    // Events related queries
    if (lowerMessage.includes('event') || lowerMessage.includes('fest') || lowerMessage.includes('hackathon')) {
        if (context?.events && context.events.length > 0) {
            const eventList = context.events
                .map((e: any) => `• **${e.title}** - ${new Date(e.date).toLocaleDateString()} at ${e.location}`)
                .join('\n');
            return `📅 Here are the campus events:\n\n${eventList}\n\nWould you like more details about any specific event?`;
        }
        return "📅 There are no events scheduled at the moment. Check back later or create a new event from the Events page!";
    }

    // Club related queries
    if (lowerMessage.includes('club') || lowerMessage.includes('join') || lowerMessage.includes('member')) {
        if (context?.clubs && context.clubs.length > 0) {
            const clubList = context.clubs
                .map((c: any) => `• **${c.name}** (${c.category}) - ${c.members} members`)
                .join('\n');
            return `👥 Here are the available clubs:\n\n${clubList}\n\nYou can join any club from the Clubs page!`;
        }
        return "👥 No clubs are available yet. Be the first to create one!";
    }

    // Resource related queries
    if (lowerMessage.includes('book') || lowerMessage.includes('room') || lowerMessage.includes('hall') || lowerMessage.includes('resource')) {
        if (context?.resources && context.resources.length > 0) {
            const available = context.resources.filter((r: any) => r.status === 'available');
            if (available.length > 0) {
                const resourceList = available
                    .map((r: any) => `• **${r.name}** (${r.type}) - Capacity: ${r.capacity}`)
                    .join('\n');
                return `🏢 Available resources for booking:\n\n${resourceList}\n\nHead to the Resources page to make a booking!`;
            }
        }
        return "🏢 All resources are currently booked. Please check back later!";
    }

    // Store related queries
    if (lowerMessage.includes('store') || lowerMessage.includes('buy') || lowerMessage.includes('sell') || lowerMessage.includes('item')) {
        return "🛒 You can buy and sell items in the Campus Store!\n\n• Browse available items\n• List your own items for sale\n• Request to purchase from other students\n\nVisit the Store page to explore!";
    }

    // Notes related queries
    if (lowerMessage.includes('note') || lowerMessage.includes('study') || lowerMessage.includes('material')) {
        return "📚 The Notes section has academic resources shared by students!\n\n• Download free notes\n• Share your own notes\n• Find study materials by subject\n\nCheck out the Notes page for more!";
    }

    // Help queries
    if (lowerMessage.includes('help') || lowerMessage.includes('what can') || lowerMessage.includes('how')) {
        return "👋 I can help you with:\n\n• 📅 **Events** - Find and manage campus events\n• 🏢 **Resources** - Book halls, rooms, and equipment\n• 👥 **Clubs** - Join and explore campus clubs\n• 🛒 **Store** - Buy and sell items\n• 📚 **Notes** - Access study materials\n\nJust ask me anything about these topics!";
    }

    // Greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! 👋 I'm your Campus Hive AI assistant. How can I help you today?\n\nYou can ask me about events, clubs, resources, the store, or anything related to campus activities!";
    }

    // How are you
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how r u') || lowerMessage.includes('how\'re you')) {
        return "I'm doing great, thanks for asking! 😊 I'm here and ready to help you with anything campus-related.\n\nHow can I assist you today?";
    }

    // What's up / Wassup
    if (lowerMessage.includes('what\'s up') || lowerMessage.includes('whats up') || lowerMessage.includes('wassup') || lowerMessage.includes('sup')) {
        return "Hey! Not much, just here to help! 🎓\n\nWhat can I do for you today?";
    }

    // Good morning/afternoon/evening
    if (lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening') || lowerMessage.includes('good night')) {
        const greeting = lowerMessage.includes('morning') ? 'Good morning' : 
                        lowerMessage.includes('afternoon') ? 'Good afternoon' : 
                        lowerMessage.includes('evening') ? 'Good evening' : 'Good night';
        return `${greeting}! 🌟 Hope you're having a great day!\n\nHow can I help you?`;
    }

    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return "You're welcome! 😊 Let me know if you need anything else. Happy to help!";
    }

    // Bye/Goodbye
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
        return "Goodbye! 👋 Have a great day! Feel free to come back anytime you need help.";
    }

    // Default response
    return "I'm here to help with campus-related queries! 🎓\n\nYou can ask me about:\n• Upcoming events\n• Booking resources\n• Joining clubs\n• The campus store\n• Study materials\n\nWhat would you like to know?";
}
