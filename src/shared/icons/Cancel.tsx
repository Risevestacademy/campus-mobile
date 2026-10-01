import Svg, { Path } from "react-native-svg";

export default function Cancel() {
  return (
    <Svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      //   xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M24 8L8 24"
        stroke="#B1252C"
        strokeWidth="2.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 8L24 24"
        stroke="#B1252C"
        strokeWidth="2.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
