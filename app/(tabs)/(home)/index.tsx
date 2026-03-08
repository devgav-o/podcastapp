import { ActivityIndicator, Button, ScrollView, View } from 'react-native';
import { Text } from 'react-native';
import { fetchTrending } from '@/services/podcast-index';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';

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
        <ScrollView contentInsetAdjustmentBehavior='automatic'>
            <Text className='text-amber-200 text-2xl'>
                Welcome to the Podcast App!
            </Text>
            <FlashList
                data={data?.feeds}
                renderItem={({ item }) => (
                    <View>
                        <Text>{item.title}</Text>
                    </View>
                )}
            />
        </ScrollView>
    );
}
