import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
    throw new Error('Add your Clerk Publishable Key to the .env file');
}

function RootStack() {
    const { isSignedIn, isLoaded } = useAuth();

    if (!isLoaded) {
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

    return (
        <Stack>
            <Stack.Protected guard={isSignedIn}>
                <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
                <Stack.Screen
                    name='profile'
                    options={{
                        presentation: 'modal',
                        headerShown: false,
                    }}
                />
            </Stack.Protected>
            <Stack.Protected guard={!isSignedIn}>
                <Stack.Screen name='(auth)' options={{ headerShown: false }} />
            </Stack.Protected>
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <RootStack />
        </ClerkProvider>
    );
}
