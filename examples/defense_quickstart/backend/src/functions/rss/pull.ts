import { FunctionFailure, log } from "@restackio/ai/function";
import axios from "axios";
import { parseString } from "xml2js";
import { promisify } from "util";

interface RssInput {
    url: string;
    count?: number;
}

export interface RssItem {
    title: string;
    link: string;
    description: string;
    category?: string;
    creator?: string;
    pub_date?: string;
    content_encoded?: string;
}

export async function rssPull(input: RssInput): Promise<RssItem[]> {
    try {
        // Fetch the RSS feed
        const response = await axios.get(input.url);

        // Parse the RSS feed
        const parseXml = promisify(parseString);
        const result: any = await parseXml(response.data);

        const items: RssItem[] = result.rss.channel[0].item.map((item: any) => ({
            title: item.title?.[0],
            link: item.link?.[0],
            description: item.description?.[0],
            category: item.category?.[0],
            creator: item["dc:creator"]?.[0],
            pub_date: item.pubDate?.[0],
            content_encoded: item["content:encoded"]?.[0]
        }));

        // Limit the number of items based on input.count
        const maxCount = input.count ?? items.length;
        const limitedItems = items.slice(0, maxCount);

        log.info("rssPull", { data: limitedItems });
        return limitedItems;

    } catch (error) {
        log.error("rssPull function failed", { error });
        throw error;
    }
}