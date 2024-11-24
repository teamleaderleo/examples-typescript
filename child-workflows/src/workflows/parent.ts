import { startChild, executeChild } from "@restackio/ai/workflow";
import { childWorkflow } from "./child";

interface Input {
  name: string;
}
export async function parentWorkflow({ name }: Input) {


  const startedChild = await startChild(childWorkflow, {
    workflowId: `startChild-workflow`,
    args: [{ name }],
  });

  const executedChild = await executeChild(childWorkflow, {
    workflowId: `executeChild-workflow`,
    args: [{ name }],
  });

  return {
    messages: { startedChild, executedChild },
  };
}
