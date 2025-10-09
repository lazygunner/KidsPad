import { StyleSheet } from 'react-native';
import { rm } from '../utils/ScreenUtils';
import { color_white } from './color';


export const BtnStyle = StyleSheet.create({
    btnConfirm: {
        width: rm(160),
        height: rm(60),
        backgroundColor: "#1F579B",
        borderRadius: rm(6),
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
    },
    btnConfirmText: {
        color: color_white,
        textAlign: "center",
        fontSize: rm(18)
    },
    bottom_btn: {
        width: rm(446),
        height: rm(62),
        position: "absolute",
        bottom: 0,
        flexDirection: 'row'
    },
    btn_bg: {
        width: rm(223),
        height: rm(62),
        justifyContent: "center",
        alignItems: "center",
    },
    btn_text: {
        fontSize: rm(18),
        color: color_white,
        textAlign: 'center'
    },
})