import {
  defineEvent,
  onEvent,
  condition,
  log,
  step,
  agentInfo
} from "@restackio/ai/agent";
import * as functions from "../functions";

export type EndEvent = {
  end: boolean;
};

export type CallEvent = {
  phoneNumber: string;
};

export const messagesEvent = defineEvent<functions.Message[]>("messages");
export const endEvent = defineEvent("end");
export const callEvent = defineEvent<string>("call");

type agentTwilioOutput = {
  messages: functions.Message[];
};

export async function agentTwilio(): Promise<agentTwilioOutput> {
  let endReceived = false;
  let messages: functions.Message[] = [{
    role: "system",
    content: "You are a sales assistant making outbound calls to potential customers. Your answers are used in a text to speech, be concise and natural."
  }];
  let roomId: string;
  

  onEvent(messagesEvent, async ({ messages, stream = true }: { messages: functions.Message[], stream?: boolean }) => {
    const result = await step<typeof functions>({}).llmChat({
      messages,
    });
    messages.push(result);
    return messages;
  });

  onEvent(callEvent, async ({ phoneNumber }: CallEvent) => {
    const agentName = agentInfo().workflowType
    const agentId = agentInfo().workflowId
    const runId = agentInfo().runId

    const trunk = await step<typeof functions>({}).livekitOutboundTrunk();

    const sipTrunkId = trunk.sipTrunkId

    const call = await step<typeof functions>({}).livekitCall({sipTrunkId, phoneNumber, roomId, agentName, agentId, runId});

    return call.sipCallId
  });

  onEvent(endEvent, async () => {
    endReceived = true;
  });

  const room = await step<typeof functions>({}).livekitRoom();

  roomId = room.sid;

  await step<typeof functions>({}).livekitDispatch({roomId});
  // We use the `condition` function to wait for the event goodbyeReceived to return `True`.
  await condition(() => endReceived);

  log.info("end condition met");
  return { messages };
}
