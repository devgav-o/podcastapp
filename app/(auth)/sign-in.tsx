import { useSignIn } from '@clerk/expo';
import { type Href, Link, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Pressable,
    TextInput,
    Text,
    View,
    ScrollView,
    PlatformColor,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';
import { useOAuth } from '@clerk/expo';
import * as Linking from 'expo-linking';
import { Image } from 'expo-image';

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
                <ScrollView
                    contentInsetAdjustmentBehavior='automatic'
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.headerSection}>
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
                                placeholderTextColor={PlatformColor(
                                    'placeholderText',
                                )}
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
            </SafeAreaView>
        );
    }

    const isFormValid = emailAddress.length > 0 && password.length > 0;
    const isLoading = fetchStatus === 'fetching';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentInsetAdjustmentBehavior='automatic'
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.headerSection}>
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.subtitle}>
                        Sign in to continue to your account
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
                            placeholderTextColor={PlatformColor(
                                'placeholderText',
                            )}
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
                            placeholderTextColor={PlatformColor(
                                'placeholderText',
                            )}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PlatformColor('systemBackground'),
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 40,
        gap: 32,
    },
    headerSection: {
        gap: 8,
    },
    title: {
        fontSize: 34,
        fontWeight: '700' as const,
        color: PlatformColor('label'),
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 17,
        color: PlatformColor('secondaryLabel'),
        lineHeight: 24,
    },
    formSection: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: PlatformColor('label'),
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
    },
    forgotLink: {
        fontSize: 14,
        fontWeight: '500' as const,
        color: '#0a7ea4',
    },
    input: {
        borderWidth: 1,
        borderColor: PlatformColor('separator'),
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: PlatformColor('secondarySystemBackground'),
        color: PlatformColor('label'),
    },
    inputError: {
        borderColor: '#d32f2f',
    },
    primaryButton: {
        backgroundColor: '#0a7ea4',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center' as const,
        boxShadow: '0 2px 8px rgba(10, 126, 164, 0.3)',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600' as const,
    },
    secondaryButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center' as const,
    },
    secondaryButtonText: {
        color: '#0a7ea4',
        fontSize: 15,
        fontWeight: '500' as const,
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center' as const,
        width: '100%',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: PlatformColor('separator'),
    },
    dividerText: {
        marginHorizontal: 16,
        color: PlatformColor('secondaryLabel'),
        fontSize: 13,
        fontWeight: '500' as const,
    },
    socialSection: {
        gap: 20,
        alignItems: 'center' as const,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        backgroundColor: PlatformColor('secondarySystemBackground'),
        borderWidth: 1,
        borderColor: PlatformColor('separator'),
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        width: '100%',
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    socialButtonText: {
        color: PlatformColor('label'),
        fontSize: 16,
        fontWeight: '500' as const,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 15,
        color: PlatformColor('secondaryLabel'),
    },
    linkText: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: '#0a7ea4',
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 13,
        fontWeight: '500' as const,
    },
});
