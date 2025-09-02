import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { getSupabaseClient } from '../lib/supabaseClient';

// For React Native Google Signin (native), use idToken → Supabase signInWithIdToken
let RNGoogleSignin: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RNGoogleSignin = require('@react-native-google-signin/google-signin');
} catch {}

type Props = {
  onSuccess?: (user: any) => void;
  onError?: (message: string) => void;
  label?: string;
};

const GoogleLoginButton = ({ onSuccess, onError, label = 'Continue with Google' }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const supabase = getSupabaseClient();

  const signInWeb = async () => {
    // For web platforms, we need to handle OAuth redirect
    // In React Native, this function won't be called, but we keep it for web compatibility
    let redirectTo: string | undefined;
    if (Platform.OS === 'web') {
      try {
        // Only access window in web environment
        redirectTo = (globalThis as any)?.window?.location?.origin;
      } catch {
        redirectTo = undefined;
      }
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;
  };

  const signInNative = async () => {
    const { GoogleSignin } = RNGoogleSignin || {};
    if (!GoogleSignin) throw new Error('GoogleSignin not available');
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    await GoogleSignin.configure({});
    const result = await GoogleSignin.signIn();
    const idToken = result?.idToken;
    if (!idToken) throw new Error('No idToken from Google Sign-In');
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) throw error;
    onSuccess && onSuccess(data?.user);
  };

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await signInNative();
      } else {
        await signInWeb();
      }
    } catch (e: any) {
      const msg = e?.message || 'Google Sign-In failed';
      onError && onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={loading} style={{
      backgroundColor: '#2a2a2a', borderColor: '#3a3a3a', borderWidth: 1, borderRadius: 28,
      height: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16,
    }}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#e5e7eb', fontWeight: '600' }}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default GoogleLoginButton;


