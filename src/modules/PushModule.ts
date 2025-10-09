import { NativeModules } from 'react-native';

type JPushNativeModule = {
  getRegisterID?: (callback?: (result: string) => void) => Promise<string> | void;
  setTags?: (tags: string[], callback?: (result: unknown) => void) => void;
};

const resolveModule = (): JPushNativeModule | undefined => {
  const module: JPushNativeModule | undefined = NativeModules?.JPushModule;
  if (!module) {
    console.warn('JPushModule native module is unavailable. Push tags will be skipped.');
  }
  return module;
};

export const JPushModuleService = {
  async getRegisterID(): Promise<string | null> {
    const module = resolveModule();
    if (!module || typeof module.getRegisterID !== 'function') {
      return null;
    }
    try {
      const maybePromise = module.getRegisterID(result => {
        if (result) {
          console.log('JPushModule callback registerId', result);
        }
      });
      if (maybePromise instanceof Promise) {
        return await maybePromise;
      }
      // Older native module signature resolves via callback above; fall back to null.
      return null;
    } catch (error) {
      console.warn('JPushModule.getRegisterID error', error);
      return null;
    }
  },

  setTag(tags: string[]): void {
    const module = resolveModule();
    if (!module || typeof module.setTags !== 'function') {
      return;
    }
    try {
      module.setTags(tags, result => {
        console.log('JPushModule.setTags result', result);
      });
    } catch (error) {
      console.warn('JPushModule.setTags error', error);
    }
  },
};
