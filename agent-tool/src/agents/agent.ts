import {
  defineEvent,
  onEvent,
  condition,
  log,
  step,
} from "@restackio/ai/agent";
import * as functions from "../functions";
import { zodFunction } from "openai/helpers/zod";
import { LookupSalesInput } from "../functions/toolTypes";

export type EndEvent = {
  end: boolean;
};

export const messageEvent = defineEvent<functions.Message[]>("message");
export const endEvent = defineEvent("end");

type AgentChatOutput = {
  messages: functions.Message[];
};

export async function agentChat(): Promise<AgentChatOutput> {
  let endReceived = false;
  let messages: functions.Message[] = [];

  const tools = [
    zodFunction({
      name: functions.lookupSales.name,
      parameters: LookupSalesInput,
    }),
  ];

  onEvent(messageEvent, async ({ content }: functions.Message) => {
    messages.push({ role: "user", content });
    const result = await step<typeof functions.llmChat>({}).llmChat({
      messages,
      tools,
    });

    if (result.role === "tool") {
      const toolResult = await step<typeof functions.lookupSales>(
        {}
      ).lookupSales({
        category: result.content,
      });
      messages.push({
        role: "tool",
        content: toolResult,
        tool_call_id: result.tool_call_id,
      });

      const toolChatResult = await step<typeof functions.llmChat>({}).llmChat({
        messages,
        tools,
      });

      messages.push(toolChatResult);
    } else {
      messages.push(result);
    }
    return messages;
  });

  onEvent(endEvent, async () => {
    endReceived = true;
  });

  // We use the `condition` function to wait for the event goodbyeReceived to return `True`.
  await condition(() => endReceived);

  log.info("end condition met");
  return { messages };
}
