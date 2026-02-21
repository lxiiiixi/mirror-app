declare module "lucide-react-native" {
  import type { ComponentType } from "react";
  import type { ColorValue, StyleProp, ViewStyle } from "react-native";

  export interface LucideProps {
    color?: ColorValue;
    size?: number;
    strokeWidth?: number;
    style?: StyleProp<ViewStyle>;
  }

  export const Globe: ComponentType<LucideProps>;
  export const ChevronDown: ComponentType<LucideProps>;
}
