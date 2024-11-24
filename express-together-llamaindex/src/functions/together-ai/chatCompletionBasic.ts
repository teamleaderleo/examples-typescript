import Together from 'together-ai';
import { togetherClient } from './utils/client';

export async function togetherChatCompletionBasic(params: Together.Chat.CompletionCreateParamsNonStreaming) {
    const response = await togetherClient.chat.completions.create(params);
    return response as Together.Chat.ChatCompletion;
}
