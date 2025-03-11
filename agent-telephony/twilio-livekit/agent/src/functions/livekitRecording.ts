import { EncodedFileType, GCPUpload, EgressInfo, EncodedFileOutput } from 'livekit-server-sdk';
import { livekitEgressClient } from '../utils/livekitEgressClient';
import { FunctionFailure, log } from "@restackio/ai/function";

export const livekitRecording = async ({roomName}: {roomName: string}): Promise<{recordingUrl: string, egressInfo: EgressInfo}> => {
  try {
    
    const client = livekitEgressClient({});

    const fileOutput = {
      fileType: EncodedFileType.MP4,
      filepath: `${roomName}-audio.mp4`,
      output: {
        case: "gcp" as const,
        value: new GCPUpload({
          credentials: process.env.GCP_CREDENTIALS!,
          bucket: 'livekit-local-recordings'
        })
      }
    } as unknown as EncodedFileOutput;

    const egressInfo = await client.startRoomCompositeEgress(roomName, { file: fileOutput }, {
      layout: 'grid',
      audioOnly: true,
    });

    log.info('livekitRecording started', egressInfo);

    const composite = egressInfo as any;
    const recordingUrl = `https://storage.googleapis.com/${composite.roomComposite.fileOutputs[0].gcp.bucket}/${composite.roomComposite.fileOutputs[0].filepath}`;

    return {
      recordingUrl,
      egressInfo
    }
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error livekitRecording: ${error}`);
  }
}