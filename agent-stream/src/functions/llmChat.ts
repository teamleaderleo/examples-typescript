import { FunctionFailure, log } from "@restackio/ai/function";
import { ChatCompletionCreateParamsStreaming } from "openai/resources/chat/completions";
import { streamToWebsocket } from "./stream";

import { openaiClient } from "../utils/client";
import { apiAddress } from "../client";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenAIChatInput = {
  systemContent?: string;
  model?: string;
  messages: Message[];
};

export const llmChat = async ({
  systemContent = "",
  model = "gpt-4o-mini",
  messages,
}: OpenAIChatInput): Promise<Message> => {
  try {
    const openai = openaiClient({});

    const chatParams: ChatCompletionCreateParamsStreaming = {
      messages: [
        ...(systemContent
          ? [{ role: "system" as const, content: systemContent }]
          : []),
        ...(messages ?? []),
      ],
      model,
      stream: true,
    };

    log.debug("OpenAI chat completion params", {
      chatParams,
    });

    const completion = await openai.chat.completions.create(chatParams);

    log.debug("OpenAI chat completion", {
      completion,
    });

    const assistantContent = await streamToWebsocket(apiAddress, completion);

    log.debug("Assistant content", {
      assistantContent,
    });

    return {
      role: "assistant",
      content: assistantContent,
    };
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error OpenAI chat: ${error}`);
  }
};
