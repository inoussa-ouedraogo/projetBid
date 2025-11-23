import Svg, { Path, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export const GavelIcon = ({ size = 32, color = '#FACC15' }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Rect
      x="6"
      y="46"
      width="36"
      height="8"
      rx="4"
      transform="rotate(-45 6 46)"
      stroke={color}
      strokeWidth="4"
    />
    <Path
      d="M29 15L43 29M35 9L49 23"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
    />
    <Path
      d="M10 54H50"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </Svg>
);

