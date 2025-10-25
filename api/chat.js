import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    // CORS headers for iframe/cross-origin support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ reply: "Please enter a message." });
    }

    try {
        // System instruction for better prompt separation
        const systemInstruction = `You are a travel assistant for a tour company. 
        Only answer questions related to:
        - Travel destinations
        - Tour packages
        - Booking information
        - Travel tips
        - Company services
        - Business hours
        - Pricing
        
        If asked about unrelated topics, respond with:
        "I can only assist with travel and tour-related questions. How can I help you with your travel plans?"`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
            systemInstruction: systemInstruction
        });
        const result = await chat.sendMessage(message);
        const text = result.response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        let errorReply = "I'm having trouble processing your request right now.";
        if (error.message && error.message.includes('API key')) {
            errorReply = "API configuration issue—please contact the administrator.";
        }
        res.status(500).json({ reply: errorReply });
    }
}
