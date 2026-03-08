import EpisodeCard from '@/components/EpisodeCard';
import { fetchEpisodesByFeedId, fetchFeedById } from '@/services/podcast-index';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    ActivityIndicator,
    Pressable,
    Linking,
    FlatList,
} from 'react-native';

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
}

function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function PodcastDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [expanded, setExpanded] = useState(false);
    const { data, error, isLoading } = useQuery({
        queryKey: ['feed', id],
        queryFn: () => fetchFeedById(id),
    });
    const podcast = data?.feed;

    const {
        data: episodesData,
        error: episodesError,
        isLoading: episodesLoading,
    } = useQuery({
        queryKey: ['episodes', id],
        queryFn: () => fetchEpisodesByFeedId(id),
    });
    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <ActivityIndicator size='large' />
            </View>
        );
    }
    if (error || !podcast) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text style={{ fontSize: 16, color: '#666' }}>
                    Error loading feed details
                </Text>
            </View>
        );
    }

    const imageUri = podcast.artwork || podcast.image;
    const categories = Object.values(podcast.categories || {});

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#fff' }}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <View
                style={{
                    width: '100%',
                    aspectRatio: 1,
                    backgroundColor: '#f5f5f5',
                }}
            >
                <Image
                    source={{ uri: imageUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode='cover'
                />
            </View>

            <View style={{ padding: 20, gap: 16 }}>
                <View style={{ gap: 8 }}>
                    <Text
                        style={{
                            fontSize: 22,
                            fontWeight: '700',
                            color: '#000',
                            lineHeight: 28,
                        }}
                    >
                        {podcast.title}
                    </Text>
                    <Text
                        style={{
                            fontSize: 16,
                            color: '#666',
                        }}
                    >
                        {podcast.author}
                    </Text>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    {podcast.explicit && (
                        <View
                            style={{
                                backgroundColor: '#000',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 4,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: '#fff',
                                    fontWeight: '600',
                                }}
                            >
                                Explicit
                            </Text>
                        </View>
                    )}
                    {podcast.episodeCount > 0 && (
                        <Text style={{ fontSize: 14, color: '#888' }}>
                            {formatNumber(podcast.episodeCount)} episodes
                        </Text>
                    )}
                    {podcast.itunesId && (
                        <Text style={{ fontSize: 14, color: '#888' }}>
                            iTunes ID: {podcast.itunesId}
                        </Text>
                    )}
                </View>

                {categories.length > 0 && (
                    <View
                        style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 8,
                        }}
                    >
                        {categories.slice(0, 4).map((category, index) => (
                            <View
                                key={index}
                                style={{
                                    backgroundColor: '#f0f0f0',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: '#333',
                                        fontWeight: '500',
                                    }}
                                >
                                    {category}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                <View
                    style={{
                        height: 1,
                        backgroundColor: '#e5e5e5',
                        marginVertical: 4,
                    }}
                />

                <View style={{ gap: 12 }}>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: '#000',
                        }}
                    >
                        About
                    </Text>
                    <View>
                        <Text
                            style={{
                                fontSize: 15,
                                color: '#444',
                                lineHeight: 22,
                            }}
                            numberOfLines={expanded ? undefined : 2}
                        >
                            {podcast.description}
                        </Text>
                        {podcast.description &&
                            podcast.description.length > 200 && (
                                <Pressable
                                    onPress={() => setExpanded(!expanded)}
                                >
                                    <Text
                                        style={{
                                            fontSize: 15,
                                            color: '#007AFF',
                                            fontWeight: '600',
                                            marginTop: 4,
                                        }}
                                    >
                                        {expanded ? 'Show less' : 'Read more'}
                                    </Text>
                                </Pressable>
                            )}
                    </View>
                </View>

                <View style={{ gap: 12, marginTop: 8 }}>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: '#000',
                        }}
                    >
                        Episodes
                    </Text>
                </View>
                <View style={{ gap: 12 }}>
                    {episodesLoading && <ActivityIndicator />}
                    {episodesError && (
                        <Text>
                            Error loading episodes {episodesError.message}
                        </Text>
                    )}
                    {episodesData?.items.map((episode) => (
                        <EpisodeCard key={episode.id} episode={episode} />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
