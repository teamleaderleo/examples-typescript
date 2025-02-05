import {
  defineEvent,
  onEvent,
  condition,
  log,
  step,
} from "@restackio/ai/agent";
import * as functions from "../functions";
import { childExecute } from "@restackio/ai/workflow";
import { executeTodoWorkflow } from "../workflows/executeTodo";

export type EndEvent = {
  end: boolean;
};

export const messageEvent = defineEvent<functions.Message[]>("message");
export const endEvent = defineEvent("end");

type agentTodoOutput = {
  messages: functions.Message[];
};

export async function agentTodo(): Promise<agentTodoOutput> {
  let endReceived = false;
  let messages: functions.Message[] = [];

  const tools = await step<typeof functions>({}).getTools();

  onEvent(messageEvent, async ({ content }: functions.Message) => {
    messages.push({ role: "user", content: content?.toString() ?? "" });
    const result = await step<typeof functions>({}).llmChat({
      messages,
      tools,
    });

    messages.push({ role: "assistant", content: result.content });

    if (result.tool_calls) {
      for (const toolCall of result.tool_calls) {
        switch (toolCall.function.name) {
          case "createTodo":
            const toolResult = await step<typeof functions>({}).createTodo(
              JSON.parse(toolCall.function.arguments)
            );

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            });

            const toolChatResult = await step<typeof functions>({}).llmChat({
              messages,
              tools,
            });

            messages.push({
              role: "assistant",
              content: toolChatResult.content,
            });

            break;
          case "executeTodoWorkflow":
            const workflowId = `executeTodoWorkflow-${new Date().getTime()}`;
            const workflowResult = await childExecute({
              child: executeTodoWorkflow,
              childId: workflowId,
              input: JSON.parse(toolCall.function.arguments),
            });

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(workflowResult),
            });

            const toolWorkflowResult = await step<typeof functions>({}).llmChat(
              {
                messages,
                tools,
              }
            );

            messages.push({
              role: "assistant",
              content: toolWorkflowResult.content,
            });

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
