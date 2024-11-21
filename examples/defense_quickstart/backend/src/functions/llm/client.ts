import OpenAI from "openai/index";
import "dotenv/config";

let openaiInstance: OpenAI | null = null;

export const llmClient = ({
    baseURL
}: {
    baseURL: string;
}): OpenAI => {
    if (!baseURL) {
        throw new Error("Base URL is required to create llm client.");
    }

    if (!openaiInstance) {
        openaiInstance = new OpenAI({
            baseURL,
        });
    }
    return openaiInstance;
};
