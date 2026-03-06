import { Link } from 'expo-router';
import { View, Text } from 'react-native';

export default function Home() {
    return (
        <View style={{ backgroundColor: 'green', flex: 1 }}>
            <Text>Home</Text>
            <Link href='/about'>Go to About</Link>
        </View>
    );
}
