import { llamaIndexTogetherClient } from "./utils/llamaIndexTogetherClient";
import { TogetherLLM } from "llamaindex";

export async function llamaIndexQueryTogether({ query, model }: { query: string, model: TogetherLLM["model"] }) {
    const client = llamaIndexTogetherClient({ model });

    const response = await client.chat({
        messages: [{ role: "user", content: query }],
    });

    return response;
}