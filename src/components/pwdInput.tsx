import React from 'react';
import {
  InteractionManager,
  StyleProp,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  View,
  ViewStyle,
} from 'react-native';
import { rm } from '../utils/ScreenUtils';
import { color_white } from '../res/color';

interface PasswordProps {
  maxLength: number;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  onChange?: (value: string) => void;
  onEnd?: (value: string) => void;
}

interface PasswordState {
  text: string;
}

export default class Password extends React.Component<PasswordProps, PasswordState> {
  static defaultProps: Pick<PasswordProps, 'autoFocus' | 'onChange' | 'onEnd'> = {
    autoFocus: true,
    onChange: () => undefined,
    onEnd: () => undefined,
  };

  state: PasswordState = {
    text: '',
  };

  private textInputRef = React.createRef<TextInput>();

  componentDidMount(): void {
    if (this.props.autoFocus) {
      InteractionManager.runAfterInteractions(() => {
        this.focus();
      });
    }
  }

  clear(): void {
    this.setState({ text: '' });
    this.textInputRef.current?.clear();
  }

  focus(): void {
    this.textInputRef.current?.focus();
  }

  private handleChange = (text: string) => {
    const { maxLength, onChange, onEnd } = this.props;
    this.setState({ text });
    onChange?.(text);
    if (text.length === maxLength) {
      onEnd?.(text);
    }
  };

  private renderInputDots(): React.ReactNode {
    const { maxLength } = this.props;
    const { text } = this.state;
    return Array.from({ length: maxLength }).map((_, index) => (
      <View key={index} style={[styles.inputItem, styles.inputItemStyle]}>
        {index < text.length && <View style={styles.iconStyle} />}
      </View>
    ));
  }

  render(): React.ReactNode {
    return (
      <TouchableHighlight onPress={() => this.focus()} activeOpacity={1} underlayColor="transparent">
        <View style={[styles.container, this.props.style]}>
          <TextInput
            ref={this.textInputRef}
            style={styles.hiddenInput}
            maxLength={this.props.maxLength}
            autoFocus={false}
            keyboardType="number-pad"
            value={this.state.text}
            onChangeText={this.handleChange}
          />
          {this.renderInputDots()}
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: rm(19),
  },
  hiddenInput: {
    height: rm(50),
    zIndex: 99,
    position: 'absolute',
    width: rm(370),
    opacity: 0,
  },
  inputItem: {
    height: rm(50),
    width: rm(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: rm(2),
  },
  inputItemStyle: {
    marginLeft: rm(7),
    marginRight: rm(7),
    backgroundColor: color_white,
    shadowColor: '#c2c2c2',
    shadowOffset: { height: rm(2), width: rm(2) },
    shadowRadius: rm(3),
    shadowOpacity: 0.6,
  },
  iconStyle: {
    width: 16,
    height: 16,
    backgroundColor: '#222',
    borderRadius: 8,
  },
});
