import { ScrollView } from 'react-native';
import { Text } from 'react-native';

const ThemedText = Text;

export default function HomeScreen() {
    return (
        <ScrollView contentInsetAdjustmentBehavior='automatic'>
            <Text>Welcome to the Podcast App!</Text>
        </ScrollView>
    );
}
