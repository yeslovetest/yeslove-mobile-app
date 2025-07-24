import { TextInput } from 'react-native';
import styles from "../../Styles/page-styles/InputStyles";
import theme from '@/Styles/Variables';

 interface Props {
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'url' | 'numbers-and-punctuation';
    borderColor?: string;
    borderBottomColor?: string;
    secureTextEntry?: boolean;
    onChangeText?: (text: string) => void;
  }

const Input = (props: Props) => {
  const placeholder = props?.placeholder ?? '';
  const keyboardType = props?.keyboardType ?? 'default';
  const borderColor = props?.borderColor ?? '#ccc';
  const borderBottomColor = props?.borderBottomColor ?? theme.colors.primaryBlue;
  const secureTextEntry = props?.secureTextEntry ?? false;
  const onChangeText = props?.onChangeText ?? (() => {});

 

  return (
    <TextInput
        style={{...styles.input, borderColor: borderColor, borderBottomColor: borderBottomColor}}
        placeholder={placeholder}
        keyboardType= {keyboardType}
        onChangeText={onChangeText}
        secureTextEntry = {secureTextEntry}
    />
  )
}

export default Input;