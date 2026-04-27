
import { GoogleGenAI, Type } from "@google/genai";
import { Expense } from "../types";

export const getInsights = async (expenses: Expense[]) => {
  // Directly using process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analise o seguinte histórico de despesas de um veículo e forneça 3 dicas curtas e valiosas de economia ou manutenção em português:
    ${JSON.stringify(expenses)}
    
    Formato de resposta desejado: um array de strings.
  `;

  try {
    // Using gemini-3-flash-preview for text tasks with structured responseSchema
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "Uma dica curta de economia ou manutenção."
          },
          description: "Lista de 3 dicas valiosas para o usuário."
        }
      }
    });

    // Directly access .text property
    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Erro ao obter insights do Gemini:", error);
    return ["Mantenha os pneus calibrados para economizar combustível.", "Realize revisões periódicas conforme o manual.", "Evite acelerações bruscas para melhorar a média."];
  }
};
