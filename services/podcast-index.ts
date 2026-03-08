import * as Crypto from 'expo-crypto';
import type { Episode, Feed } from '../types';
export type { Episode, Feed };

var apiKey = process.env.EXPO_PUBLIC_PODCAST_INDEX_API_KEY;
var apiSecret = process.env.EXPO_PUBLIC_PODCAST_INDEX_API_SECRET;

if (!apiKey || !apiSecret) {
    throw new Error(
        'EXPO_PUBLIC_PODCAST_INDEX_API_KEY or EXPO_PUBLIC_PODCAST_INDEX_API_SECRET is not defined',
    );
}

const fetchIndex = async (path: string, options: RequestInit = {}) => {
    const time = Math.floor(Date.now() / 1000);
    const dataToHash = apiKey + apiSecret + time;

    const authHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA1,
        dataToHash,
    );

    const optionsWithAuth = {
        ...options,
        method: options.method || 'get',
        headers: {
            'User-Agent': 'notJustPodcast/1.0',
            'X-Auth-Date': '' + time,
            'X-Auth-Key': apiKey,
            Authorization: authHash,
            ...options.headers,
        },
    };

    const url = `https://api.podcastindex.org/api/1.0${path}`;

    const res = await fetch(url, optionsWithAuth);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error ${res.status}: ${text}`);
    }
    return res;
};

export async function fetchTrending(): Promise<{ feeds: Feed[] }> {
    const res = await fetchIndex(`/podcasts/trending`);
    return res.json();
}
export async function fetchFeedById(id: string): Promise<{ feed: Feed }> {
    const res = await fetchIndex(`/podcasts/byfeedid?id=${id}`);
    return res.json();
}
// Fetch episodes by feed id
export async function fetchEpisodesByFeedId(
    id: string,
): Promise<{ status: boolean; items: Episode[] }> {
    const res = await fetchIndex(`/episodes/byfeedid?id=${id}&max=10`);
    return res.json();
}
