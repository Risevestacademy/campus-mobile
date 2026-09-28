import { ScrollView, View } from "react-native";

import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { Divider } from "./Divider";
import { Pill } from "./Pill";
import { StatusDot } from "./StatusDot";
import { Text } from "./Text";
import { TextField } from "./TextField";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="gap-0.5">
        <Text className="font-h4 text-h4 text-text-primary">{title}</Text>
        {Boolean(subtitle) && (
          <Text className="font-body-sm text-body-sm text-text-muted">
            {subtitle}
          </Text>
        )}
      </View>
      <View className="gap-4 rounded-2xl border border-border-subtle bg-bg-surface p-4 shadow-sm">
        {children}
      </View>
    </View>
  );
}

export function AtomsPreview() {
  return (
    <ScrollView
      className="flex-1 bg-bg-canvas"
      contentContainerClassName="px-4 pt-safe pb-12 gap-6"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="gap-1 pt-4 pb-2">
        <Text className="font-display text-display text-text-brand">
          Campus Design System
        </Text>
        <Text className="font-body-md text-body-md text-text-secondary">
          Atomic components preview & design system showcase
        </Text>
      </View>

      <Divider />

      <Section
        title="Typography"
        subtitle="Standard font family, font size, and text tokens"
      >
        <View className="gap-2">
          <Text className="font-display text-display">Display Text</Text>
          <Text className="font-h1 text-h1">Heading 1</Text>
          <Text className="font-h2 text-h2">Heading 2</Text>
          <Text className="font-h3 text-h3">Heading 3</Text>
          <Text className="font-h4 text-h4">Heading 4</Text>
          <Text className="font-h5 text-h5">Heading 5</Text>
          <Text className="font-h6 text-h6">Heading 6</Text>
          <Text className="font-body-lg text-body-lg text-text-secondary">
            Body Large: Instrument Sans Regular 18px text content
          </Text>
          <Text className="font-body-md text-body-md text-text-secondary">
            Body Medium: Instrument Sans Regular 16px text content
          </Text>
          <Text className="font-body-sm text-body-sm text-text-secondary">
            Body Small: Instrument Sans Regular 14px text content
          </Text>
          <Text className="font-caption text-caption text-text-muted">
            Caption: Instrument Sans 12px muted text content
          </Text>
          <Text className="font-label text-label text-text-primary">
            Label: Instrument Sans Medium 14px text content
          </Text>
          <Text className="font-overline text-overline text-text-brand">
            Overline: Instrument Sans SemiBold 11px text content
          </Text>
        </View>
      </Section>

      <Section
        title="Avatars"
        subtitle="User profile avatars with fallbacks, initials, and images"
      >
        <View className="flex-row items-center gap-4">
          <View className="items-center gap-1.5">
            <Avatar size={48} />
            <Text className="font-caption text-caption text-text-muted">
              Default
            </Text>
          </View>
          <View className="items-center gap-1.5">
            <Avatar size={48} placeholder="AO" />
            <Text className="font-caption text-caption text-text-muted">
              Initials
            </Text>
          </View>
          <View className="items-center gap-1.5">
            <Avatar size={48} imageUrl="https://picsum.photos/200" />
            <Text className="font-caption text-caption text-text-muted">
              Image
            </Text>
          </View>
        </View>
      </Section>

      <Section
        title="Buttons"
        subtitle="Primary, secondary (outlined), and tertiary (ghost) variants with sizes and disabled states"
      >
        <View className="gap-4">
          <View className="gap-2">
            <Text className="font-label text-label text-text-muted">
              Primary Variant
            </Text>
            <View className="flex-row flex-wrap items-center gap-3">
              <Button variant="primary" size="sm" label="Small" />
              <Button variant="primary" size="md" label="Medium" />
              <Button variant="primary" size="lg" label="Large" />
              <Button variant="primary" disabled label="Disabled" />
            </View>
          </View>

          <Divider />

          <View className="gap-2">
            <Text className="font-label text-label text-text-muted">
              Secondary Variant (Outlined)
            </Text>
            <View className="flex-row flex-wrap items-center gap-3">
              <Button variant="secondary" size="sm" label="Small" />
              <Button variant="secondary" size="md" label="Medium" />
              <Button variant="secondary" size="lg" label="Large" />
              <Button variant="secondary" disabled label="Disabled" />
            </View>
          </View>

          <Divider />

          <View className="gap-2">
            <Text className="font-label text-label text-text-muted">
              Tertiary Variant (Ghost)
            </Text>
            <View className="flex-row flex-wrap items-center gap-3">
              <Button variant="tertiary" size="sm" label="Small" />
              <Button variant="tertiary" size="md" label="Medium" />
              <Button variant="tertiary" size="lg" label="Large" />
              <Button variant="tertiary" disabled label="Disabled" />
            </View>
          </View>
        </View>
      </Section>

      <Section
        title="Status Dots"
        subtitle="Status indicators for user online presence"
      >
        <View className="flex-row flex-wrap items-center gap-6">
          <View className="flex-row items-center gap-2">
            <StatusDot status="online" />
            <Text className="font-body-sm text-body-sm text-text-primary">
              Online
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <StatusDot status="away" />
            <Text className="font-body-sm text-body-sm text-text-primary">
              Away
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <StatusDot status="busy" />
            <Text className="font-body-sm text-body-sm text-text-primary">
              Busy
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <StatusDot status="offline" />
            <Text className="font-body-sm text-body-sm text-text-primary">
              Offline
            </Text>
          </View>
        </View>
      </Section>

      <Section
        title="Pills / Badges"
        subtitle="Categorized pills by color intent, size, and solid/subtle style variants"
      >
        <View className="gap-3">
          {/* Neutral */}
          <View className="gap-1.5">
            <Text className="font-caption text-caption text-text-muted">
              Neutral
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Pill
                label="Solid SM"
                color="neutral"
                variant="solid"
                size="sm"
              />
              <Pill
                label="Solid LG"
                color="neutral"
                variant="solid"
                size="lg"
              />
              <Pill
                label="Subtle SM"
                color="neutral"
                variant="subtle"
                size="sm"
              />
              <Pill
                label="Subtle LG"
                color="neutral"
                variant="subtle"
                size="lg"
              />
            </View>
          </View>

          <View className="gap-1.5">
            <Text className="font-caption text-caption text-text-muted">
              Brand
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Pill label="Solid SM" color="brand" variant="solid" size="sm" />
              <Pill label="Solid LG" color="brand" variant="solid" size="lg" />
              <Pill
                label="Subtle SM"
                color="brand"
                variant="subtle"
                size="sm"
              />
              <Pill
                label="Subtle LG"
                color="brand"
                variant="subtle"
                size="lg"
              />
            </View>
          </View>

          {/* Success */}
          <View className="gap-1.5">
            <Text className="font-caption text-caption text-text-muted">
              Success
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Pill
                label="Solid SM"
                color="success"
                variant="solid"
                size="sm"
              />
              <Pill
                label="Solid LG"
                color="success"
                variant="solid"
                size="lg"
              />
              <Pill
                label="Subtle SM"
                color="success"
                variant="subtle"
                size="sm"
              />
              <Pill
                label="Subtle LG"
                color="success"
                variant="subtle"
                size="lg"
              />
            </View>
          </View>

          {/* Warning */}
          <View className="gap-1.5">
            <Text className="font-caption text-caption text-text-muted">
              Warning
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Pill
                label="Solid SM"
                color="warning"
                variant="solid"
                size="sm"
              />
              <Pill
                label="Solid LG"
                color="warning"
                variant="solid"
                size="lg"
              />
              <Pill
                label="Subtle SM"
                color="warning"
                variant="subtle"
                size="sm"
              />
              <Pill
                label="Subtle LG"
                color="warning"
                variant="subtle"
                size="lg"
              />
            </View>
          </View>

          <View className="gap-1.5">
            <Text className="font-caption text-caption text-text-muted">
              Error
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Pill label="Solid SM" color="error" variant="solid" size="sm" />
              <Pill label="Solid LG" color="error" variant="solid" size="lg" />
              <Pill
                label="Subtle SM"
                color="error"
                variant="subtle"
                size="sm"
              />
              <Pill
                label="Subtle LG"
                color="error"
                variant="subtle"
                size="lg"
              />
            </View>
          </View>

          <View className="gap-1.5">
            <Text className="font-caption text-caption text-text-muted">
              Info
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Pill label="Solid SM" color="info" variant="solid" size="sm" />
              <Pill label="Solid LG" color="info" variant="solid" size="lg" />
              <Pill label="Subtle SM" color="info" variant="subtle" size="sm" />
              <Pill label="Subtle LG" color="info" variant="subtle" size="lg" />
            </View>
          </View>
        </View>
      </Section>

      <Section
        title="Text Fields"
        subtitle="Form input fields supporting labels, prefixes, suffixes, error states, select dropdowns, and multiline inputs"
      >
        <View className="gap-4">
          <TextField
            label="Email Address"
            placeholder="enter your email"
            helper="We'll send your confirmation code here"
          />
          <TextField
            label="Password"
            placeholder="enter password"
            error="Password must be at least 8 characters"
          />
          <TextField
            label="Department"
            placeholder="Select department..."
            select
          />
          <TextField
            label="Amount"
            prefix="$"
            suffix="USD"
            placeholder="0.00"
          />
          <TextField label="Username" value="ayobami" disabled />
          <TextField
            label="Bio"
            placeholder="Tell us about yourself..."
            inputClassName="h-20"
            multiline
          />
        </View>
      </Section>

      <Section title="Dividers" subtitle="Horizontal content dividers">
        <View className="gap-3">
          <Text className="font-body-sm text-body-sm text-text-secondary">
            Content above divider
          </Text>
          <Divider />
          <Text className="font-body-sm text-body-sm text-text-secondary">
            Content below divider
          </Text>
        </View>
      </Section>
    </ScrollView>
  );
}
