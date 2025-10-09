import React from 'react';
import {
  DeviceEventEmitter,
  EmitterSubscription,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { rm } from '../utils/ScreenUtils';
import {
  color_999,
  color_c4c4c4,
  color_cacaca,
  color_main,
  color_main_btn,
  color_main_text,
  color_white,
} from '../res/color';
import { BtnStyle } from '../res/common.style';
import HttpUtils, { SUCCESS_CODE } from '../utils/HttpUtils';
import ToastUtils, { ToastType } from '../utils/ToastUtils';
import StorageUtils from '../utils/StorageUtils';
import { SignModal, StudentInfo } from '../components/modal/signModal';
import { MsgModal, MsgModalPayload } from '../components/modal/msgModal';
import { PinModal, PIN_TYPE, PinModalPayload } from '../components/modal/pinModal';
import { AuditModal } from '../components/modal/auditModal';
import { RootStackParamList } from '../navigation/types';

export type SignScreenProps = NativeStackScreenProps<RootStackParamList, 'Sign'>;

interface ClassInfo {
  id: string;
  className: string;
  totalNum?: number;
  signedInNum?: number;
}

interface GardenInfo {
  gardenName?: string;
  leaveNum?: number;
  signedInNum?: number;
  totalNum?: number;
  classList?: ClassInfo[];
  [key: string]: any;
}

interface StudentItem extends StudentInfo {
  studentId: string;
  signType?: number;
  leave?: boolean;
  dayLeave?: boolean;
  applySign?: boolean;
  resetTag?: boolean;
  setPIN?: boolean;
  avatar?: string;
}

interface SignScreenState {
  data: GardenInfo;
  classList: ClassInfo[];
  signInList: StudentItem[];
  signOutList: StudentItem[];
  mode: number;
  currentClass: number;
}

export default class SignScreen extends React.Component<SignScreenProps, SignScreenState> {
  state: SignScreenState = {
    data: {},
    classList: [],
    signInList: [],
    signOutList: [],
    mode: 0,
    currentClass: 0,
  };

  private classLeaveNum = 0;

  private intervalGarden?: ReturnType<typeof setInterval>;

  private intervalClass?: ReturnType<typeof setInterval>;

  private loginListener?: EmitterSubscription;

  private signModalRef = React.createRef<SignModal>();

  private msgModalRef = React.createRef<MsgModal>();

  private pinModalRef = React.createRef<PinModal>();

  private auditModalRef = React.createRef<AuditModal>();

  async componentDidMount(): Promise<void> {
    this.clearIntervalAll();
    const token = await StorageUtils.retrieveData<string>('token');
    if (!token) {
      this.toLogin(false);
      return;
    }
    this.loginListener = DeviceEventEmitter.addListener('toLogin', this.handleForceLogout);
    await this.getGardenInfo();
    this.autoSelectClass();
    await this.getClassInfo();
    this.intervalGarden = setInterval(() => this.getGardenInfo(), 10000);
    this.intervalClass = setInterval(() => this.getClassInfo(), 5000);
  }

  componentWillUnmount(): void {
    this.clearIntervalAll();
    this.loginListener?.remove();
  }

  private handleForceLogout = () => {
    this.toLogin(false);
  };

  private clearIntervalAll(): void {
    if (this.intervalGarden) {
      clearInterval(this.intervalGarden);
    }
    if (this.intervalClass) {
      clearInterval(this.intervalClass);
    }
  }

  private autoSelectClass(): void {
    const { classList } = this.state;
    const index = classList.findIndex(item => (item.signedInNum || 0) !== (item.totalNum || 0));
    if (index >= 0) {
      this.setState({ currentClass: index });
    }
  }

  private async getGardenInfo(): Promise<void> {
    const userInfo = await StorageUtils.retrieveData<Record<string, any>>('loginInfo');
    const data = await HttpUtils.getRequest<GardenInfo>('mobileSign/getGardenSignInfo');
    if (!data) {
      return;
    }
    let classList = data.classList ?? [];
    if (userInfo?.ownClass) {
      classList = classList.filter(classItem => classItem.id === userInfo.ownClass);
      if (classList.length > 0) {
        const classInfo = classList[0];
        data.totalNum = classInfo.totalNum;
        data.signedInNum = classInfo.signedInNum;
        data.leaveNum = this.classLeaveNum;
      }
    }
    this.setState({ data, classList });
  }

  private async getClassInfo(): Promise<void> {
    const { classList, currentClass } = this.state;
    if (!classList.length) {
      return;
    }
    const selectedClass = classList[currentClass];
    if (!selectedClass) {
      return;
    }
    const params = { classId: selectedClass.id };
    const data = await HttpUtils.getRequest<Record<string, any>>('mobileSign/getClassSignInfo', params);
    if (!data) {
      return;
    }
    const signInList: StudentItem[] = data.signInStudentList || [];
    const signOutList: StudentItem[] = data.signOutStudentList || [];
    this.classLeaveNum = 0;
    [...signInList, ...signOutList].forEach(item => {
      if (item.leave) {
        this.classLeaveNum += 1;
      }
    });
    this.setState({ signInList, signOutList });
  }

  private toLogin(showDialog: boolean): void {
    if (showDialog) {
      this.msgModalRef.current?.show({
        showType: 5,
        content: '确定退出登录吗？ ',
        contentEn: 'Log out or not？',
      });
      return;
    }
    this.clearIntervalAll();
    StorageUtils.storeData('token', null);
    this.props.navigation.replace('Login');
  }

  private checkClass(index: number): void {
    this.setState({ currentClass: index }, () => this.getClassInfo());
  }

  private async sign(payload: { studentInfo: StudentItem; signType: number }): Promise<void> {
    const { signType, studentInfo } = payload;
    const params = {
      signType,
      studentId: studentInfo.studentId,
      mode: this.state.mode,
    };
    const response = await HttpUtils.postRequrst('mobileSign/padSign', params, true);
    if (response && (response as any).code === SUCCESS_CODE) {
      ToastUtils.show(
        signType === 0
          ? '签到成功。 Welcome! Have a nice day'
          : '签出成功。 See you, my friend! Have a great evening!',
        ToastType.SUCCESS,
      );
      this.getClassInfo();
      this.getGardenInfo();
    }
  }

  private verifyPin(item: StudentItem, type: number): void {
    const { classList, currentClass } = this.state;
    const className = classList[currentClass]?.className;
    const payload: PinModalPayload = { ...item, className, type, studentId: item.studentId };
    this.pinModalRef.current?.show(payload, PIN_TYPE.VERIFY);
  }

  private msgCommit(item: MsgModalPayload): void {
    switch (item.showType) {
      case 1:
        break;
      case 4:
        if (item.item) {
          this.verifyPin(item.item as StudentItem, item.signType ?? 0);
        }
        break;
      case 2:
        this.pinModalRef.current?.show({ studentId: item.studentId }, PIN_TYPE.SET);
        break;
      case 3:
        this.checkModeVerify(0);
        break;
      case 5:
        this.toLogin(false);
        break;
      default:
        break;
    }
  }

  private verifyCommit = (studentInfo: PinModalPayload) => {
    const { type, ...rest } = studentInfo;
    const target = rest as StudentItem;
    this.signModalRef.current?.show(target, type ?? 0);
  };

  private checkMode(): void {
    if (this.state.mode === 0) {
      this.auditModalRef.current?.show();
    } else {
      this.msgModalRef.current?.show({
        showType: 3,
        content: '确定退出补签模式么？',
        single: false,
      });
    }
  }

  private checkModeVerify(mode: number): void {
    this.setState({ mode });
  }

  private toSign(item: StudentItem, type: number): void {
    if (this.state.mode === 1) {
      const className = this.state.classList[this.state.currentClass]?.className;
      this.signModalRef.current?.show({ ...item, className }, type);
      return;
    }
    if (item.dayLeave && type === 0) {
      this.msgModalRef.current?.show({
        showType: 1,
        content: '该学生今日请假，如需签到请先撤回请假信息。 ',
        contentEn: "You've asked for leave today. Please withdraw the leave request before signing in.",
        confirmText: '确认退出Confirm and exit',
        single: true,
      });
      return;
    }
    if (item.leave && type === 0) {
      this.msgModalRef.current?.show({
        showType: 4,
        signType: type,
        item,
        content: '该时间段已请假，是否继续签到？',
        contentEn: 'You asked for leave today.\n Are you sure to continue to Sign In?',
        confirmText: '是，继续签到 \nYes, continue to Sign in',
        cacelText: '否，退出签到 \nNo, exit',
      });
      return;
    }
    if (item.setPIN) {
      this.verifyPin(item, type);
    } else {
      if (item.resetTag) {
        this.msgModalRef.current?.show({
          showType: 2,
          studentId: item.studentId,
          content: '您的PIN码已清除重置，请重新设置PIN码。',
          contentEn: 'Your PIN is cleared. Enter a new PIN to identify yourself.',
        });
      } else {
        this.msgModalRef.current?.show({
          showType: 2,
          studentId: item.studentId,
          content: '首次签到，请设置PIN码。',
          contentEn: 'Please create your login PIN number.',
        });
      }
    }
  }

  private renderModal(): React.ReactNode {
    return (
      <View>
        <SignModal ref={this.signModalRef} commit={({ studentInfo, signType }) => this.sign({ studentInfo: studentInfo as StudentItem, signType })} />
        <MsgModal ref={this.msgModalRef} commit={payload => this.msgCommit(payload)} />
        <PinModal ref={this.pinModalRef} setCommit={() => this.getClassInfo()} verifyCommit={params => this.verifyCommit(params)} />
        <AuditModal ref={this.auditModalRef} commit={() => this.checkModeVerify(1)} />
      </View>
    );
  }

  private renderChildView = (item: StudentItem, type: number) => {
    const imageSource = item.avatar
      ? { uri: item.avatar }
      : require('../res/img/buqian-touxiang.png');
    return (
      <TouchableOpacity onPress={() => this.toSign(item, type)} key={item.studentId}>
        <ImageBackground style={[styles.studentCard, item.leave && styles.studentLeave]} source={imageSource}>
          {item.applySign && <Image style={styles.tagIcon} source={require('../res/img/bu.png')} />}
          {item.leave && <Image style={styles.tagIcon} source={require('../res/img/jia.png')} />}
          <View style={styles.childBottom}>
            <Text numberOfLines={1} style={styles.childName}>
              {item.name}
            </Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  render(): React.ReactNode {
    const { gardenName, leaveNum, signedInNum, totalNum } = this.state.data;
    return (
      <View style={styles.content}>
        {this.renderModal()}
        <View style={styles.titleBar}>
          <StatusBar barStyle="light-content" />
          <TouchableOpacity onPress={() => this.toLogin(true)}>
            <Image style={styles.logo} source={require('../res/img/krklogo.png')} />
          </TouchableOpacity>
          <Text style={styles.title}>{gardenName || ''}</Text>
          <View style={styles.barRight}>
            <TouchableOpacity onPress={() => this.checkMode()}>
              <Text style={styles.rightBtn}>{this.state.mode === 0 ? '补签' : '完成'}</Text>
            </TouchableOpacity>
            <View style={styles.rightStat}>
              <Text style={styles.statValue}>{totalNum || 0}</Text>
              <Text style={styles.statLabel}>TOTAL</Text>
            </View>
            <View style={styles.rightStat}>
              <Text style={styles.statValue}>{leaveNum || 0}</Text>
              <Text style={styles.statLabel}>LEAVE</Text>
            </View>
            <View style={styles.rightStat}>
              <Text style={styles.statValue}>{signedInNum || 0}</Text>
              <Text style={styles.statLabel}>IN</Text>
            </View>
          </View>
        </View>
        <FlatList
          style={styles.classList}
          horizontal
          data={this.state.classList}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => this.checkClass(index)}>
              <View style={[styles.classInfo, index === this.state.currentClass && styles.classInfoSelected]}>
                <Text style={[styles.className, index === this.state.currentClass && styles.classTextSelected]}>
                  {item.className}
                </Text>
                <Text style={[styles.classData, index === this.state.currentClass && styles.classTextSelected]}>
                  {item.signedInNum || 0}/{item.totalNum || 0}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
        <View style={styles.signHeader}>
          <Text style={styles.signTitle}>IN</Text>
          <Text style={styles.signTitle}>OUT</Text>
        </View>
        <View style={styles.signContainer}>
          <ScrollView>
            <View style={styles.studentList}>{this.state.signInList.map(item => this.renderChildView(item, 1))}</View>
          </ScrollView>
          <View style={styles.divider} />
          <ScrollView>
            <View style={styles.studentList}>{this.state.signOutList.map(item => this.renderChildView(item, 0))}</View>
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: color_white,
  },
  titleBar: {
    paddingTop: rm(15),
    backgroundColor: color_main,
    width: rm(1024),
    height: rm(105),
    paddingHorizontal: rm(18),
    flexDirection: 'row',
    alignItems: 'center',
  },
  barRight: {
    flexGrow: 1,
    alignItems: 'center',
    flexDirection: 'row-reverse',
  },
  logo: {
    width: rm(64),
    height: rm(64),
  },
  title: {
    fontSize: rm(24),
    color: color_white,
    marginLeft: rm(14),
  },
  rightBtn: {
    fontSize: rm(28),
    color: color_white,
    marginRight: rm(14),
  },
  rightStat: {
    alignItems: 'center',
    marginRight: rm(60),
  },
  statLabel: {
    fontSize: rm(12),
    color: color_white,
  },
  statValue: {
    fontSize: rm(32),
    color: color_white,
    fontWeight: '500',
  },
  classList: {
    width: rm(1024),
    maxHeight: rm(75),
    marginLeft: rm(2),
  },
  classInfo: {
    width: rm(124),
    height: rm(68),
    backgroundColor: color_white,
    shadowColor: color_c4c4c4,
    shadowOffset: { height: rm(2), width: rm(2) },
    shadowRadius: rm(3),
    shadowOpacity: 0.6,
    marginTop: rm(2),
    marginRight: rm(5),
  },
  classInfoSelected: {
    backgroundColor: color_main,
  },
  className: {
    fontSize: rm(20),
    color: color_main_text,
    alignSelf: 'center',
    marginTop: rm(25),
  },
  classTextSelected: {
    color: color_white,
  },
  classData: {
    fontSize: rm(12),
    color: color_999,
    alignSelf: 'flex-end',
    fontWeight: '600',
    marginRight: rm(5),
  },
  signHeader: {
    maxHeight: rm(65),
    flexDirection: 'row',
    alignItems: 'center',
  },
  signTitle: {
    flexGrow: 1,
    fontSize: rm(20),
    color: color_main_text,
    marginLeft: rm(20),
  },
  signContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  studentList: {
    width: rm(510),
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: rm(6),
  },
  divider: {
    backgroundColor: '#dfdfdf',
    width: rm(1),
    height: rm(541),
  },
  studentCard: {
    width: rm(120),
    height: rm(120),
    marginTop: rm(6),
    marginRight: rm(6),
    backgroundColor: color_white,
    shadowColor: color_c4c4c4,
    shadowOffset: { height: rm(2), width: rm(2) },
    shadowRadius: rm(3),
    shadowOpacity: 0.6,
  },
  studentLeave: {
    opacity: 0.5,
  },
  childBottom: {
    backgroundColor: '#FFFFFF90',
    width: rm(120),
    position: 'absolute',
    bottom: 0,
  },
  childName: {
    width: rm(100),
    lineHeight: rm(25),
    marginLeft: rm(12),
    fontSize: rm(12),
    color: color_main,
    includeFontPadding: false,
  },
  tagIcon: {
    width: rm(30),
    height: rm(30),
    position: 'absolute',
    top: rm(6),
    right: rm(6),
  },
});
