# Google Sign-In Setup Instructions

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sign-In API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sign-In API"
   - Click "Enable"

## 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Helium Applications"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (for development)

## 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Create two client IDs:

### Web Application Client ID
- Application type: Web application
- Name: "Helium Applications Web"
- Copy the Client ID (this is your WEB_CLIENT_ID)

### Android Client ID
- Application type: Android
- Name: "Helium Applications Android"
- Package name: `com.heliumapplications`
- SHA-1 certificate fingerprint: Get this by running:
  ```bash
  keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```

## 4. Update Configuration Files

1. Replace the placeholder values in `android/app/google-services.json` with your actual values from Google Cloud Console
2. Update the `webClientId` in `src/components/LoginScreen.tsx` with your Web Client ID

## 5. Install Dependencies

The following dependencies are already installed:
- `@react-native-google-signin/google-signin`
- `react-native-linear-gradient`

## 6. Run the App

```bash
# For Android
npm run android

# For iOS (additional setup required)
npm run ios
```

## Important Notes

- Make sure to replace all placeholder values with your actual Google Cloud Console credentials
- The SHA-1 fingerprint is crucial for Android authentication
- For production, you'll need to create a release keystore and update the SHA-1 fingerprint
- Test the Google Sign-In functionality thoroughly before deploying

