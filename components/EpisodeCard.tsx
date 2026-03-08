import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Episode } from '@/types';

function formatDuration(seconds: number | null): string {
    if (!seconds) return '0 min';
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
}

export default function EpisodeCard({ episode }: { episode: Episode }) {
    return (
        <Pressable
                style={{
                    flexDirection: 'row',
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    overflow: 'hidden',
                    gap: 16,
                }}
            >
                <View style={{ flex: 1, paddingVertical: 12, gap: 6 }}>
                    <Text
                        numberOfLines={1}
                        style={{
                            fontSize: 12,
                            color: '#888',
                        }}
                    >
                        {episode.datePublishedPretty}
                    </Text>
                    <Text
                        numberOfLines={2}
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#000',
                            lineHeight: 22,
                        }}
                    >
                        {episode.title}
                    </Text>
                    <Text
                        numberOfLines={2}
                        style={{
                            fontSize: 14,
                            color: '#666',
                            lineHeight: 20,
                        }}
                    >
                        {stripHtml(episode.description)}
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 4,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#f5f5f5',
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 16,
                                gap: 6,
                            }}
                        >
                            <Ionicons name='play' size={14} color='#000' />
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontWeight: '500',
                                    color: '#000',
                                }}
                            >
                                {formatDuration(episode.duration)}
                            </Text>
                        </View>
                    </View>
                </View>
                {episode.image && (
                    <Image
                        source={{ uri: episode.image }}
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: 8,
                            margin: 12,
                            marginLeft: 0,
                        }}
                    />
                )}
            </Pressable>
    );
}
