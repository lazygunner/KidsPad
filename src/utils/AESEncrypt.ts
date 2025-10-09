import CryptoJS from 'crypto-js';

const DEFAULT_SECRET = 'E2UOWJHXIUS58,9S';
const DEFAULT_KEY = CryptoJS.enc.Utf8.parse(DEFAULT_SECRET);
const DEFAULT_IV = CryptoJS.enc.Utf8.parse(DEFAULT_SECRET);

const resolveKey = (keyStr?: string) => (keyStr ? CryptoJS.enc.Utf8.parse(keyStr) : DEFAULT_KEY);
const resolveIv = (ivStr?: string) => (ivStr ? CryptoJS.enc.Utf8.parse(ivStr) : DEFAULT_IV);

export const Encrypt = (word: string, keyStr?: string, ivStr?: string): string => {
  const key = resolveKey(keyStr);
  const iv = resolveIv(ivStr ?? keyStr);
  const srcs = CryptoJS.enc.Utf8.parse(word);
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding,
  });
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
};

export const Decrypt = (word: string, keyStr?: string, ivStr?: string): string => {
  const key = resolveKey(keyStr);
  const iv = resolveIv(ivStr ?? keyStr);
  const base64 = CryptoJS.enc.Base64.parse(word);
  const src = CryptoJS.enc.Base64.stringify(base64);
  const decrypt = CryptoJS.AES.decrypt(src, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding,
  });
  return decrypt.toString(CryptoJS.enc.Utf8);
};
