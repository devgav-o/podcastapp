import { fetchFeedById } from '@/services/podcast-index';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function PodcastDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data, error, isLoading } = useQuery({
        queryKey: ['feed', id],
        queryFn: () => fetchFeedById(id),
    });
    const podcast = data?.feed;
    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text>Loading...</Text>
            </View>
        );
    }
    if (error) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text>Error loading feed details</Text>
            </View>
        );
    }
    return (
        <View>
            <Text>{id}</Text>
            {data && <Text>{podcast?.title}</Text>}
        </View>
    );
}
