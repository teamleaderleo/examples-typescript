import {
  defineEvent,
  onEvent,
  condition,
  log,
  step,
  childExecute,
  uuid,
  AgentError,
  agentInfo,
  sleep
} from "@restackio/ai/agent";
import { Workflow } from "@temporalio/workflow";
import * as functions from "../functions";

export type EndEvent = {
  end: boolean;
};

export const endEvent = defineEvent("end");

export type FlowEvent = {
  name: string;
  input: any;
};

export const flowEvent = defineEvent<FlowEvent>("flowEvent");

export type AgentFlowInput = {
  flowJson: any;
}

export type AgentFlowOutput = {
  results: {
    id: string;
    status: "running" | "completed" | 'error'
    input: any;
    rawResponse: any;
    response: any;
  }[];
}
export async function agentFlow({flowJson}: AgentFlowInput): Promise<AgentFlowOutput> {
  let endReceived = false;
  let eventResults: AgentFlowOutput['results'] = []

  try {

    if (!flowJson) {

      // Mock React Flow JSON to debug with frontend

      flowJson = await step<typeof functions>({}).mockFlow();
    }

    const {flowMap} = await step<typeof functions>({}).dslInterpreter({
      reactflowJson: flowJson,
    });

    onEvent(flowEvent, async ({ name, input }: FlowEvent) => {
      log.info(`Received event: ${name}`);
      log.info(`Received event data: ${input}`);
      const flow = flowMap.find((flow) => flow.eventName === name);

      if (!flow) {
        throw new AgentError(`No workflow found for event: ${name}`);
      }

      const childOutput = await childExecute({
        child: flow.workflowType as unknown as Workflow,
        childId: uuid(),
        input: {
          eventData: input,
          flow: {
            prompt: flow.flowPrompt,
            outputConditions: flow.flowOutputConditions,
          },
        },
        taskQueue: "workflow",
      });

      eventResults.push({
        id: name,
        status: "completed",
        input: input,
        rawResponse: childOutput.rawResponse,
        response: childOutput.response,
      });

      // Evaluate the output against edge conditions
      const nextEvent = flow.edgeConditions.find((condition) => {
        // Access the correct property within childOutput
        const outputCondition = childOutput.response.response;
        return outputCondition === condition.condition;
      });

      if (nextEvent) {

        await sleep(1000);
        step<typeof functions>({}).sendAgentEvent({
          eventName: 'flowEvent',
          eventInput: {
            name: nextEvent.targetNodeId,
            input: childOutput.response,
          },
          agentId: agentInfo().workflowId,
          runId: agentInfo().runId,
        });
      }
      return {
        ...childOutput,
        nextEvent: nextEvent?.targetNodeId,
      }

    });

    onEvent(endEvent, async () => {
      await sleep(2000);
      endReceived = true;
    });

    // We use the `condition` function to wait for the event goodbyeReceived to return `True`.
    await condition(() => endReceived);

    log.info("end condition met");
    return {
      results: eventResults,
    };

  } catch (error) {
    throw new AgentError("Error in agentFlow", error as string);
  }
}

