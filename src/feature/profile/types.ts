import { components } from "@core/api/generated/schema";

export type ProfileSchema = components["schemas"]["OwnProfileDto"];

export type MemberProfileSchema = components["schemas"]["ProfileCardDto"];

export type UpdateProfileSchema = components["schemas"]["UpdateProfileDto"];

/** Editable profile values, with nulls from the API normalised to "". */
export type ProfileFields = {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  bio: string;
};

export type ProfileField = keyof ProfileFields;

export type ProjectLinkType = "design" | "repo" | "demo" | "docs";

export type ProjectLink = {
  link: string;
  type: ProjectLinkType;
};

export type Project = {
  title: string;
  description: string;
  statusText: string;
  links: ProjectLink[];
  isPinned: boolean;
};
