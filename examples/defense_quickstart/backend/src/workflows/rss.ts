import { step } from "@restackio/ai/workflow";
import * as functions from "../functions";


export async function rssWorkflow({ url = "https://www.pravda.com.ua/rss/", count = 2 }: { url: string, count: number }) {

    // Step 1: Fetch RSS feed

    const rssResponse: functions.RssItem[] = await step<typeof functions>({
    }).rssPull({
        url,
        count,
    });


    // Step 2: Crawl website content
    let websiteContent: { result: string }[] = [];
    await Promise.all(rssResponse.map(async (item) => {
        const response: { result: string } = await step<typeof functions>({
        }).crawlWebsite({
            url: item.link,
        });

        websiteContent.push(response);
    }));

    console.log(websiteContent);

    // Step 3: Split content into chunks because LLM has a token limit of 4096

    // Step 4: LLM translation
    let translatedContent: { result: string }[] = [];
    await Promise.all(websiteContent.map(async (item) => {
        const response: { result: string } = await step<typeof functions>({
            taskQueue: 'llm',
        }).llmChat({
            userContent: item.result,
        });

        translatedContent.push(response);
    }));

    console.log(translatedContent);

    // Step 5: LLM summarization
    let summarizedContent: { result: string }[] = [];
    await Promise.all(translatedContent.map(async (item) => {
        const response: { result: string } = await step<typeof functions>({
            taskQueue: 'llm',
        }).llmChat({
            userContent: item.result,
        });

        summarizedContent.push(response);
    }));

    // Step 6: LLM Create a digest
    return await step<typeof functions>({
        taskQueue: 'llm',
    }).llmChat({
        userContent: `Summarize the following content as a daily digest, prioritize the most important information: ${summarizedContent.map((item) => item.result).join("\n")}`,
    });
}
