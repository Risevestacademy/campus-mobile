import {
  SpaceInfoPlaceholder,
  SpaceInfoScreen,
  useCampusSpace,
} from "@features/campus";
import { useLocalSearchParams } from "expo-router";

/** A space by its world key; live, so people and locks update in place. */
export default function SpaceIndex() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready, space } = useCampusSpace(id);

  return space ? (
    <SpaceInfoScreen space={space} />
  ) : (
    <SpaceInfoPlaceholder ready={ready} />
  );
}
