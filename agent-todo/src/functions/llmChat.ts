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
import { CreateTodoSchema, ExecuteTodoSchema } from "./toolTypes";

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

// Convert Zod schema to OpenAI function parameter schema
function zodToJsonSchema(schema: z.ZodType): any {
  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape();
    const properties: Record<string, any> = {};
    const required: string[] = [];

    Object.entries(shape).forEach(([key, value]) => {
      const zodField = value as z.ZodType;
      properties[key] = zodToJsonSchema(zodField);
      
      if (!zodField.isOptional()) {
        required.push(key);
      }
    });

    return {
      type: "object",
      properties,
      ...(required.length > 0 ? { required } : {}),
    };
  } else if (schema instanceof z.ZodString) {
    return { type: "string" };
  } else if (schema instanceof z.ZodNumber) {
    return { type: "number" };
  } else if (schema instanceof z.ZodBoolean) {
    return { type: "boolean" };
  } else if (schema instanceof z.ZodArray) {
    return {
      type: "array",
      items: zodToJsonSchema(schema._def.type),
    };
  } else if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema._def.innerType);
  } else {
    return { type: "string" }; // Default fallback
  }
}

// Define the available functions
const availableFunctions = [
  {
    schema: CreateTodoSchema,
    name: "createTodo",
    description: CreateTodoSchema.description || "Creates a new todo item"
  },
  {
    schema: ExecuteTodoSchema,
    name: "executeTodoWorkflow",
    description: ExecuteTodoSchema.description || "Executes a todo item"
  }
];

// Convert to OpenAI function format
const functionsForOpenAI = availableFunctions.map(fn => ({
  name: fn.name,
  description: fn.description,
  parameters: zodToJsonSchema(fn.schema),
}));

// Base system message
const baseSystemMessage = `You are a helpful assistant that can create and execute todos.
When a user asks to "do something" or "complete a task", you should:
1. First create the todo using createTodo
2. Then execute it using executeTodoWorkflow with the todoId from the previous step`;

export const llmChat = async ({
  systemContent = "",
  model = "gpt-4.1-mini",
  messages,
}: LLMChatInput): Promise<LLMChatOutput> => {
  try {
    const openai = openaiClient({});

    // Combine system messages
    const finalSystemContent = systemContent
      ? `${baseSystemMessage}\n\n${systemContent}`
      : baseSystemMessage;

    // Chat parameters with tools
    const chatParams: ChatCompletionCreateParamsNonStreaming = {
      messages: [{ role: "system", content: finalSystemContent }, ...messages],
      model,
      tools: functionsForOpenAI.map(fn => ({ type: "function", function: fn })),
      tool_choice: "auto",
    };

    log.debug("OpenAI chat completion params", { chatParams });

    const completion = await openai.chat.completions.create(chatParams);
    const message = completion.choices[0].message;
    
    // Ensure we have a string content or default to empty string
    const messageContent = message.content || "";
    
    // Parse function call if available
    let structuredData: StructuredResponse | undefined;
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.type === "function") {
        try {
          const functionArguments = JSON.parse(toolCall.function.arguments);
          structuredData = {
            type: "function_call" as const,
            function_name: toolCall.function.name,
            function_arguments: functionArguments,
          };
          log.debug("Function call detected", { structuredData });
        } catch (error) {
          log.error("Failed to parse function arguments", { 
            arguments: toolCall.function.arguments 
          });
        }
      }
    } else if (messageContent) {
      // Handle regular text response
      structuredData = {
        type: "text" as const,
        content: messageContent,
      };
    }

    return {
      role: "assistant",
      content: messageContent,
      structured_data: structuredData,
    };
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error in OpenAI chat: ${error}`);
  }
};
