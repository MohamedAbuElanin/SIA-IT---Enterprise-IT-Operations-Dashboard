import { useEffect } from 'react';

interface ShortcutOptions {
  ctrlOrMeta?: boolean;
  shift?: boolean;
}

export const useKeyboardShortcut = (key: string, callback: () => void, options: ShortcutOptions = {}) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const modifierMatches = !options.ctrlOrMeta || event.ctrlKey || event.metaKey;
      const shiftMatches = !options.shift || event.shiftKey;
      if (modifierMatches && shiftMatches && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callback();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [callback, key, options.ctrlOrMeta, options.shift]);
};
