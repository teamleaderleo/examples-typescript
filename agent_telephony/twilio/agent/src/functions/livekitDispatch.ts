import { livekitDispatchClient } from '../utils/livekitDispatchClient';
import { AgentDispatch } from '@livekit/protocol';
import { FunctionFailure, log, functionInfo } from "@restackio/ai/function";

export const livekitDispatch = async ({roomId}: {roomId: string}): Promise<AgentDispatch> => {
  try {
    

   const roomName = roomId;
   const agentName = functionInfo().workflowType
   const agentId = functionInfo().workflowExecution.workflowId
   const runId = functionInfo().workflowExecution.runId

    const client = livekitDispatchClient({});

    const dispatch = await client.createDispatch(roomName, agentName, {
      metadata: JSON.stringify({
        agentName,
        agentId,
        runId
      })
    });
    log.info('dispatch created', dispatch);
    return dispatch
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error livekitDispatch: ${error}`);
  }
}