import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Platform,
  useColorScheme,
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import supabaseClient from '../lib/SupabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { useNavigation } from '@react-navigation/native';

let appleAuth: any = null;
try {
  // Import lazily so Android builds without Apple dependency issues on CI
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  appleAuth = require('@invertase/react-native-apple-authentication');
} catch {}

type LoginScreenProps = {
  onAuthenticated?: (displayName: string) => void;
};

const LoginScreen = ({ onAuthenticated }: LoginScreenProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [appleIconFailed, setAppleIconFailed] = React.useState(false);
  const [microsoftIconFailed, setMicrosoftIconFailed] = React.useState(false);
  // Use custom Microsoft icon
  

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [heroIndex, setHeroIndex] = React.useState(0);
  // Use custom logo for Google button
  const googleIconSource: any = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('../../assets/logo.jpg');
    } catch {
      // Fallback to default Google icon if custom logo fails
      return { uri: 'https://developers.google.com/identity/images/g-logo.png' };
    }
  })();
  const heroCandidates: any[] = (() => {
    const urls: any[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const img2 = require('../../assets/img2.png');
      urls.unshift(img2);
    } catch {}
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const localHero = require('../../assets/hero.jpg');
      urls.push(localHero);
    } catch {}
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const alt = require('../../assets/img.jpg');
      urls.push(alt);
    } catch {}
    // Fallback to online images if local images fail
    urls.push({ uri: 'https://images.unsplash.com/photo-1520975938473-58d63d1a2bf3?q=80&w=1080&auto=format&fit=crop' });
    urls.push({ uri: 'https://picsum.photos/1080/1600' });
    return urls;
  })();
  const heroSource = heroCandidates[Math.min(heroIndex, heroCandidates.length - 1)];
  React.useEffect(() => {
    // Prefer google-services.json's web client id; fallback to app.json
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const appConfig = require('../../app.json');
    let candidate: string | undefined = appConfig?.webClientId;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const gms = require('../../android/app/google-services.json');
      const oauth = gms?.client?.[0]?.oauth_client?.find?.((c: any) => c?.client_type === 3);
      const fromGms = oauth?.client_id as string | undefined;
      if (fromGms) candidate = fromGms;
    } catch {}
    if (!candidate || candidate === 'YOUR_WEB_CLIENT_ID') {
      console.warn('[Auth] Missing Web Client ID. Set app.json "webClientId" or ensure google-services.json contains oauth client_type 3.');
    }
    const hasWebClientId = Boolean(candidate && candidate !== 'YOUR_WEB_CLIENT_ID');
    const cfg: any = { scopes: ['profile', 'email'] };
    if (hasWebClientId) {
      cfg.offlineAccess = true;
      cfg.webClientId = candidate;
    } else {
      // Avoid RNGoogleSignin error: offline use requires server webClientID
      cfg.offlineAccess = false;
    }
    GoogleSignin.configure(cfg);
  }, []);

  const resetState = () => {
    setIsLoading(false);
    setErrorMessage(null);
  };

  const clearGoogleSession = async () => {
    try {
      const hasPrev = await GoogleSignin.hasPreviousSignIn();
      if (hasPrev) {
        try { await GoogleSignin.revokeAccess(); } catch {}
        try { await GoogleSignin.signOut(); } catch {}
      }
    } catch {}
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Prefer interactive sign-in to ensure we get tokens on first run
      let result: any = null;
      try {
        result = await GoogleSignin.signIn();
      } catch (e) {
        // fallback to silent if already signed in
        try { result = await GoogleSignin.signInSilently(); } catch {}
      }
      const userName = result?.user?.name || result?.data?.user?.name;
      const idTokenFromResult = result?.idToken;
      // Verify tokens to ensure auth actually succeeded
      const tokens = await GoogleSignin.getTokens().catch(() => null);
      const idToken = idTokenFromResult || tokens?.idToken;
      const accessToken = tokens?.accessToken;
      if ((!idToken && !accessToken) || !userName) {
        await clearGoogleSession();
        setErrorMessage('Google authentication did not complete. Add Web Client ID and SHA-1, then rebuild.');
        setIsLoading(false);
        return;
      }
      onAuthenticated && onAuthenticated(userName);
      console.log('Google Sign-In result:', { userName, hasIdToken: Boolean(idToken) });
    } catch (error: any) {
      const code = error?.code;
      if (code === statusCodes.SIGN_IN_CANCELLED) {
        setErrorMessage('Sign-in cancelled.');
        setIsLoading(false);
        return;
      }
      if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setErrorMessage('Google Play Services not available. Please update/install.');
        setIsLoading(false);
        return;
      }
      console.log('Google Sign-In Error:', code, error?.message, error);
      setErrorMessage(`Google Sign-In failed (${code || 'UNKNOWN'}).`);
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      if (Platform.OS !== 'ios' || !appleAuth) {
        setErrorMessage('Apple Sign-In is available on iOS only.');
        setIsLoading(false);
        return;
      }
      const response = await appleAuth.appleAuth.performRequest({
        requestedOperation: appleAuth.AppleAuthRequestOperation.LOGIN,
        requestedScopes: [
          appleAuth.AppleAuthRequestScope.EMAIL,
          appleAuth.AppleAuthRequestScope.FULL_NAME,
        ],
      });
      const fullName = response?.fullName?.givenName;
      const identityToken = response?.identityToken;
      if (!identityToken || !fullName) {
        setErrorMessage('Apple authentication did not complete. Please try again.');
        setIsLoading(false);
        return;
      }
      onAuthenticated && onAuthenticated(fullName);
      console.log('Apple Sign-In result:', { fullName, hasIdentityToken: Boolean(identityToken) });
    } catch (error) {
      console.log('Apple Sign-In Error:', error);
      setErrorMessage('Apple Sign-In failed');
      setIsLoading(false);
    }
  };

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themed = React.useMemo(() => ({
    background: '#000000',
    buttonBg: '#2a2a2a',
    buttonBorder: '#3a3a3a',
    buttonText: '#e5e7eb',
    footerText: '#8A8A8A',
    errorBg: '#3b1d1d',
    errorBorder: '#5b2d2d',
    errorText: '#fecaca',
    errorHint: '#fca5a5',
    appleTint: '#ffffff',
  }), []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themed.background }] }>
      <View style={styles.top}>
        <View style={styles.card}>
          <Image
            source={require('../../assets/img2.png')}
            style={styles.heroImage}
            resizeMode="contain"
            onError={(e) => {
              console.log('Hero image load error', e?.nativeEvent);
              setHeroIndex((i) => (i + 1 < heroCandidates.length ? i + 1 : i));
            }}
          />
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: themed.buttonBg, borderColor: themed.buttonBorder }]} onPress={handleGoogleLogin} disabled={isLoading}>
          <View style={styles.btnContentLeft}>
            <Image
              source={require('../../assets/flat-color-icons_google.png')}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={[styles.btnText, { color: themed.buttonText }]}>{isLoading ? 'Signing in...' : 'Continue with Google'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: themed.buttonBg, borderColor: themed.buttonBorder }]} onPress={handleAppleLogin} disabled={isLoading}>
          <View style={styles.btnContentLeft}>
            {appleIconFailed ? (
              <Text style={[styles.iconFallback, { color: themed.appleTint }]}></Text>
            ) : (
            <Image
                source={{ uri: 'https://img.icons8.com/ios-filled/50/FFFFFF/mac-os.png' }}
                style={[styles.iconApple, { tintColor: '#ffffff' }]}
                resizeMode="contain"
                onError={() => setAppleIconFailed(true)}
              />
            )}
            <Text style={[styles.btnText, { color: themed.buttonText }]}>Continue with Apple</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: themed.buttonBg, borderColor: themed.buttonBorder }]} disabled>
          <View style={styles.btnContentLeft}>
            {microsoftIconFailed ? (
              <View style={styles.msFallback} />
            ) : (
            <Image
                source={require('../../assets/micro.png')}
                style={styles.iconMicrosoft}
                resizeMode="contain"
                onError={() => setMicrosoftIconFailed(true)}
              />
            )}
            <Text style={[styles.btnText, { color: themed.buttonText }]}>Continue with Microsoft Account</Text>
          </View>
        </TouchableOpacity>
      </View>
      {errorMessage ? (
        <View style={[styles.errorBox, { backgroundColor: themed.errorBg, borderColor: themed.errorBorder }]}>
          <Text style={[styles.errorText, { color: themed.errorText }]}>{errorMessage}</Text>
          <Text style={[styles.errorHint, { color: themed.errorHint }]}>You can try again; we reset the session.</Text>
        </View>
      ) : null}

      <View style={styles.footerContainer}>
        <Text style={[styles.footer, { color: themed.footerText }]}>Helium powered by Neural Arc Inc.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  top: {
    flex: 2.5,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 0,
  },
  bottom: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 14,
  },
  header: {
    height: 1,
  },
  card: {
    backgroundColor: '#000000',
    borderRadius: 36,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 0,
  },
  cardBadge: {
    display: 'none',
  },
  badgeDot: {
    display: 'none',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
    
    borderWidth: 0,
    backgroundColor: '#000000',
  },
  heroPlaceholder: {
    width: '100%',
    height: 460,
    borderRadius: 32,
    backgroundColor: '#2f2f2f',
  },
  buttons: {
    marginHorizontal: 20,
    gap: 16,
    marginTop: 12,
  },
  btn: {
    backgroundColor: '#2a2a2a',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: '100%',
  },
  btnContentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
    width: '100%',
    paddingHorizontal: 24,
    height: '100%',
  },
  btnText: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '500',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  icon: {
    width: 28,
    height: 28,
  },
  logoGoogle: {
    width: 100,
    height: 28,
    marginRight: 8,
  },
  iconApple: {
    width: 28,
    height: 28,
    tintColor: '#ffffff',
  },
  iconMicrosoft: {
    width: 25,
    height: 25,
  },
  iconFallback: {
    width: 28,
    height: 28,
    color: '#ffffff',
    fontSize: 20,
    textAlignVertical: 'center',
  },
  msFallback: {
    width: 28,
    height: 28,
    backgroundColor: '#0a84ff',
    borderRadius: 4,
  },
  errorBox: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#3b1d1d',
    borderWidth: 1,
    borderColor: '#5b2d2d',
  },
  errorText: {
    color: '#fecaca',
    fontSize: 13,
    marginBottom: 2,
  },
  errorHint: {
    color: '#fca5a5',
    fontSize: 12,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  footer: {
    textAlign: 'center',
    color: '#8A8A8A',
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
});

export default LoginScreen;

