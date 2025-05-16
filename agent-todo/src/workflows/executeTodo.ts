import { log, sleep, step } from "@restackio/ai/workflow";
import * as functions from "../functions";
import { ExecuteTodoSchema, ExecuteTodoOutput, ExecuteTodoOutputSchema } from "../functions/toolTypes";

export type Input = ExecuteTodoOutput;
export type Output = ExecuteTodoOutput;

export async function executeTodoWorkflow({ todoTitle, todoId }: Input): Promise<Output> {
  try {
    log.info("Starting todo workflow", { todoTitle, todoId });
    
    const random = await step<typeof functions>({taskQueue: "todo-workflows"}).getRandom({
      todoTitle,
    });

    log.info("Got random value", { random });
    
    await sleep(2000);

    const result = await step<typeof functions>({taskQueue: "todo-workflows"}).getResult({
      todoTitle,
      todoId,
    });
    
    log.info("Got result", { result });

    const todoDetails: Output = {
      todoId,
      todoTitle,
      details: random,
      status: result.status,
    };

    log.info("Todo Details", { todoDetails });

    return todoDetails;
  } catch (error: any) {
    log.error("Error in executeTodoWorkflow", { 
      error: error.toString(),
      todoTitle,
      todoId
    });
    
    // Return an error status in case of failure
    return {
      todoId,
      todoTitle,
      details: `Error: ${error.message}`,
      status: "failed"
    };
  }
}