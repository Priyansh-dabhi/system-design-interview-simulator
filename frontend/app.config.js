require("dotenv/config");

const { expo } = require("./app.json");

const resolvedApiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.API_URL ||
    expo.extra?.API_URL ||
    "";

const resolvedFirebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || expo.extra?.firebase?.apiKey || "",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || expo.extra?.firebase?.authDomain || "",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || expo.extra?.firebase?.projectId || "",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || expo.extra?.firebase?.storageBucket || "",
    messagingSenderId:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || expo.extra?.firebase?.messagingSenderId || "",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || expo.extra?.firebase?.appId || "",
};

const resolvedGoogleAuthConfig = {
    androidClientId:
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || expo.extra?.googleAuth?.androidClientId || "",
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || expo.extra?.googleAuth?.iosClientId || "",
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || expo.extra?.googleAuth?.webClientId || "",
};

module.exports = {
    ...expo,
    extra: {
        ...expo.extra,
        API_URL: resolvedApiUrl,
        firebase: resolvedFirebaseConfig,
        googleAuth: resolvedGoogleAuthConfig,
    },
};
