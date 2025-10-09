import React from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { rm } from '../../utils/ScreenUtils';
import { color_cacaca, color_main_btn, color_white } from '../../res/color';
import { BtnStyle } from '../../res/common.style';

export interface StudentInfo {
  name?: string;
  className?: string;
  avatar?: string;
  [key: string]: any;
}

interface SignModalProps {
  commit: (params: { studentInfo: StudentInfo; signType: number }) => void;
}

interface SignModalState {
  modalVisible: boolean;
  studentInfo: StudentInfo;
  signType: number;
}

export class SignModal extends React.Component<SignModalProps, SignModalState> {
  state: SignModalState = {
    modalVisible: false,
    studentInfo: {},
    signType: 0,
  };

  show(studentInfo: StudentInfo, signType: number): void {
    this.setState({ studentInfo, signType, modalVisible: true });
  }

  private setModalVisible = (visible: boolean) => {
    this.setState({ modalVisible: visible });
  };

  private handleConfirm = () => {
    const { studentInfo, signType } = this.state;
    this.setModalVisible(false);
    this.props.commit({ studentInfo, signType });
  };

  render(): React.ReactNode {
    const { modalVisible, studentInfo, signType } = this.state;
    return (
      <Modal
        animationType="fade"
        supportedOrientations={['portrait', 'landscape-right', 'landscape-left']}
        transparent
        visible={modalVisible}
        onRequestClose={() => this.setModalVisible(false)}
      >
        <TouchableOpacity style={styles.body} onPress={() => this.setModalVisible(false)}>
          <View style={styles.content}>
            <TouchableOpacity activeOpacity={1} onPress={() => undefined}>
              <View style={styles.detail}>
                <Text style={styles.detail_name}>姓名：{studentInfo.name || ''}</Text>
                <Text style={styles.detail_class}>班级：{studentInfo.className || ''}</Text>
                {studentInfo.avatar ? (
                  <Image style={styles.detail_avatar} source={{ uri: studentInfo.avatar }} />
                ) : (
                  <View style={[styles.detail_avatar, styles.avatarPlaceholder]} />
                )}
                <View style={BtnStyle.bottom_btn}>
                  <TouchableOpacity onPress={() => this.setModalVisible(false)}>
                    <View style={[BtnStyle.btn_bg, styles.cancelBg]}>
                      <Text style={BtnStyle.btn_text}>取消Cancel</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={this.handleConfirm}>
                    <View style={[BtnStyle.btn_bg, styles.confirmBg]}>
                      <Text style={BtnStyle.btn_text}>
                        {signType === 0 ? '签到Sign In' : '签出Sign Out'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detail: {
    width: rm(446),
    height: rm(200),
    backgroundColor: color_white,
  },
  detail_name: {
    fontSize: rm(18),
    color: '#484848',
    marginLeft: rm(52),
    marginTop: rm(43),
  },
  detail_class: {
    fontSize: rm(18),
    color: '#484848',
    marginLeft: rm(52),
    marginTop: rm(6),
  },
  detail_avatar: {
    width: rm(82),
    height: rm(82),
    position: 'absolute',
    top: rm(26),
    right: rm(30),
    backgroundColor: color_cacaca,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBg: {
    backgroundColor: color_cacaca,
  },
  confirmBg: {
    backgroundColor: color_main_btn,
  },
});
