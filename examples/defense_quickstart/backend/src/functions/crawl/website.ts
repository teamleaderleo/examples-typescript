import { FunctionFailure, log } from "@restackio/ai/function";
import axios from "axios";

export const crawlWebsite = async ({
    url
}: { url: string }): Promise<{ result: string }> => {
    try {
        const response = await axios.get(url);
        return { result: response.data };
    } catch (error) {
        throw FunctionFailure.nonRetryable(`Error crawl website: ${error}`);
    }
};