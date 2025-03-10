import { AccessToken } from 'livekit-server-sdk';

import "dotenv/config";
import { FunctionFailure } from '@restackio/ai/function';

export const livekitToken = (): AccessToken => {

  try {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("API key is required to create livekit client.");
  }

  const token = new AccessToken(apiKey, apiSecret);

  return token;

  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error creating livekit token: ${error}`);
  }
};
