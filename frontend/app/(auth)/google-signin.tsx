import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { LoadingSplash } from "../../src/components/LoadingSplash";
import { useAppDispatch } from "../../src/redux/hooks";
import {
  clearGoogleAuthPhase,
  loginWithGoogle,
  setGoogleAuthPhase,
} from "../../src/redux/slices/auth";
import { GoogleAuthError, signInWithGoogleAsync } from "../../src/services/googleAuth";
import { getErrorMessage } from "../../src/utils/error";

export default function GoogleSigninScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const runGoogleSignIn = async () => {
      try {
        dispatch(setGoogleAuthPhase("browser"));
        const { firebaseIdToken } = await signInWithGoogleAsync();
        dispatch(setGoogleAuthPhase("redirecting"));
        await dispatch(loginWithGoogle(firebaseIdToken)).unwrap();
      } catch (error) {
        dispatch(clearGoogleAuthPhase());

        if (error instanceof GoogleAuthError && error.code === "cancelled") {
          router.replace("/(auth)/login");
          return;
        }

        Alert.alert("Google sign-in failed", getErrorMessage(error, "Please try again."), [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]);
      }
    };

    runGoogleSignIn();
  }, [dispatch, router]);

  return <LoadingSplash />;
}
