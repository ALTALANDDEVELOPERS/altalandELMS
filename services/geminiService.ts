


import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Content } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development; in production, the key should be set.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const geminiService = {
  analyzeLeaveData: async (allRequests: any[], prompt: string): Promise<string> => {
    try {
      const model = 'gemini-2.5-pro';
      const fullPrompt = `
        Analyze the following leave request data and provide insights based on the user's query.
        
        User Query: "${prompt}"
        
        Data (JSON format):
        ${JSON.stringify(allRequests, null, 2)}
        
        Please provide a detailed, insightful analysis.
      `;
      
      const response = await ai.models.generateContent({
        model: model,
        contents: fullPrompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });
      
      return response.text;
    } catch (error) {
      console.error("Error analyzing leave data:", error);
      return "An error occurred during analysis. Please check the data and try again.";
    }
  },
  
  getSmartSummary: async (allRequests: any[]): Promise<string> => {
    try {
      const model = 'gemini-2.5-flash';
      const prompt = `
        As an expert HR analyst, provide a brief, insightful summary of the following leave request data.
        Focus on identifying key trends, patterns, or notable outliers.
        Present the summary as a few concise bullet points.

        Data (JSON format):
        ${JSON.stringify(allRequests.map(r => ({ ...r, requesterName: r.requester.name, requester: undefined })), null, 2)}
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Error generating smart summary:", error);
      return "An error occurred while generating the summary. Please try again.";
    }
  },

  // FIX: Add getChatbotResponse method to power the chatbot.
  getChatbotResponse: async (history: Content[], newMessage: string): Promise<string> => {
    try {
      const model = 'gemini-2.5-flash';
      const chat = ai.chats.create({ 
        model, 
        history,
        config: {
          systemInstruction: `You are a helpful and friendly chatbot for Altaland, a company.
          Your name is 'Leave Policy Assistant'.
          You are an expert on the company's leave policies.
          Keep your answers concise and easy to understand.
          Do not answer questions that are not related to leave policies or general work-related queries.
          If you don't know the answer, say "I'm not sure about that. Please contact HR for more information."

          Here is the company's leave policy:
          - Vacation: Full-time employees get 20 days per year.
          - Sick Leave: 10 days per year. Unused sick days do not roll over. A doctor's note is required for sick leave longer than 3 consecutive days.
          - Personal Days: 5 days per year for personal matters.
          - Unpaid Leave: Can be requested in special circumstances and requires manager and HR approval.
          - All leave requests must be submitted through the Altaland Leave portal.`
        }
      });
      const response = await chat.sendMessage({ message: newMessage });
      return response.text;
    } catch (error) {
      console.error("Error in getChatbotResponse:", error);
      return "I'm sorry, I encountered an error while processing your request. Please try again later.";
    }
  },

  connectLive: (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
    // FIX: Remove Promise<LiveSession> return type as LiveSession is not an exported member.
  }) => {
    const leaveRequestFunctionDeclaration: FunctionDeclaration = {
      name: 'submitLeaveRequest',
      description: 'Submits a leave request for an employee.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          leaveType: {
            type: Type.STRING,
            description: 'The type of leave (e.g., Vacation, Sick, Personal).',
            enum: ['Vacation', 'Sick', 'Personal', 'Unpaid'],
          },
          startDate: {
            type: Type.STRING,
            description: 'The start date of the leave in YYYY-MM-DD format.',
          },
          endDate: {
            type: Type.STRING,
            description: 'The end date of the leave in YYYY-MM-DD format.',
          },
          reason: {
            type: Type.STRING,
            description: 'A brief reason for the leave request.',
          },
        },
        required: ['leaveType', 'startDate', 'endDate', 'reason'],
      },
    };

    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: `You are a voice assistant for our leave management system. 
        Your goal is to help employees submit leave requests. 
        Engage in a natural conversation to gather the required information (leave type, start date, end date, and reason).
        Confirm the details with the user before calling the submitLeaveRequest function.
        Today's date is ${new Date().toDateString()}.`,
        tools: [{ functionDeclarations: [leaveRequestFunctionDeclaration] }],
      },
    });
  }
};
