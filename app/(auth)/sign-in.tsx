import { useSignIn } from '@clerk/expo';
import { type Href, Link, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Pressable,
    TextInput,
    Text,
    View,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';
import { useOAuth } from '@clerk/expo';
import * as Linking from 'expo-linking';
import { Image } from 'expo-image';
import { colors } from '../../constants/colors';

export default function Page() {
    const { signIn, errors, fetchStatus } = useSignIn();
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

    const handleGoogleSignIn = useCallback(async () => {
        if (isGoogleLoading) return;
        setIsGoogleLoading(true);
        try {
            const { createdSessionId, setActive } = await startOAuthFlow({
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
        const { error } = await signIn.password({
            emailAddress,
            password,
        });
        if (error) {
            console.error(JSON.stringify(error, null, 2));
            return;
        }

        if (signIn.status === 'complete') {
            await signIn.finalize({
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
        } else if (signIn.status === 'needs_second_factor') {
        } else if (signIn.status === 'needs_client_trust') {
            const emailCodeFactor = signIn.supportedSecondFactors.find(
                (factor) => factor.strategy === 'email_code',
            );

            if (emailCodeFactor) {
                await signIn.mfa.sendEmailCode();
            }
        } else {
            console.error('Sign-in attempt not complete:', signIn);
        }
    };

    const handleVerify = async () => {
        await signIn.mfa.verifyEmailCode({ code });

        if (signIn.status === 'complete') {
            await signIn.finalize({
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
            console.error('Sign-in attempt not complete:', signIn);
        }
    };

    const handleBlur = (field: 'email' | 'password' | 'code') => {
        setTouchedFields((prev) => ({ ...prev, [field]: true }));
    };

    if (signIn.status === 'needs_client_trust') {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentInsetAdjustmentBehavior='automatic'
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
                                <Text style={styles.inputLabel}>
                                    Verification Code
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        touchedFields.code &&
                                            errors.fields.code &&
                                            styles.inputError,
                                    ]}
                                    value={code}
                                    placeholder='123456'
                                    placeholderTextColor={colors.smoke}
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
                                    fetchStatus === 'fetching' &&
                                        styles.buttonDisabled,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={handleVerify}
                                disabled={fetchStatus === 'fetching'}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {fetchStatus === 'fetching'
                                        ? 'Verifying...'
                                        : 'Verify'}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.secondaryButton,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={() => signIn.mfa.sendEmailCode()}
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
                    contentInsetAdjustmentBehavior='automatic'
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
                        <Text style={styles.kicker}>Welcome back</Text>
                        <Text style={styles.title}>Sign in to continue</Text>
                        <Text style={styles.subtitle}>
                            to your podcast sanctuary
                        </Text>
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    touchedFields.email &&
                                        errors.fields.identifier &&
                                        styles.inputError,
                                ]}
                                autoCapitalize='none'
                                autoCorrect={false}
                                value={emailAddress}
                                placeholder='you@example.com'
                                placeholderTextColor={colors.smoke}
                                onChangeText={(emailAddress) =>
                                    setEmailAddress(emailAddress)
                                }
                                onBlur={() => handleBlur('email')}
                                keyboardType='email-address'
                                textContentType='emailAddress'
                            />
                            {touchedFields.email && errors.fields.identifier && (
                                <Text style={styles.errorText} selectable>
                                    {errors.fields.identifier.message}
                                </Text>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <Link href='/forgot-password'>
                                    <Text style={styles.forgotLink}>Forgot?</Text>
                                </Link>
                            </View>
                            <TextInput
                                style={[
                                    styles.input,
                                    touchedFields.password &&
                                        errors.fields.password &&
                                        styles.inputError,
                                ]}
                                value={password}
                                placeholder='Enter your password'
                                placeholderTextColor={colors.smoke}
                                secureTextEntry={true}
                                onChangeText={(password) => setPassword(password)}
                                onBlur={() => handleBlur('password')}
                                textContentType='password'
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
                                (!isFormValid || isLoading) &&
                                    styles.buttonDisabled,
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={handleSubmit}
                            disabled={!isFormValid || isLoading}
                        >
                            <Text style={styles.primaryButtonText}>
                                {isLoading ? 'Signing in...' : 'Sign in'}
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
                            onPress={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                        >
                            <Image
                                source={{
                                    uri: 'https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg',
                                }}
                                style={styles.socialIcon}
                                contentFit='contain'
                            />
                            <Text style={styles.socialButtonText}>
                                {isGoogleLoading
                                    ? 'Signing in...'
                                    : 'Continue with Google'}
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Don't have an account?
                        </Text>
                        <Link href='/sign-up'>
                            <Text style={styles.linkText}>Sign up</Text>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.parchment,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 24,
    },
    headerSection: {
        alignItems: 'center',
        gap: 8,
        marginBottom: 32,
    },
    logoContainer: {
        marginBottom: 8,
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: colors.sienna,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.cream,
        fontFamily: 'serif',
    },
    kicker: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.smoke,
        letterSpacing: 0.15,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 26,
        fontWeight: '600',
        color: colors.bark,
        letterSpacing: -0.3,
        fontFamily: 'serif',
    },
    subtitle: {
        fontSize: 14,
        color: colors.smoke,
        textAlign: 'center',
    },
    formSection: {
        gap: 16,
    },
    inputGroup: {
        gap: 6,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.clay,
    },
    forgotLink: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.sienna,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.umber,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: colors.cream,
        color: colors.bark,
    },
    inputError: {
        borderColor: colors.rust,
    },
    primaryButton: {
        backgroundColor: colors.amber,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        color: colors.peat,
        fontSize: 17,
        fontWeight: '600',
    },
    secondaryButton: {
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: colors.clay,
        fontSize: 14,
        fontWeight: '500',
    },
    buttonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.umber,
        opacity: 0.2,
    },
    dividerText: {
        marginHorizontal: 12,
        color: colors.smoke,
        fontSize: 12,
        fontWeight: '500',
    },
    socialSection: {
        gap: 16,
        alignItems: 'center',
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.cream,
        borderWidth: 1,
        borderColor: colors.umber,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        width: '100%',
    },
    socialIcon: {
        width: 22,
        height: 22,
        marginRight: 12,
    },
    socialButtonText: {
        color: colors.bark,
        fontSize: 15,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
        color: colors.smoke,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.sienna,
    },
    errorText: {
        color: colors.rust,
        fontSize: 13,
        fontWeight: '500',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: colors.cream,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.umber,
    },
    iconEmoji: {
        fontSize: 32,
    },
});
