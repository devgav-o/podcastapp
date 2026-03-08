import { Stack } from 'expo-router/stack';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { useUser } from '@clerk/expo';

function HeaderRight() {
    const { user } = useUser();

    return (
        <Link href='/profile' asChild>
            <Pressable>
                {user?.imageUrl ? (
                    <Image
                        source={{ uri: user.imageUrl }}
                        style={{ width: 28, height: 28, borderRadius: 14 }}
                    />
                ) : (
                    <View
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: '#E5E5EA',
                        }}
                    />
                )}
            </Pressable>
        </Link>
    );
}

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                headerTransparent: true,
                headerShadowVisible: false,
                headerLargeTitleShadowVisible: false,
                headerLargeStyle: { backgroundColor: 'transparent' },
                headerLargeTitle: true,
                headerBlurEffect: 'none',
                headerBackButtonDisplayMode: 'minimal',
            }}
        >
            <Stack.Screen
                name='index'
                options={{
                    title: 'Trending',
                    headerRight: HeaderRight,
                }}
            />
            <Stack.Screen
                name='[id]'
                options={{
                    headerShown: false,
                    presentation: 'modal',
                }}
            />
        </Stack>
    );
}
