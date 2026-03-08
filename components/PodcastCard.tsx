import { View, Text, Image, Pressable } from 'react-native';
import React from 'react';
import { Feed } from '@/types';
import { router } from 'expo-router';

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
}

export default function PodcastCard({ podcast }: { podcast: Feed }) {
    const imageUri = podcast.artwork || podcast.image;
    const category = Object.values(podcast.categories || {})[0];

    return (
        <Pressable
            onPress={() => router.navigate(`(home)/${podcast.id}`)}
            style={{
                borderCurve: 'continuous',
                overflow: 'hidden',
            }}
        >
            <View style={{ gap: 10 }}>
                <View>
                    <Image
                        source={{ uri: imageUri }}
                        style={{
                            width: '100%',
                            aspectRatio: 1,
                            borderRadius: 12,
                            backgroundColor: '#f0f0f0',
                        }}
                    />
                    {category && (
                        <View
                            style={{
                                position: 'absolute',
                                bottom: 8,
                                left: 8,
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 6,
                            }}
                        >
                            <Text
                                numberOfLines={1}
                                style={{
                                    fontSize: 11,
                                    color: '#fff',
                                    fontWeight: '500',
                                }}
                            >
                                {category}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={{ gap: 6 }}>
                    <Text
                        numberOfLines={2}
                        style={{
                            fontSize: 15,
                            fontWeight: '600',
                            color: '#000',
                            lineHeight: 20,
                        }}
                    >
                        {podcast.title}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={{
                            fontSize: 13,
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
                        gap: 10,
                        marginTop: 2,
                    }}
                >
                    {podcast.explicit ? (
                        <View
                            style={{
                                backgroundColor: '#000',
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: '#fff',
                                    fontWeight: '600',
                                }}
                            >
                                E
                            </Text>
                        </View>
                    ) : null}
                    {podcast.episodeCount > 0 && (
                        <Text style={{ fontSize: 12, color: '#888' }}>
                            {formatNumber(podcast.episodeCount)} episodes
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
}
