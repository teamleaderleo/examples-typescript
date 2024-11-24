import { TogetherLLM, Settings } from "llamaindex";

export function llamaIndexTogetherClient({ model }: { model: TogetherLLM["model"] }) {
    Settings.llm = new TogetherLLM({
        apiKey: process.env.TOGETHER_API_KEY,
        model: model,
    });
    return Settings.llm;
}