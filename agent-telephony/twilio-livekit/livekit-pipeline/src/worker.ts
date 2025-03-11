import { cli, pipeline, WorkerOptions } from '@livekit/agents';

import {
  type JobContext,
  type JobProcess,
  defineAgent,
  llm
} from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';

import { parseMetadata, extractAgentInfo } from './utils.js';
import { getRestackAgentUrl } from './restack/utils.js';
// import { livekitPipeline } from './pipeline';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });


export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    const metadata = parseMetadata(ctx.job.metadata);
    console.log('metadata', metadata);
    const { agentName, agentId, runId } = extractAgentInfo(metadata);
    const agentUrl = getRestackAgentUrl(agentName, agentId, runId);
    console.log('agentUrl', agentUrl);
    if (!agentId || !agentUrl) {
      throw new Error('Missing agent info computed from metadata');
    }

    
    await ctx.connect();
    console.log('connected');
    const participant = await ctx.waitForParticipant(agentId);
    console.log('participant', participant);
    
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

    livekitPipeline.start(ctx.room, participant);

    console.log("Pipeline started", ctx.job.metadata)

    const welcomeMessage =  "Welcome to restack, how can I help you today?"


    await livekitPipeline.say(welcomeMessage, true)
  }
});

cli.runApp(new WorkerOptions({
  agentName: 'livekit_pipeline',
  agent: fileURLToPath(import.meta.url),
})); 