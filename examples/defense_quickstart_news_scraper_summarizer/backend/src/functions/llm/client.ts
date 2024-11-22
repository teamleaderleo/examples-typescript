import OpenAI from "openai/index";
import dotenv from 'dotenv';

dotenv.config();

let openaiInstance: OpenAI | null = null;

export const llmClient = (): OpenAI => {
    if (!process.env.OPENBABYLON_API_URL) {
        throw new Error("OPENBABYLON_API_URL is not set in environment variables.");
    }

    if (!openaiInstance) {
        openaiInstance = new OpenAI({
            baseURL: process.env.OPENBABYLON_API_URL!,
            apiKey: `non-existent`,
        });
    }
    return openaiInstance;
};
