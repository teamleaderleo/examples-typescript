import {step, workflowInfo } from "@restackio/ai/workflow";
import * as functions from "../functions";


export type EndFlowInput = {
  eventData: {
    response: "success" | "failure";
  }
};

export type EndFlowOutput = {
  response: "success" | "failure";
  rawResponse: {};
};

export async function endFlow(input: EndFlowInput): Promise<EndFlowOutput> {

  await step<typeof functions>({}).sendAgentEvent({
    eventName: 'end',
    eventInput: {},
    agentId: workflowInfo().parent?.workflowId!,
    runId: workflowInfo().parent?.runId!,
  });

  if (input.eventData.response === "success") {
    return {
      response: "success",
      rawResponse: {},
    };
  } else {
    return {
      response: "failure",
      rawResponse: {},
    };
  }

}