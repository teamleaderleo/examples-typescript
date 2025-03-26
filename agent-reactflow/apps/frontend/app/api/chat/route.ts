import { createOpenAI, openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, agentId, runId } = await req.json();
  try {

  // TODO: use restack agent chat
  // const openaiClient = createOpenAI({
  //   apiKey: 'next-flow-frontend',
  //   baseURL: `http://localhost:9233/stream/agents/agentChat/${agentId}/${runId}`,
  // })

  // const zodObject = z.object({
  //   nodes: z.array(z.object({
  //     id: z.string(),
  //     type: z.string(),
  //     position: z.object({
  //       x: z.number(),
  //       y: z.number(),
  //     }),
  //     data: z.object({
  //       label: z.string(),
  //       description: z.string(),
  //       // icon: z.any(),
  //       handles: z.array(z.object({
  //         id: z.string(),
  //         type: z.string(),
  //         position: z.string(),
  //       })),
  //       status: z.string(),
  //     }),
  //   })),
  //   edges: z.array(z.object({
  //     id: z.string(),
  //     source: z.string(),
  //     target: z.string(),
  //     sourceHandle: z.string(),
  //   })),
  // });

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      updateFlow: tool({
        description: 'Update flow',
        parameters: z.object({
          flow: z.any()
        }),
        execute: async ({ flow }) => {
          console.log("updated flow", flow);
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