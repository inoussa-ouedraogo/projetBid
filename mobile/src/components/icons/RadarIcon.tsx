import Svg, { Circle, Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export const RadarIcon = ({ size = 32, color = '#38BDF8' }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="32" r="24" stroke={color} strokeWidth="4" />
    <Circle cx="32" cy="32" r="14" stroke={color} strokeWidth="4" />
    <Circle cx="32" cy="32" r="4" fill={color} />
    <Path d="M16 32H6" stroke={color} strokeWidth="4" strokeLinecap="round" />
    <Path d="M32 16V6" stroke={color} strokeWidth="4" strokeLinecap="round" />
    <Path d="M58 32H48" stroke={color} strokeWidth="4" strokeLinecap="round" />
    <Path d="M32 58V48" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </Svg>
);

