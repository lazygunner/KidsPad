import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { rm } from '../../utils/ScreenUtils';
import { color_cacaca, color_main_btn, color_white } from '../../res/color';
import { BtnStyle } from '../../res/common.style';
import Password from '../pwdInput';
import HttpUtils, { SUCCESS_CODE } from '../../utils/HttpUtils';
import ToastUtils, { ToastType } from '../../utils/ToastUtils';

export enum PIN_TYPE {
  SET = 'SET',
  SET_VERIFY = 'SET_VERIFY',
  SET_BACK_TRY = 'SET_BACK_TRY',
  VERIFY = 'VERIFY',
}

export interface PinModalPayload {
  studentId?: string;
  studentInfo?: Record<string, any>;
  type?: number; // sign type for sign modal
  confirmText?: string;
  cacelText?: string;
  single?: boolean;
  pinFlowType?: PIN_TYPE;
  [key: string]: any;
}

interface PinModalProps {
  setCommit: () => void;
  verifyCommit: (payload: Record<string, any>) => void;
}

interface PinModalState {
  modalVisible: boolean;
  item: PinModalPayload;
  title: string;
  desc: string;
  confirm: boolean;
}

export class PinModal extends React.Component<PinModalProps, PinModalState> {
  state: PinModalState = {
    modalVisible: false,
    item: {},
    title: '',
    desc: '',
    confirm: false,
  };

  private value = '';

  private oldValue = '';

  private type: PIN_TYPE = PIN_TYPE.VERIFY;

  private passwordRef = React.createRef<Password>();

  private updateConfirm = (value: string) => {
    this.value = value;
    const confirm = value.length === 6;
    this.setState({ confirm });
    if (!confirm) {
      return;
    }
    if (this.type === PIN_TYPE.VERIFY) {
      this.verifyPin();
    }
  };

  private async setPin(): Promise<void> {
    const { item } = this.state;
    if (!item.studentId) {
      return;
    }
    const params = {
      id: item.studentId,
      pinCode: this.value,
    };
    const response = await HttpUtils.postRequrst('student/setPin', params, true);
    if (response && (response as any).code === SUCCESS_CODE) {
      ToastUtils.show(
        'PIN码设置成功，欢迎进入签到页面。 Your PIN has been saved. Please remember.',
        ToastType.SUCCESS,
      );
      this.hide();
      this.props.setCommit();
    }
  }

  private async verifyPin(): Promise<void> {
    const { item } = this.state;
    if (!item.studentId) {
      return;
    }
    const params = {
      id: item.studentId,
      pinCode: this.value,
    };
    const response = await HttpUtils.postRequrst('student/verifyPin', params, true);
    if (response && (response as any).code === SUCCESS_CODE) {
      this.hide();
      this.props.verifyCommit(item);
    } else {
      this.clear();
    }
  }

  private hide(): void {
    this.setState({ modalVisible: false });
  }

  clear(resetOldValue = false): void {
    this.value = '';
    if (resetOldValue) {
      this.oldValue = '';
    }
    this.passwordRef.current?.clear();
    this.setState({ confirm: false });
  }

  private cancel(): void {
    if (this.type === PIN_TYPE.SET_BACK_TRY) {
      this.show(this.state.item, PIN_TYPE.SET);
      return;
    }
    this.hide();
  }

  private async commit(): Promise<void> {
    if (this.type === PIN_TYPE.SET) {
      this.oldValue = this.value;
      this.show(this.state.item, PIN_TYPE.SET_VERIFY);
      return;
    }
    if (this.type === PIN_TYPE.SET_VERIFY || this.type === PIN_TYPE.SET_BACK_TRY) {
      if (this.oldValue !== this.value) {
        ToastUtils.show(
          '与上次PIN码输入不一致，请选择重试或重新设置PIN码？ Verification failed. Please Try Again or Back to Set?',
          ToastType.WARNING,
        );
        this.show(this.state.item, PIN_TYPE.SET_BACK_TRY);
        return;
      }
      await this.setPin();
      return;
    }
    if (this.type === PIN_TYPE.VERIFY) {
      await this.verifyPin();
    }
  }

