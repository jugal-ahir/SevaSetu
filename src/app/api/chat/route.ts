import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";
import { getAuthToken } from "@/lib/auth";

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();
        const token = await getAuthToken();
        const userId = token?.sub;

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { response: "I'm currently unable to process requests because my brain (API Key) is missing. Please contact the admin." },
                { status: 503 }
            );
        }

        // 1. Check for Grievance Status Query
        // Simple regex to catch "status of [id]" or "check [id]"
        const grievanceIdMatch = message.match(/(?:status|check|grievance)\s*(?:of|for)?\s*#?([a-zA-Z0-9-]{10,})/i);

        if (grievanceIdMatch) {
            const grievanceId = grievanceIdMatch[1];
            const grievance = await prisma.grievance.findUnique({
                where: { id: grievanceId },
                select: { status: true, title: true, priority: true }
            });

            if (grievance) {
                return NextResponse.json({
                    response: `The status of grievance **"${grievance.title}"** (ID: ${grievanceId}) is **${grievance.status}**. It is marked as **${grievance.priority}** priority.`
                });
            } else {
                return NextResponse.json({
                    response: `I couldn't find a grievance with ID **${grievanceId}**. Please double-check the ID.`
                });
            }
        }

        // 2. Default: Use Groq for General Queries
        const systemPrompt = `
      You are SevaSahayak, the intelligent AI assistant for SevaSetu.
      
      **Your Goal:**
      Assist citizens with filing grievances, tracking status, and understanding municipal services in the **USER'S PREFERRED LANGUAGE** (English, Hindi, Gujarati, etc.).

      **Language Rules:**
      - **Detect the language** of the user's message.
      - **Respond in the SAME language**.
      - If the user writes in Hindi (Devanagari or Hinglish), reply in Hindi.
      - If the user writes in Gujarati, reply in Gujarati.
      - Maintain the polite and helpful tone in all languages.

      **App Terminology (Translate these accurately, but keep English terms in brackets if helpful):**
      - Action: "Submit New Grievance" (नई शिकायत दर्ज करें)
      - Action: "Track Grievance" (शिकayat की स्थिति देखें)
      - Field: "Grievance Title" (शीर्षक)
      - Field: "Description" (विवरण)
      - Button: "Submit" (जमा करें)
      
      **Formatting Rules:**
      - Use **Bold** for all button names, field names, and key terms.
      - Use Lists (bullet points) for steps.
      - Keep responses concise and clean.
      - properly break lines between steps.
      
      **Context:**
      SevaSetu allows citizens to report issues like Potholes (Roads), Garbage (Sanitation), No Water (Water Dept), etc.
    `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: message,
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        const responseText = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        return NextResponse.json({ response: responseText });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { response: "I'm having trouble connecting to the server right now. Please try again later." },
            { status: 500 }
        );
    }
}
