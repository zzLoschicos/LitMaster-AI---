import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TextType, AnalysisResult } from "../types";

// This system instruction encapsulates the rules from the provided PDFs.
const SYSTEM_INSTRUCTION = `
You are "Zhuang Zhuang" (壮壮), a world-class Chinese Literature Exam Expert (语文冲刺提分教练).
Your goal is to analyze texts (Prose/散文, Poetry/诗歌, Novels/小说) and generate standard exam answers based strictly on specific methodologies.

**CORE METHODOLOGIES (Do not deviate):**

1. **PROSE (散文):**
   - **Rhetoric:** Identify Metaphor, Personification (make things vivid), Parallelism (strength), Repetition (music/emphasis). 
   - **Sentence Roles:** Opening (set tone, foreshadow), Ending (summarize, elevate theme), Transitional (connect), Key/Eye (reveal theme).
   - **Answer Template:** "这里运用了[Method]的手法，写出了[Object]的[Feature]特点，表达了作者[Emotion]的思想感情。" (Used [Method], described [Feature] of [Object], expressed [Emotion]).

2. **POETRY (诗歌):**
   - **Imagery & Emotion:** Analyze imagery (Moon=Nostalgia, Willow=Parting).
   - **Techniques:** Direct/Indirect Lyricism, Contrast (Old vs New), Symbolism, Allusion.
   - **Answer Steps:** 1. Describe the scene (Image). 2. Name the technique. 3. Analyze emotion/intent.
   - **Template:** "诗句描述了……的画面，运用了……的手法，烘托了……的意境，抒发了……的感情。"

3. **NOVEL (小说):**
   - **Character:** Analyze Identity, Appearance, Psychology, Environment.
   - **Plot:** Opening, Development, Climax, Ending. Effect of plot on character/theme.
   - **Environment:** Natural (atmosphere, foreshadowing) vs Social (background, destiny).
   - **Answer Template for Characters:** "×××是一个[Personality Traits] + [Identity/Status]的人。"

**OUTPUT RULES:**
- Always be professional yet encouraging.
- When generating answers, use the *exact* templates defined above where applicable.
- For "Structure", provide a concise breakdown of the text flow.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A suitable title for the analysis" },
    summary: { type: Type.STRING, description: "A brief summary of the text content" },
    structure: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Step-by-step outline of the text structure" 
    },
    themes: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Key themes or emotions (e.g., Patriotism, Nostalgia)" 
    },
    techniques: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          example: { type: Type.STRING },
          effect: { type: Type.STRING }
        }
      },
      description: "Literary techniques found with specific examples and their effects"
    },
    generatedQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING, description: "An exam-style question based on the text" },
          type: { type: Type.STRING, description: "Category: Language, Theme, Plot, Character, etc." },
          standardAnswer: { type: Type.STRING, description: "The standard model answer using the formulas" },
          analysis: { type: Type.STRING, description: "Explanation of why this is the answer" }
        }
      }
    }
  },
  required: ["title", "summary", "structure", "themes", "techniques", "generatedQuestions"]
};

export const analyzeText = async (text: string, type: TextType): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze the following ${type} text strictly according to the 'Chinese Literature Exam' rules.
    
    TEXT:
    ${text}
    
    Generate 3-4 high-quality exam questions (e.g., about word choice, sentence role, character analysis, or thematic meaning).
    Ensure the "standardAnswer" follows the specific templates (e.g., "Method + Effect + Emotion").
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.3, // Lower temperature for more academic/standardized results
    }
  });

  const textResponse = response.text;
  if (!textResponse) throw new Error("No response from AI");

  const data = JSON.parse(textResponse);
  
  return {
    ...data,
    id: Date.now().toString(),
    textType: type,
    timestamp: Date.now(),
    originalText: text
  };
};

export const chatWithTutor = async (history: {role: string, parts: {text: string}[]}[], newMessage: string, contextText: string): Promise<string> => {
   if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + `\n\nContext Text for discussion:\n${contextText}`,
    },
    history: history.map(h => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: h.parts
    }))
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "Sorry, I couldn't generate a response.";
};
