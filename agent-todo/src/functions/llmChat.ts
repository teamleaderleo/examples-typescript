import { FunctionFailure, log } from "@restackio/ai/function";
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionAssistantMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";
import { z } from "zod";

import { openaiClient } from "../utils/client";

export type Message =
  | ChatCompletionSystemMessageParam
  | ChatCompletionUserMessageParam
  | ChatCompletionAssistantMessageParam
  | ChatCompletionToolMessageParam;

// Define schema for structured response format
export const ResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    content: z.string()
  }),
  z.object({
    type: z.literal("function_call"),
    function_name: z.string(),
    function_arguments: z.record(z.any())
  })
]);

export type StructuredResponse = z.infer<typeof ResponseSchema>;

// Input schema
export const LLMChatInputSchema = z.object({
  systemContent: z.string().optional().default(""),
  model: z.string().optional().default("gpt-4.1-mini"),
  messages: z.array(z.any()),
});

// Output schema
export const LLMChatOutputSchema = z.object({
  role: z.literal("assistant"),
  content: z.string().nullable(),
  structured_data: ResponseSchema.optional(),
});

export type LLMChatInput = z.infer<typeof LLMChatInputSchema>;
export type LLMChatOutput = z.infer<typeof LLMChatOutputSchema>;

// System prompt for structured output
const structuredOutputPrompt = `You are a helpful assistant that can create and execute todos. 
Respond with valid JSON in one of these formats:
- For general questions: {"type": "text", "content": "Your response"}
- For actions: {"type": "function_call", "function_name": "createTodo or executeTodoWorkflow", "function_arguments": {...}}`;

export const llmChat = async ({
  systemContent = "",
  model = "gpt-4.1-mini",
  messages,
}: LLMChatInput): Promise<LLMChatOutput> => {
  try {
    const openai = openaiClient({});

    // Combine system prompts if provided
    const finalSystemContent = systemContent
      ? `${structuredOutputPrompt}\n\n${systemContent}`
      : structuredOutputPrompt;

    // Set up response format for JSON
    const responseFormat = {
      type: "json_object" as const
    };

    // Chat parameters
    const chatParams: ChatCompletionCreateParamsNonStreaming = {
      messages: [{ role: "system", content: finalSystemContent }, ...messages],
      model,
      response_format: responseFormat,
    };

    log.debug("OpenAI chat completion params", { chatParams });

    const completion = await openai.chat.completions.create(chatParams);
    const message = completion.choices[0].message;

    // Parse structured data from JSON response
    let structuredData;
    if (message.content) {
      try {
        const parsedData = JSON.parse(message.content);
        // Validate against our schema
        const validationResult = ResponseSchema.safeParse(parsedData);
        if (validationResult.success) {
          structuredData = validationResult.data;
          log.debug("Structured response validated", { structuredData });
        } else {
          log.error("Invalid JSON structure", {
            errors: validationResult.error.errors,
            content: message.content
          });
        }
      } catch (error) {
        log.error("Failed to parse JSON response", { content: message.content });
      }
    }

    return {
      role: "assistant",
      content: message.content,
      structured_data: structuredData,
    };
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error in OpenAI chat: ${error}`);
  }
};
