import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { rm } from '../../utils/ScreenUtils';
import { color_cacaca, color_main_btn, color_white } from '../../res/color';
import { BtnStyle } from '../../res/common.style';

export interface MsgModalPayload {
  showType?: number;
  studentId?: string;
  content?: string;
  contentEn?: string;
  single?: boolean;
  confirmText?: string;
  cacelText?: string;
  [key: string]: any;
}

interface MsgModalProps {
  commit: (payload: MsgModalPayload) => void;
}

interface MsgModalState {
  modalVisible: boolean;
  item: MsgModalPayload;
}

export class MsgModal extends React.Component<MsgModalProps, MsgModalState> {
  state: MsgModalState = {
    modalVisible: false,
    item: {},
  };

  show(item: MsgModalPayload): void {
    this.setState({ item, modalVisible: true });
  }

  private setModalVisible = (visible: boolean) => {
    this.setState({ modalVisible: visible });
  };

  private handleConfirm = (): void => {
    this.setModalVisible(false);
    this.props.commit(this.state.item);
  };

  render(): React.ReactNode {
    const { modalVisible, item } = this.state;
    const { content, contentEn, single, confirmText, cacelText } = item;
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
                <Text style={styles.detail_name}>{content || ''}</Text>
                <Text style={styles.detail_name}>{contentEn || ''}</Text>
                <View style={BtnStyle.bottom_btn}>
                  {!single && (
                    <TouchableOpacity onPress={() => this.setModalVisible(false)}>
                      <View style={[BtnStyle.btn_bg, styles.cancelBg]}>
                        <Text style={BtnStyle.btn_text}>{cacelText || '取消Cancel'}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={this.handleConfirm}>
                    <View
                      style={[
                        BtnStyle.btn_bg,
                        styles.confirmBg,
                        single ? styles.btn_bg_show : undefined,
                      ]}
                    >
                      <Text style={BtnStyle.btn_text}>{confirmText || '确认Create'}</Text>
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
    paddingTop: rm(52),
    backgroundColor: color_white,
  },
  detail_name: {
    width: rm(378),
    fontSize: rm(17),
    color: '#484848',
    alignSelf: 'center',
    textAlign: 'center',
  },
  btn_bg_show: {
    width: rm(446),
  },
  cancelBg: {
    backgroundColor: color_cacaca,
  },
  confirmBg: {
    backgroundColor: color_main_btn,
  },
});
