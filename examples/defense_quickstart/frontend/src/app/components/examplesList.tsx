export type Example = {
  name: string;
  description: string;
  integrations: string[];
  workflowName: string;
  input: Record<string, unknown>;
};

export const examples = [
  {
    name: "Chat Completion Example",
    description: "Example workflow to generate greeting and farewell messages",
    integrations: ["together"],
    workflowName: "chatCompletionBasic",
    input: { name: "test" },
  },
  {
    name: "LlamaIndex Together Example",
    description: "Example workflow to query a model with the LlamaIndex and Together integration",
    integrations: ["together"],
    workflowName: "llamaindexTogetherSimple",
    input: { query: "What is the meaning of life?" },
  },
];
