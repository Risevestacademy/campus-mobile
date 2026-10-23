import { Card, Row, Text } from "@shared/components/atoms";
import { capitalize } from "@shared/helpers";
import { Clock, Code, FileText, Link, PenTool, Pin } from "lucide-react-native";
import { ComponentProps } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";

const StyledPenTool = withUniwind(PenTool);
const StyledCode = withUniwind(Code);
const StyledLink = withUniwind(Link);
const StyledFileText = withUniwind(FileText);
const StyledClock = withUniwind(Clock);
const StyledPin = withUniwind(Pin);

type ProjectLinkType = "design" | "repo" | "demo" | "docs";

type ProjectLink = {
  link: string;
  type: ProjectLinkType;
};

type Project = {
  title: string;
  description: string;
  statusText: string;
  links: ProjectLink[];
  isPinned: boolean;
};

type IconType = ComponentProps<typeof StyledLink> & {
  linkType?: ProjectLinkType;
};

type ProfilePinnedProjectProp = {
  project: Pick<Project, "links" | "title" | "statusText">;
};

function LinkToIcon({ linkType, ...props }: IconType) {
  switch (linkType) {
    case "demo":
      return <StyledLink {...props} />;
    case "repo":
      return <StyledCode {...props} />;
    case "design":
      return <StyledPenTool {...props} />;
    case "docs":
      return <StyledFileText {...props} />;
  }
  return <StyledLink {...props} />;
}

export function ProfilePinnedProject({ project }: ProfilePinnedProjectProp) {
  const firstLink = project.links.at(0);
  return (
    <Card className="border border-border-focus">
      <Row>
        <View className="size-8 items-center justify-center rounded-[8px] bg-bg-tint-violet">
          <LinkToIcon
            linkType={firstLink?.type}
            size={16}
            colorClassName="accent-text-violet"
          />
        </View>
        <Text variant="label" className="flex-1">
          {project.title}
        </Text>
        <StyledPin colorClassName="accent-text-brand" size={15} />
      </Row>
      <Row gap="xs" className="rounded-[8px] bg-bg-raised-cool px-2 py-1">
        <StyledClock size={13} colorClassName="accent-text-muted" />
        <Text variant="caption">{project.statusText}</Text>
      </Row>
      <Row>
        {project.links.map((e, i) => (
          <Row
            key={i}
            gap="xs"
            className="rounded-full bg-bg-raised-cool px-2 py-1"
          >
            <LinkToIcon
              linkType={e.type}
              size={12}
              colorClassName="accent-text-primary"
            />
            <Text variant="label">{capitalize(e.type)}</Text>
          </Row>
        ))}
      </Row>
    </Card>
  );
}
