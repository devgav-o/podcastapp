import { Button, ScrollView } from 'react-native';
import { Text } from 'react-native';
import { fetchTrending } from '@/services/podcast-index';

export default function HomeScreen() {
    const onPress = async () => {
        console.log('Fetching Data');
        const data = await fetchTrending();
        console.log(JSON.stringify(data, null, 2));
    };

    return (
        <ScrollView contentInsetAdjustmentBehavior='automatic'>
            <Text>Welcome to the Podcast App!</Text>
            <Button title='Fetch Trending' onPress={onPress} />
        </ScrollView>
    );
}
