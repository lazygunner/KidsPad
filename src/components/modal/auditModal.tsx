import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { rm } from '../../utils/ScreenUtils';
import { color_cacaca, color_main_btn, color_white } from '../../res/color';
import { BtnStyle } from '../../res/common.style';
import StorageUtils from '../../utils/StorageUtils';
import ToastUtils, { ToastType } from '../../utils/ToastUtils';
import { Encrypt } from '../../utils/AESEncrypt';
import HttpUtils, { SUCCESS_CODE } from '../../utils/HttpUtils';

interface AuditModalProps {
  commit: () => void;
}

interface AuditModalState {
  modalVisible: boolean;
  securePwdText: boolean;
  item: Record<string, any>;
  password: string;
}

export class AuditModal extends React.Component<AuditModalProps, AuditModalState> {
  state: AuditModalState = {
    modalVisible: false,
    securePwdText: true,
    item: {},
    password: '',
  };

  private passwordRef = React.createRef<TextInput>();

  async show(): Promise<void> {
    const loginInfo = await StorageUtils.retrieveData<Record<string, any>>('loginInfo');
    this.setState({ item: loginInfo || {}, modalVisible: true, password: '' });
  }

  private setModalVisible = (visible: boolean) => {
    this.setState({ modalVisible: visible });
  };

  private toggleSecure = () => {
    this.setState(state => ({ securePwdText: !state.securePwdText }));
  };

  private async commit(): Promise<void> {
    const { password, item } = this.state;
    if (!password) {
      ToastUtils.show('请输入密码', ToastType.WARNING);
      return;
    }
    const params = {
      username: item?.loginName,
      password: Encrypt(password),
    };
    const response = await HttpUtils.postRequrst('user/appSignLogin', params, true);
    if (response && (response as any).code === SUCCESS_CODE) {
      ToastUtils.show('验证通过,进入补签模式', ToastType.SUCCESS);
      this.passwordRef.current?.clear();
      this.props.commit();
      this.setModalVisible(false);
    }
  }

  private secureIcon() {
    return this.state.securePwdText
      ? require('../../res/img/eye-nor.png')
      : require('../../res/img/eye-ser.png');
  }

  render(): React.ReactNode {
    const { modalVisible, securePwdText, item, password } = this.state;
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
            <KeyboardAvoidingView style={styles.container} behavior="padding">
              <TouchableOpacity activeOpacity={1} onPress={() => undefined}>
                <View style={styles.detail}>
                  <Image style={styles.detail_avatar} source={require('../../res/img/buqian-touxiang.png')} />
                  <Text style={styles.detail_username}>{item?.loginName || ''}</Text>
                  <Text style={styles.detail_tip}>请再次输入您的登录密码以确认身份信息。</Text>
                  <Text style={styles.detail_tip}>Please input your account password to verify your identity.</Text>
                  <TextInput
                    ref={this.passwordRef}
                    style={styles.input}
                    placeholder="请输入密码"
                    autoComplete="password"
                    returnKeyType="go"
                    secureTextEntry={securePwdText}
                    onSubmitEditing={() => this.commit()}
                    onChangeText={text => this.setState({ password: text })}
                    autoFocus
                    value={password}
                    placeholderTextColor={color_cacaca}
                  />
                  <TouchableOpacity style={styles.secure_click} onPress={this.toggleSecure}>
                    <Image style={styles.secure_img} source={this.secureIcon()} />
                  </TouchableOpacity>
                  <View style={BtnStyle.bottom_btn}>
                    <TouchableOpacity onPress={() => this.setModalVisible(false)}>
                      <View style={[BtnStyle.btn_bg, styles.cancelBg]}>
                        <Text style={BtnStyle.btn_text}>取消Cancel</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.commit()}>
                      <View style={[BtnStyle.btn_bg, styles.confirmBg]}>
                        <Text style={BtnStyle.btn_text}>确认Create</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
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
    height: rm(400),
    paddingTop: rm(40),
    backgroundColor: color_white,
  },
  detail_avatar: {
    width: rm(79),
    height: rm(83),
    alignSelf: 'center',
  },
  detail_username: {
    width: rm(350),
    fontSize: rm(18),
    color: '#484848',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: rm(5),
    marginBottom: rm(20),
  },
  detail_tip: {
    width: rm(350),
    fontSize: rm(18),
    color: '#484848',
    alignSelf: 'center',
    textAlign: 'center',
  },
  input: {
    width: rm(350),
    height: rm(50),
    borderWidth: rm(1),
    borderRadius: rm(6),
    borderColor: '#DFDFDF',
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: rm(18),
    fontSize: rm(16),
    marginBottom: rm(26),
    paddingLeft: rm(36),
    paddingRight: rm(36),
  },
  secure_click: {
    position: 'absolute',
    top: rm(265),
    right: rm(85),
  },
  secure_img: {
    width: rm(23),
    height: rm(19),
  },
  cancelBg: {
    backgroundColor: color_cacaca,
  },
  confirmBg: {
    backgroundColor: color_main_btn,
  },
});
