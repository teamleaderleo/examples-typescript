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

  const tools = await step<typeof functions.getTools>({}).getTools();

  onEvent(messageEvent, async ({ content }: functions.Message) => {
    messages.push({ role: "user", content });
    const result = await step<typeof functions.llmChat>({}).llmChat({
      messages,
      tools,
    });

    messages.push(result);

    if (result.tool_calls) {
      for (const toolCall of result.tool_calls) {
        switch (toolCall.function.name) {
          case "lookupSales":
            const toolResult = await step<typeof functions.lookupSales>(
              {}
            ).lookupSales(JSON.parse(toolCall.function.arguments));

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            });

            const toolChatResult = await step<typeof functions.llmChat>(
              {}
            ).llmChat({
              messages,
              tools,
            });

            messages.push(toolChatResult);

            break;
          default:
            break;
        }
      }
    }
    return messages;
  });

  onEvent(endEvent, async () => {
    endReceived = true;
  });

  await condition(() => endReceived);

  log.info("end condition met");
  return { messages };
}
