import { client } from "./src/client";

export type EventInput = {
  workflowId: string;
  runId: string;
};

async function eventWorkflow(input: EventInput) {
  try {
    await client.sendWorkflowEvent({
      event: {
        name: "message",
        input: { content: "Telle ma another one" },
      },
      workflow: {
        workflowId: input.workflowId,
        runId: input.runId,
      },
    });

    await client.sendWorkflowEvent({
      event: {
        name: "end",
      },
      workflow: {
        workflowId: input.workflowId,
        runId: input.runId,
      },
    });

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error sending event to workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

eventWorkflow({
  workflowId: "your-workflow-id",
  runId: "your-run-id",
});
