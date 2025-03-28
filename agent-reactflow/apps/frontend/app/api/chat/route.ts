import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, agentId, runId } = await req.json();
  try {

  const openaiClient = createOpenAI({
    apiKey: 'next-flow-frontend',
    baseURL: `http://localhost:9233/stream/agents/agentChat/${agentId}/${runId}`,
  })

  const result = streamText({
    model: openaiClient('gpt-4o'),
    messages,
    tools: {
      updateFlow: tool({
        description: 'Update flow',
        parameters: z.object({
          flow: z.any()
        }),
        execute: async ({ flow }) => {
          return {
            flow,
          };
        },
      }),
    },
    toolCallStreaming: true,
  });

  return result.toDataStreamResponse();

  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
}