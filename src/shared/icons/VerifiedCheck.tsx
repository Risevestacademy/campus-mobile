import Svg, { G, Rect, type SvgProps } from "react-native-svg";

/**
 * Blue check badge. The design's drop shadow is not baked in here (SVG filters
 * are unreliable in react-native-svg); apply it on a wrapping View instead.
 */
export default function VerifiedCheck({
  width = 120,
  height = 120,
  ...props
}: SvgProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 120 120"
      fill="none"
      {...props}
    >
      <G transform="translate(-24 -16)">
        <Rect x={24} y={16} width={120} height={120} rx={60} fill="#3155D6" />
        <Rect
          x={65.9104}
          y={70.543}
          width={25.0756}
          height={8.35853}
          rx={3}
          rotation={45}
          origin="65.9104, 70.543"
          fill="white"
        />
        <Rect
          x={72.5403}
          y={87.5527}
          width={41.7927}
          height={8.35853}
          rx={3}
          rotation={-45}
          origin="72.5403, 87.5527"
          fill="white"
        />
      </G>
    </Svg>
  );
}
