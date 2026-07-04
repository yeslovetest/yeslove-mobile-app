import { TextInput } from "react-native";
import styles from "./InputStyles";
import { theme } from "@/app/theme";

interface Props {
  placeholder: string;
  keyboardType?:
    | "default"
    | "numeric"
    | "email-address"
    | "phone-pad"
    | "number-pad"
    | "decimal-pad"
    | "url"
    | "numbers-and-punctuation";
  borderColor?: string;
  borderBottomColor?: string;
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  onChangeText?: (text: string) => void;
}

const Input = (props: Props) => {
  const placeholder = props?.placeholder ?? "";
  const keyboardType = props?.keyboardType ?? "default";
  const borderColor = props?.borderColor ?? theme.colors.border;
  const borderBottomColor = props?.borderBottomColor ?? theme.colors.primary;
  const placeholderTextColor = props?.placeholderTextColor ?? theme.colors.textMuted;
  const secureTextEntry = props?.secureTextEntry ?? false;
  const onChangeText = props?.onChangeText ?? (() => {});

  return (
    <TextInput
      style={{ ...styles.input, borderColor: borderColor, borderBottomColor: borderBottomColor }}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      keyboardType={keyboardType}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
  );
};

export default Input;
