import { Skeleton as MotiSkeleton } from "moti/skeleton";
import { useUniwind, withUniwind } from "uniwind";

const StyledShimmer = withUniwind(MotiSkeleton);

type SkeletonProps = {
  children: React.ReactElement; // must be a single element
  width?: number;
  height?: number;
  radius?: number | "round" | "square";
  isLoading?: boolean;
};

export function Skeleton({
  children,
  width,
  height,
  radius = 16,
  isLoading = false,
}: SkeletonProps) {
  const { theme } = useUniwind();
  return (
    <StyledShimmer
      show={isLoading}
      colorMode={theme === "dark" ? "dark" : "light"}
      backgroundColorClassName="accent-bg-ink-soft"
      width={width}
      height={height}
      radius={radius}
      transition={{ type: "timing", duration: 200 }}
    >
      {children}
    </StyledShimmer>
  );
}

export const SkeletonGroup = MotiSkeleton.Group;
