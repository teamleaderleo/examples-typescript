import { step } from "@restackio/ai/workflow";
import * as functions from "../functions";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const MessageSchema = z.object({
    message: z.string().describe("The greeting message."),
});

const jsonSchema = zodToJsonSchema(MessageSchema, 'Message');

export async function chatCompletionBasic({ name }: { name: string }) {

    // Step 1 create greeting message with meta-llama without response format

    const greetingOutput = await step<typeof functions>({
        taskQueue: 'together',
    }).togetherChatCompletionBasic({
        messages: [{ "role": "user", "content": `Write a greeting message to ${name}` }],
        model: 'meta-llama/Llama-3.2-3B-Instruct-Turbo',


    });

    // Step 2 create a response with response format with a model supporting response format

    const goodbyeOutput = await step<typeof functions>({
        taskQueue: 'together',
    }).togetherChatCompletionBasic({
        messages: [{ "role": "user", "content": `Write a goodbye message to ${name}` }],
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        response_format: {
            type: 'json_object',
            // @ts-ignore
            schema: jsonSchema
        },
    });

    return {
        greetingOutput,
        goodbyeOutput
    };
}

