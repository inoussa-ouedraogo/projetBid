import Svg, { Path, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export const WalletIcon = ({ size = 32, color = '#34D399' }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Rect x="8" y="14" width="48" height="36" rx="10" stroke={color} strokeWidth="4" />
    <Path
      d="M56 30H42C38.6863 30 36 32.6863 36 36C36 39.3137 38.6863 42 42 42H56V30Z"
      stroke={color}
      strokeWidth="4"
    />
    <Path
      d="M44 36H44.02"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </Svg>
);

