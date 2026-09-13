import React from "react";
import Svg, { Path } from "react-native-svg";

interface PersonTabIconProps {
  size?: number;
  color: string;
  focused?: boolean;
}

export const PersonTabIcon: React.FC<PersonTabIconProps> = ({
  size = 22,
  color,
  focused = false,
}) => {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M332.64 64.58C313.18 43.57 286 32 256 32c-30.16 0-57.43 11.5-76.8 32.38-19.58 21.11-29.12 49.8-26.88 80.78C156.76 206.28 203.27 256 256 256s99.16-49.71 103.67-110.82c2.27-30.7-7.33-59.33-27.03-80.6zM432 480H80a31 31 0 01-24.2-11.13c-6.5-7.77-9.12-18.38-7.18-29.11C57.06 392.94 83.4 353.61 124.8 326c36.78-24.51 83.37-38 131.2-38s94.42 13.5 131.2 38c41.4 27.6 67.74 66.93 76.18 113.75 1.94 10.73-.68 21.34-7.18 29.11A31 31 0 01432 480z"
          fill={color}
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Path
        d="M344 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={36}
      />
      <Path
        d="M256 304c-87 0-175.3 48-191.64 138.6C62.39 453.52 68.57 464 80 464h352c11.44 0 17.62-10.48 15.65-21.4C431.3 352 343 304 256 304z"
        fill="none"
        stroke={color}
        strokeMiterlimit={10}
        strokeWidth={36}
      />
    </Svg>
  );
};
