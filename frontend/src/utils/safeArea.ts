import { Dimensions, Platform } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

/**
 * Calculates a reliable bottom safe area inset across all devices.
 * Specifically handles Android devices with 3-button navigation bars where
 * `insets.bottom` may be reported as 0 by the OS or during edge-to-edge layout transitions.
 *
 * @param insetsBottom - The bottom inset reported by `useSafeAreaInsets().bottom`
 * @returns A guaranteed safe bottom padding value in dp
 */
export function getSafeBottomInset(insetsBottom: number = 0, minFallback: number = 10): number {
  if (insetsBottom > 0) {
    return insetsBottom;
  }

  const initialBottom = initialWindowMetrics?.insets?.bottom ?? 0;
  if (initialBottom > 0) {
    return initialBottom;
  }

  if (Platform.OS === 'android') {
    const screenH = Dimensions.get('screen').height;
    const windowH = Dimensions.get('window').height;
    const diff = Math.round(screenH - windowH);
    // Standard Android 3-button or 2-button navigation bar is between 30dp and 72dp.
    // We cap at 72dp to avoid mistaking soft keyboard height for a navigation bar.
    if (diff >= 30 && diff <= 72) {
      return diff;
    }
  }

  // Fallback for devices without navigation bars (e.g. gesture mode with hint hidden)
  return minFallback;
}

