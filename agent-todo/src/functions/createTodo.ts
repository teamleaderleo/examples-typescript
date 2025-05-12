import { log } from "@restackio/ai/function";
import { z } from "zod";

export const CreateTodoSchema = z.object({
  todoTitle: z.string().min(1),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type CreateTodoOutput = string;

export const createTodo = async ({ todoTitle }: CreateTodoInput): Promise<CreateTodoOutput> => {
  const todo_id = `todo-${Math.floor(Math.random() * 10000)}`;
  log.info("createTodo", { todo_id, todoTitle });
  return `Created the todo '${todoTitle}' with id: ${todo_id}`;
};
