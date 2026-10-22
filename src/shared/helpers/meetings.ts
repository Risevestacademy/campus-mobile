export function formatParticipantPresentation(
  participants: string[] | string,
): string {
  if (typeof participants === "string") return participants;

  switch (participants.length) {
    case 0:
      return "";
    case 1:
      return participants[0] ?? "";
    case 2:
      return participants.join(" & ");
    default:
      const last = participants[participants.length - 1];
      return `${participants.slice(0, participants.length - 1).join(", ")} & ${last}`;
  }
}
