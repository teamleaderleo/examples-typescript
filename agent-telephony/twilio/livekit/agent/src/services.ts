import { llmChat } from "./functions";
import { client } from "./client";
import { livekitRoom, livekitDispatch, livekitCall, livekitOutboundTrunk } from "./functions";

async function services() {
  const agentsPath = require.resolve("./agents");
  try {
    await Promise.all([
      client.startService({
        agentsPath: agentsPath,
        functions: {
          llmChat,
          livekitRoom,
          livekitDispatch,
          livekitCall,
          livekitOutboundTrunk
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
