import { FunctionFailure, functionInfo } from "@restackio/ai/function";

export async function streamToWebsocket(apiAddress: string, data: any): Promise<string> {
  // Get workflow info from the current context
  const functionInfo = functionInfo();
  const infoObj = {
    activityId: functionInfo.activityId,
    workflowId: functionInfo.workflowExecution.workflowId,
    runId: functionInfo.workflowExecution.runId,
    activityType: functionInfo.activityType,
    taskQueue: functionInfo.taskQueue,
  };

  // Determine the protocol based on the provided API address
  const protocol = apiAddress?.startsWith("localhost") ? "ws" : "wss";
  const websocketUrl = `${protocol}://${apiAddress}/stream/ws/agent?agentId=${functionInfo.workflowExecution.workflowId}&runId=${functionInfo.workflowExecution.runId}`;

  let ws: WebSocket | null = null;
  let collectedMessages = "";

  log.debug("Stream to websocket", { websocketUrl });

  try {
    // Open the WebSocket connection
    ws = new WebSocket(websocketUrl);
    await new Promise<void>((resolve, reject) => {
      ws!.onopen = () => resolve();
      ws!.onerror = (err) => reject(err);
    });

    heartbeat(infoObj);

    // For asynchronous iteration
    for await (const chunk of data) {
      log.debug("Stream chunk", { chunk });
      const rawChunkJson = JSON.stringify(chunk);
      heartbeat(rawChunkJson);
      ws.send(rawChunkJson);
      // Attempt to extract content from the chunk if using OpenAI-like stream responses
      if (
        chunk &&
        Array.isArray(chunk.choices) &&
        chunk.choices.length > 0 &&
        chunk.choices[0].delta &&
        typeof chunk.choices[0].delta.content === "string"
      ) {
        collectedMessages += chunk.choices[0].delta.content;
      }
    }

    return collectedMessages;
  } catch (error: any) {
    const errorMessage = `Error with restack stream to websocket: ${error?.message || error}`;
    customLog.error(errorMessage, { error });
    throw new FunctionFailure(errorMessage);
  } finally {
    // Ensure the WebSocket connection is closed properly
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send("[DONE]");
        ws.close();
      } catch (closeError) {
        customLog.error("Error while closing websocket", { error: closeError });
      }
    }
  }
}