  show(item: PinModalPayload, type: PIN_TYPE = PIN_TYPE.SET): void {
    this.type = type;
    const resetOldValue = type === PIN_TYPE.SET || type === PIN_TYPE.VERIFY;
    this.clear(resetOldValue);
    const payload: PinModalPayload = { ...item, confirmText: '', cacelText: '', pinFlowType: type };
    let title = '';
    let desc = '';
    switch (type) {
      case PIN_TYPE.SET:
        title = '请设置PIN码 Please Create Your PIN';
        desc = '请输入6位数PIN码 Please enter 6 digit number';
        payload.confirmText = '下一步Next';
        break;
      case PIN_TYPE.SET_BACK_TRY:
        payload.confirmText = '重试Try Again';
        payload.cacelText = '重新设置Back to Set';
      // fall through
      case PIN_TYPE.SET_VERIFY:
        title = '请再次输入设置的PIN码以确认';
        desc = 'Please Enter PIN Again to Verify';
        break;
      case PIN_TYPE.VERIFY:
      default:
        title = '请输入PIN码 Please Enter PIN';
        break;
    }
    this.setState({
      item: payload,
      title,
      desc,
      modalVisible: true,
      confirm: false,
    });
  }

  private descStyle(): Record<string, any> | undefined {
    if (this.type === PIN_TYPE.SET_VERIFY || this.type === PIN_TYPE.SET_BACK_TRY) {
      return styles.detail_name;
    }
    return undefined;
  }

  render(): React.ReactNode {
    const { modalVisible, item, title, desc, confirm } = this.state;
    return (
      <Modal
        animationType="fade"
        supportedOrientations={['portrait', 'landscape-right', 'landscape-left']}
        transparent
        visible={modalVisible}
        onRequestClose={() => this.hide()}
      >
        <TouchableOpacity style={styles.body} onPress={() => this.hide()}>
          <View style={styles.content}>
            <KeyboardAvoidingView style={styles.container} behavior="padding">
              <TouchableOpacity activeOpacity={1} onPress={() => undefined}>
                <View style={[styles.detail, this.type === PIN_TYPE.VERIFY && styles.detail_simple]}>
                  <Text style={styles.detail_name}>{title}</Text>
                  {desc ? <Text style={[styles.detail_desc, this.descStyle()]}>{desc}</Text> : null}
                  <Password
                    ref={this.passwordRef}
                    maxLength={6}
                    onChange={this.updateConfirm}
                    onEnd={() => this.commit()}
                  />
                  {this.type !== PIN_TYPE.VERIFY && (
                    <View style={BtnStyle.bottom_btn}>
                      {!item.single && (
                        <TouchableOpacity onPress={() => this.cancel()}>
                          <View style={[BtnStyle.btn_bg, styles.cancelBg]}>
                            <Text style={BtnStyle.btn_text}>{item.cacelText || '取消Cancel'}</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity disabled={!confirm} onPress={() => this.commit()}>
                        <View
                          style={[
                            BtnStyle.btn_bg,
                            styles.confirmBg,
                            !confirm && styles.confirm_disable,
                            item.single && styles.btn_bg_show,
                          ]}
                        >
                          <Text style={BtnStyle.btn_text}>{item.confirmText || '确认Create'}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
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
  container: {
    paddingBottom: rm(10),
  },
  detail: {
    width: rm(446),
    height: rm(252),
    paddingTop: rm(37),
    backgroundColor: color_white,
  },
  detail_simple: {
    height: rm(200),
  },
  detail_name: {
    width: rm(378),
    fontSize: rm(18),
    color: '#484848',
    alignSelf: 'center',
    textAlign: 'center',
  },
  detail_desc: {
    width: rm(378),
    fontSize: rm(13),
    marginTop: rm(5),
    color: color_cacaca,
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
  confirm_disable: {
    backgroundColor: '#7199CA',
  },
});
