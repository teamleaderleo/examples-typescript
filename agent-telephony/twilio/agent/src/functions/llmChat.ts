import { FunctionFailure, log, streamToWebsocket } from "@restackio/ai/function";
import { ChatCompletionCreateParamsStreaming } from "openai/resources/chat/completions";

import { openaiClient } from "../utils/openaiClient";
import { apiAddress } from "../client";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenAIChatInput = {
  model?: string;
  messages: Message[];
};

export const llmChat = async ({
  model = "gpt-4o-mini",
  messages,
}: OpenAIChatInput): Promise<Message> => {
  try {
    const openai = openaiClient({});


    const chatParams: ChatCompletionCreateParamsStreaming = {
      messages,
      model,
      stream: true
    };

    log.debug("OpenAI chat completion params", {
      chatParams,
    });

    const completion = await openai.chat.completions.create(chatParams);

    log.debug("OpenAI chat completion", {
      completion,
    });


    const assistantContent = await streamToWebsocket({
      apiAddress,
      data: completion,
    });

    return {
      role: "assistant",
      content: assistantContent,
    };
   
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error OpenAI chat: ${error}`);
  }
};
