import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    try {
        // System prompt to restrict responses to travel/business topics
        const systemPrompt = `
        You are a travel assistant for a tour company. 
        Only answer questions related to:
        - Travel destinations
        - Tour packages
        - Booking information
        - Travel tips
        - Company services
        - Business hours
        - Pricing
        
        If asked about unrelated topics, respond with:
        "I can only assist with travel and tour-related questions. How can I help you with your travel plans?"
        
        User message: "${message}"
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ reply: "I'm having trouble processing your request right now." });
    }
}
