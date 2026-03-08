import { useAuth, useSignUp, useOAuth } from '@clerk/expo';
import { type Href, Link, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Pressable, Text, TextInput, View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';
import * as Linking from 'expo-linking';
import { Image } from 'expo-image';
import { colors } from '../../constants/colors';

export default function Page() {
    const { signUp, errors, fetchStatus } = useSignUp();
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
    useWarmUpBrowser();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [touchedFields, setTouchedFields] = useState({
        email: false,
        password: false,
        code: false,
    });

    const handleGoogleSignUp = useCallback(async () => {
        if (isGoogleLoading) return;
        setIsGoogleLoading(true);
        try {
            const { createdSessionId, setActive } =
                await startOAuthFlow({
                    redirectUrl: Linking.createURL('/'),
                });

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });
            }
        } catch (err) {
            console.error('OAuth error:', err);
        } finally {
            setIsGoogleLoading(false);
        }
    }, [startOAuthFlow, isGoogleLoading]);

    const handleSubmit = async () => {
        const { error } = await signUp.password({
            emailAddress,
            password,
        });
        if (error) {
            console.error(JSON.stringify(error, null, 2));
            return;
        }

        if (!error) await signUp.verifications.sendEmailCode();
    };

    const handleVerify = async () => {
        await signUp.verifications.verifyEmailCode({
            code,
        });
        if (signUp.status === 'complete') {
            await signUp.finalize({
                navigate: ({ session, decorateUrl }) => {
                    if (session?.currentTask) {
                        console.log(session?.currentTask);
                        return;
                    }

                    const url = decorateUrl('/');
                    if (url.startsWith('http')) {
                        window.location.href = url;
                    } else {
                        router.push(url as Href);
                    }
                },
            });
        } else {
            console.error('Sign-up attempt not complete:', signUp);
        }
    };

    const handleBlur = (field: 'email' | 'password' | 'code') => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
    };

    if (signUp.status === 'complete' || isSignedIn) {
        return null;
    }

    if (
        signUp.status === 'missing_requirements' &&
        signUp.unverifiedFields.includes('email_address') &&
        signUp.missingFields.length === 0
    ) {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentInsetAdjustmentBehavior="automatic"
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.headerSection}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.iconEmoji}>✉️</Text>
                            </View>
                            <Text style={styles.title}>Verify your account</Text>
                            <Text style={styles.subtitle}>
                                Enter the verification code sent to your email
                            </Text>
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Verification Code</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        touchedFields.code && errors.fields.code && styles.inputError,
                                    ]}
                                    value={code}
                                    placeholder='123456'
                                    placeholderTextColor={colors.textMuted}
                                    onChangeText={(code) => setCode(code)}
                                    onBlur={() => handleBlur('code')}
                                    keyboardType='numeric'
                                    autoComplete='one-time-code'
                                />
                                {touchedFields.code && errors.fields.code && (
                                    <Text style={styles.errorText} selectable>
                                        {errors.fields.code.message}
                                    </Text>
                                )}
                            </View>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.primaryButton,
                                    fetchStatus === 'fetching' && styles.buttonDisabled,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={handleVerify}
                                disabled={fetchStatus === 'fetching'}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {fetchStatus === 'fetching' ? 'Verifying...' : 'Verify'}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.secondaryButton,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={() => signUp.verifications.sendEmailCode()}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Didn't receive a code? Send again
                                </Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    const isFormValid = emailAddress.length > 0 && password.length > 0;
    const isLoading = fetchStatus === 'fetching';

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >
                    <View style={styles.headerSection}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logo}>
                                <Text style={styles.logoText}>P</Text>
                            </View>
                        </View>
                        <Text style={styles.title}>Create an account</Text>
                        <Text style={styles.subtitle}>
                            Sign up to get started
                        </Text>
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    touchedFields.email && errors.fields.emailAddress && styles.inputError,
                                ]}
                                autoCapitalize='none'
                                autoCorrect={false}
                                value={emailAddress}
                                placeholder='you@example.com'
                                placeholderTextColor={colors.textMuted}
                                onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                                onBlur={() => handleBlur('email')}
                                keyboardType='email-address'
                                textContentType='emailAddress'
                            />
                            {touchedFields.email && errors.fields.emailAddress && (
                                <Text style={styles.errorText} selectable>
                                    {errors.fields.emailAddress.message}
                                </Text>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    touchedFields.password && errors.fields.password && styles.inputError,
                                ]}
                                value={password}
                                placeholder='Create a password'
                                placeholderTextColor={colors.textMuted}
                                secureTextEntry={true}
                                onChangeText={(password) => setPassword(password)}
                                onBlur={() => handleBlur('password')}
                                textContentType='newPassword'
                            />
                            {touchedFields.password && errors.fields.password && (
                                <Text style={styles.errorText} selectable>
                                    {errors.fields.password.message}
                                </Text>
                            )}
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.primaryButton,
                                (!isFormValid || isLoading) && styles.buttonDisabled,
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={handleSubmit}
                            disabled={!isFormValid || isLoading}
                        >
                            <Text style={styles.primaryButtonText}>
                                {isLoading ? 'Creating account...' : 'Sign up'}
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.socialSection}>
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.socialButton,
                                isGoogleLoading && styles.buttonDisabled,
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={handleGoogleSignUp}
                            disabled={isGoogleLoading}
                        >
                            <Image
                                source={{ uri: 'https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg' }}
                                style={styles.socialIcon}
                                contentFit="contain"
                            />
                            <Text style={styles.socialButtonText}>
                                {isGoogleLoading ? 'Signing up...' : 'Continue with Google'}
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <Link href='/sign-in'>
                            <Text style={styles.linkText}>Sign in</Text>
                        </Link>
                    </View>

                    <View nativeID='clerk-captcha' />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: 'center',
        gap: 16,
        marginBottom: 32,
    },
    logoContainer: {
        marginBottom: 8,
    },
    logo: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.text,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    formSection: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        backgroundColor: colors.surface,
        color: colors.text,
    },
    inputError: {
        borderColor: colors.error,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '600',
    },
    secondaryButton: {
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: colors.primarySoft,
        fontSize: 15,
        fontWeight: '500',
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    socialSection: {
        gap: 20,
        alignItems: 'center',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.divider,
    },
    dividerText: {
        marginHorizontal: 16,
        color: colors.textMuted,
        fontSize: 13,
        fontWeight: '500',
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 20,
        width: '100%',
    },
    socialIcon: {
        width: 22,
        height: 22,
        marginRight: 12,
    },
    socialButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8,
    },
    footerText: {
        fontSize: 15,
        color: colors.textSecondary,
    },
    linkText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.primary,
    },
    errorText: {
        color: colors.error,
        fontSize: 13,
        fontWeight: '500',
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    iconEmoji: {
        fontSize: 32,
    },
});
