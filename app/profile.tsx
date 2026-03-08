import { useUser } from '@clerk/expo';
import { useAuth } from '@clerk/expo';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import {
    Text,
    View,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { PlatformColor } from 'react-native';

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

            <ScrollView
                contentInsetAdjustmentBehavior='automatic'
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.profileHeader}>
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
                            <View
                                style={[
                                    styles.avatar,
                                    styles.avatarPlaceholder,
                                ]}
                            >
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
                            <Ionicons name='pencil' size={12} color='#fff' />
                        </View>
                    </Pressable>

                    <Text style={styles.name} selectable>
                        {user.fullName || user.username || 'User'}
                    </Text>
                    <Text style={styles.email} selectable>
                        {user.primaryEmailAddress?.emailAddress}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Account</Text>
                    <View style={styles.card}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Username</Text>
                            <Text style={styles.infoValue} selectable>
                                {user.fullName || 'Not set'}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue} selectable>
                                {user.primaryEmailAddress?.emailAddress}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Member since</Text>
                            <Text style={styles.infoValue} selectable>
                                {user.createdAt
                                    ? new Date(
                                          user.createdAt,
                                      ).toLocaleDateString('en-US', {
                                          month: 'long',
                                          year: 'numeric',
                                      })
                                    : 'Unknown'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Actions</Text>
                    <View style={styles.card}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.actionRow,
                                pressed && styles.actionRowPressed,
                            ]}
                            onPress={handleChangeImage}
                            disabled={isLoading}
                        >
                            <Text style={styles.actionText}>
                                Change Profile Photo
                            </Text>
                            <Text style={styles.chevron}>›</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.section}>
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

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Podcast App v1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PlatformColor('systemGroupedBackground'),
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
        color: PlatformColor('systemBlue'),
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
    },
    placeholder: {
        width: 60,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 24,
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
        backgroundColor: PlatformColor('systemGrey5'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 40,
        color: PlatformColor('systemGrey'),
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
        backgroundColor: '#020476',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 999,
    },
    editBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
        color: PlatformColor('label'),
    },
    email: {
        fontSize: 15,
        color: PlatformColor('secondaryLabel'),
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: PlatformColor('secondaryLabel'),
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 16,
    },
    card: {
        backgroundColor: PlatformColor('secondarySystemGroupedBackground'),
        borderRadius: 12,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    infoLabel: {
        fontSize: 16,
        color: PlatformColor('label'),
    },
    infoValue: {
        fontSize: 16,
        color: PlatformColor('secondaryLabel'),
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: PlatformColor('separator'),
        marginLeft: 16,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    actionRowPressed: {
        backgroundColor: PlatformColor('systemGrey5'),
    },
    actionText: {
        fontSize: 16,
        color: PlatformColor('systemBlue'),
    },
    chevron: {
        fontSize: 20,
        color: PlatformColor('tertiaryLabel'),
        fontWeight: '300',
    },
    signOutButton: {
        backgroundColor: '#ed2121',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    signOutButtonPressed: {
        opacity: 0.8,
    },
    signOutButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        paddingTop: 16,
    },
    footerText: {
        fontSize: 13,
        color: PlatformColor('tertiaryLabel'),
    },
});
