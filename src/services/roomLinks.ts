import { client } from "@core/api";
import { unwrap } from "@core/api/error";
import { components } from "@core/api/generated/schema";

export type RoomLinkEntry = components["schemas"]["RoomLinkEntryDto"];

export class RoomLinkService {
  /**
   * Follows a room link. While its event is on, this lets you into the space
   * (`admitted`). Walk there with world's `goToSpace` either way: a closed
   * door can still be asked.
   */
  static async enter(code: string): Promise<RoomLinkEntry> {
    return unwrap<RoomLinkEntry>(
      client.POST("/v1/room-links/{code}/enter", {
        params: { path: { code } },
      }),
    );
  }
}
