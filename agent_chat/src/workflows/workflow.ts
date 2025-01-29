import { condition, log, step } from "@restackio/ai/workflow";
import * as functions from "../functions";
import { defineEvent, onEvent } from "@restackio/ai/event";

export type EndEvent = {
  end: boolean;
};

export const messageEvent = defineEvent<functions.Message>("message");

export const endEvent = defineEvent("end");

type AgentChatInput = {
  message: string;
};

type AgentChatOutput = {
  messages: functions.Message[];
};

export async function agentChat({
  message = "Hello, can you tell me a joke?",
}: AgentChatInput): Promise<AgentChatOutput> {
  let endReceived = false;
  let messages: functions.Message[] = [];

  onEvent(messageEvent, async ({ content }: functions.Message) => {
    messages.push({ role: "user", content });
    const result = await step<typeof functions>({}).llmChat({
      messages,
    });
    messages.push(result);
    return result;
  });

  onEvent(endEvent, async () => {
    endReceived = true;
  });

  const result = await step<typeof functions>({}).llmChat({
    messages: [{ role: "user", content: message }],
  });
  messages.push(result);

  // We use the `condition` function to wait for the event goodbyeReceived to return `True`.
  await condition(() => endReceived);

  log.info("end condition met");
  return { messages };
}
