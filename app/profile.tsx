import { useUser } from '@clerk/expo';
import { useAuth } from '@clerk/expo';
import { Link, router } from 'expo-router';
import { Image } from 'expo-image';
import {
    Text,
    View,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
    const { user } = useUser();
    const { signOut } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => signOut(),
            },
        ]);
    };

    const handleChangeImage = async () => {
        const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                'Permission Required',
                'Please allow access to your photo library to change your profile image.',
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled || !result.assets[0]) {
            return;
        }

        setIsLoading(true);
        try {
            const asset = result.assets[0];

            await user?.setProfileImage({
                file: {
                    uri: asset.uri,
                    name: 'profile.jpg',
                    type: asset.mimeType || 'image/jpeg',
                } as any,
            });
        } catch (error) {
            Alert.alert(
                'Error',
                (error as Error).message || 'An unexpected error occurred.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    style={styles.closeButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
                <Text style={styles.title}>Profile</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                <Pressable
                    style={styles.avatarContainer}
                    onPress={handleChangeImage}
                    disabled={isLoading}
                >
                    {user.imageUrl ? (
                        <Image
                            source={{ uri: user.imageUrl }}
                            style={styles.avatar}
                            contentFit='cover'
                        />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitial}>
                                {user.firstName?.[0] || '?'}
                            </Text>
                        </View>
                    )}
                    {isLoading && (
                        <View style={styles.avatarLoadingOverlay}>
                            <ActivityIndicator color='#fff' />
                        </View>
                    )}
                    <View style={styles.editBadge}>
                        <Text style={styles.editBadgeText}>Edit</Text>
                    </View>
                </Pressable>

                <Text style={styles.name}>
                    {user.fullName || user.username || 'User'}
                </Text>
                <Text style={styles.email}>
                    {user.primaryEmailAddress?.emailAddress}
                </Text>

                <Pressable
                    style={({ pressed }) => [
                        styles.signOutButton,
                        pressed && styles.signOutButtonPressed,
                    ]}
                    onPress={handleSignOut}
                >
                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 17,
        color: '#007AFF',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
    },
    placeholder: {
        width: 60,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        backgroundColor: '#E5E5EA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 40,
        color: '#8E8E93',
    },
    avatarLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#007AFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    editBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    name: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 4,
    },
    email: {
        fontSize: 15,
        color: '#8E8E93',
        marginBottom: 32,
    },
    signOutButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 10,
    },
    signOutButtonPressed: {
        opacity: 0.8,
    },
    signOutButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
});
