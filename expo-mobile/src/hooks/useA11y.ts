import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

type AccessibilityEvent = 'reduceMotionChanged' | 'reduceTransparencyChanged';

function useAccessibilityFlag(read: () => Promise<boolean>, event: AccessibilityEvent): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;

    void read()
      .then((value) => {
        if (active) {
          setEnabled(value);
        }
      })
      .catch(() => {
        if (active) {
          setEnabled(false);
        }
      });

    const subscription = AccessibilityInfo.addEventListener(event, (value: boolean) => {
      setEnabled(value);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [read, event]);

  return enabled;
}

const readReduceMotion = (): Promise<boolean> => AccessibilityInfo.isReduceMotionEnabled();
const readReduceTransparency = (): Promise<boolean> =>
  AccessibilityInfo.isReduceTransparencyEnabled();

/** True when the OS asks apps to minimise motion. */
export function useReduceMotion(): boolean {
  return useAccessibilityFlag(readReduceMotion, 'reduceMotionChanged');
}

/** True when the OS asks apps to avoid translucent/blurred surfaces. */
export function useReduceTransparency(): boolean {
  return useAccessibilityFlag(readReduceTransparency, 'reduceTransparencyChanged');
}
