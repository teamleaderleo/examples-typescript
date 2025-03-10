import { fetchDocsContent, llmTalk, llmLogic, livekitCreateRoom, livekitDeleteRoom, livekitSendData, livekitToken, livekitDispatch, livekitCall, livekitOutboundTrunk, livekitRecording } from "./functions";
import { client } from "./client";

async function services() {
  const agentsPath = require.resolve("./agents");
  try {
    await Promise.all([
      client.startService({
        agentsPath: agentsPath,
        functions: {
          fetchDocsContent,
          livekitCall,
          livekitCreateRoom,
          livekitDeleteRoom,
          livekitDispatch,
          livekitOutboundTrunk,
          livekitRecording,
          livekitSendData,
          livekitToken,
          llmTalk,
          llmLogic,
        },
      }),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run services", e);
  }
}

services().catch((err) => {
  console.error("Error running services:", err);
});
