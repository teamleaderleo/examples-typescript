import Together from "together-ai";

export const togetherClient = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
});
