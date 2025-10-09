import { Dimensions } from 'react-native';

const uiWidthPx = 1024;

const getDeviceWidth = (): number => Dimensions.get('window').width;

export const rm = (uiElePx: number): number => (uiElePx * getDeviceWidth()) / uiWidthPx;

export const deviceWidthDp = getDeviceWidth();
