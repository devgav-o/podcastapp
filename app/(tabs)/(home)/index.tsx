import { ActivityIndicator, Button, FlatList, View } from 'react-native';
import { Text } from 'react-native';
import { fetchTrending } from '@/services/podcast-index';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import PodcastCard from '@/components/PodcastCard';

export default function HomeScreen() {
    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ['trending'],
        queryFn: async () => {
            const data = await fetchTrending();
            return data;
        },
    });

    if (isLoading) {
        return <ActivityIndicator />;
    }
    if (error) {
        return (
            <View>
                <Text>Error fetching trending podcasts</Text>
                <Button title='Retry' onPress={() => refetch()} />
            </View>
        );
    }
    return (
        <FlatList
            contentContainerClassName='gap-4 p-4'
            columnWrapperClassName=''
            data={data?.feeds}
            renderItem={({ item }) => (
                <View style={{ flex: 1 }}>
                    <PodcastCard podcast={item} />
                </View>
            )}
            contentInsetAdjustmentBehavior='automatic'
            numColumns={2}
            columnWrapperStyle={{ gap: 16 }}
        />
    );
}
