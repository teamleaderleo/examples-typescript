import { step } from "@restackio/ai/workflow";
import * as functions from "../functions";


export async function llamaindexTogetherSimple() {
    // Step 1: Query a model with the llamaIndex and Together integration
    const response = await step<typeof functions>({
    }).llamaIndexQueryTogether({
        query: "What is the meaning of life?",
        model: "meta-llama/Llama-3.2-3B-Instruct-Turbo"
    });

    return response;
}