import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { rm } from '../utils/ScreenUtils';
import { BtnStyle } from '../res/common.style';
import {
  BaseUrl,
  SUCCESS_CODE,
} from '../utils/HttpUtils';
import HttpUtils from '../utils/HttpUtils';
import { Encrypt } from '../utils/AESEncrypt';
import StorageUtils from '../utils/StorageUtils';
import { JPushModuleService } from '../modules/PushModule';
import { ToastType } from '../utils/ToastUtils';
import ToastUtils from '../utils/ToastUtils';
import { RootStackParamList } from '../navigation/types';
import { color_black, color_cacaca, color_white } from '../res/color';

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const getEnvTag = (): string => {
  if (BaseUrl.includes('api')) {
    return 'prod';
  }
  if (BaseUrl.includes('test')) {
    return 'test';
  }
  return 'dev';
};

const secureIcons = {
  shown: require('../res/img/eye-ser.png'),
  hidden: require('../res/img/eye-nor.png'),
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [securePwdText, setSecurePwdText] = useState(true);
  const passwordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    let isMounted = true;
    StorageUtils.retrieveData<string>('token').then(token => {
      if (isMounted && token) {
        navigation.replace('Sign');
      }
    });
    return () => {
      isMounted = false;
    };
  }, [navigation]);

  const setTags = async (gardenId?: string, classId?: string) => {
    const tags: string[] = [];
    const envTag = getEnvTag();
    if (classId) {
      tags.push(`${envTag}_class_${classId}`);
    } else if (gardenId) {
      tags.push(`${envTag}_garden_${gardenId}`);
    }
    if (tags.length) {
      JPushModuleService.setTag(tags);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      ToastUtils.show('请输入用户名和密码', ToastType.WARNING);
      return;
    }
    const params = {
      username,
      password: Encrypt(password),
    };
    const response = await HttpUtils.postRequrst('user/appLogin', params, true);
    const success = response && (response as any).code === SUCCESS_CODE;
    if (!success) {
      return;
    }
    const payload = response as any;
    await StorageUtils.storeData('token', payload.token);
    await StorageUtils.storeData('loginInfo', payload.data);
    await StorageUtils.storeData('gardenId', payload.data?.gardenId);
    try {
      const registerId = await JPushModuleService.getRegisterID();
      console.log('JPush registerId', registerId);
      setTags(payload.data?.gardenId, payload.data?.ownClass);
    } catch (error) {
      console.warn('JPush register id error', error);
    }
    ToastUtils.show('登录成功', ToastType.SUCCESS);
    navigation.replace('Sign');
    passwordInputRef.current?.clear();
    setPassword('');
  };

  return (
    <View style={styles.content}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.contentInner}>
          <View style={styles.loginPane}>
            <View style={styles.loginItemHeader}>
              <Image style={styles.titImg} source={require('../res/img/login-name.png')} />
              <Text>用户名Account</Text>
            </View>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              placeholder="请输入用户名"
              autoComplete="username"
              placeholderTextColor={color_cacaca}
              onChangeText={setUsername}
              value={username}
            />
            <View style={styles.loginItemHeader}>
              <Image style={styles.titImg} source={require('../res/img/login-password.png')} />
              <Text>密码Password</Text>
            </View>
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              autoCapitalize="none"
              placeholder="请输入密码"
              autoComplete="password"
              returnKeyType="go"
              secureTextEntry={securePwdText}
              textContentType="password"
              placeholderTextColor={color_cacaca}
              value={password}
              onSubmitEditing={handleLogin}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.secureClick} onPress={() => setSecurePwdText(!securePwdText)}>
              <Image style={styles.secureImg} source={securePwdText ? secureIcons.hidden : secureIcons.shown} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.push('Web')}>
              <Text>
                已阅读并同意
                <Text style={styles.linkText}>用户协议</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogin}>
              <View style={[BtnStyle.btnConfirm, styles.loginButton]}>
                <Text style={BtnStyle.btnConfirmText}>登录Login</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Image style={styles.logo} source={require('../res/img/login-logo.png')} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color_white,
  },
  container: {
    paddingBottom: rm(10),
  },
  contentInner: {
    paddingTop: rm(46.5),
  },
  logo: {
    width: rm(93),
    height: rm(93),
    position: 'absolute',
    left: rm(154),
  },
  loginPane: {
    width: rm(400),
    height: rm(385),
    backgroundColor: color_white,
    borderRadius: rm(20),
    shadowColor: color_cacaca,
    shadowOffset: { height: rm(2), width: rm(9) },
    shadowRadius: rm(6),
    shadowOpacity: 1,
    paddingTop: rm(71),
    paddingHorizontal: rm(28),
  },
  loginItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titImg: {
    width: rm(20),
    height: rm(20),
    marginRight: rm(10),
  },
  input: {
    width: rm(344),
    height: rm(50),
    borderWidth: rm(1),
    borderRadius: rm(6),
    borderColor: '#DFDFDF',
    marginTop: rm(5),
    fontSize: rm(16),
    paddingHorizontal: rm(16),
    marginBottom: rm(26),
    color: color_black,
  },
  secureClick: {
    position: 'absolute',
    top: rm(213),
    right: rm(70),
  },
  secureImg: {
    width: rm(23),
    height: rm(19),
  },
  loginButton: {
    width: rm(344),
    marginTop: rm(26),
  },
  linkText: {
    color: color_black,
  },
});

export default LoginScreen;
