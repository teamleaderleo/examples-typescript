import {
  defineEvent,
  onEvent,
  condition,
  log,
  step,
} from "@restackio/ai/agent";
import * as functions from "../functions";

export type EndEvent = {
  end: boolean;
};

export const messageEvent = defineEvent<functions.Message[]>("message");
export const endEvent = defineEvent("end");

type AgentChatOutput = {
  messages: functions.Message[];
};

export async function agentChatTool(): Promise<AgentChatOutput> {
  let endReceived = false;
  let messages: functions.Message[] = [];

  const salesData = await step<typeof functions>({}).lookupSales();

  onEvent(messageEvent, async ({ content }: functions.Message) => {
    messages.push({
      role: "system",
      content: `Your a sales assistant. Here is the sales data: ${salesData}`,
    });
    messages.push({ role: "user", content: content?.toString() ?? "" });

    const result = await step<typeof functions>({}).llmChat({
      messages,
    });

    messages.push({ role: "assistant", content: result });
    return messages;
  });

  onEvent(endEvent, async () => {
    endReceived = true;
  });

  await condition(() => endReceived);

  log.info("end condition met");
  return { messages };
}
