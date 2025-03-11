import {
  pipeline
} from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
import { llm } from '@livekit/agents';
import {
  type JobContext,
} from '@livekit/agents';
export function livekitPipeline(ctx: JobContext, agentId: string, agentUrl: string): any {
  try {

    const vad = ctx.proc.userData.vad as silero.VAD;
    console.log('agentId', agentId);
    console.log('agentUrl', agentUrl);
    const livekitPipeline = new pipeline.VoicePipelineAgent(
      vad,
      new deepgram.STT(),
      new openai.LLM({
        apiKey: `${agentId}-livekit`,
        baseURL: agentUrl
      }),
      new elevenlabs.TTS(),
      {
        beforeLLMCallback: async (agent, chatCtx) => {
          return agent.llm.chat({
            chatCtx: Object.assign(new llm.ChatContext(), {
              ...chatCtx,
              messages: chatCtx.messages.filter(m => m.content || m.toolCalls || m.toolCallId || m.toolException)
            }),
            fncCtx: agent.fncCtx
          });
        }
      }
    );
    console.log('livekitPipeline', livekitPipeline);
    return livekitPipeline;
  } catch (error) {
    console.error('Error creating pipeline agent:', error);
    throw error;
  }
}
