import { CampusHeaderBar, CampusHeaderHero } from "@features/campus/components";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { type SharedValue, useReducedMotion } from "react-native-reanimated";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("../../../src/feature/campus/components/LiveMeeting", () => ({
  LiveMeeting: () => null,
}));

jest.mock("@shared/hooks/useMe", () => ({
  useMe: () => ({
    data: {
      user: { firstName: "Ada", displayName: "Ada L.", avatarUrl: null },
    },
    isLoading: false,
  }),
}));

const shared = (value: number) => ({ value }) as SharedValue<number>;
const hidden = { includeHiddenElements: true };

function renderBar(
  props: Partial<React.ComponentProps<typeof CampusHeaderBar>> = {},
) {
  return render(
    <CampusHeaderBar
      status="available"
      noOfParticipants={12}
      location="library"
      scrollY={shared(0)}
      summaryY={shared(0)}
      progress={shared(0)}
      collapsed={false}
      {...props}
    />,
  );
}

describe("CampusHeaderBar", () => {
  it("offers search and chat while expanded", async () => {
    await renderBar();

    const actions = screen.getByTestId("campus-header-actions");
    expect(actions.props.pointerEvents).toBe("auto");
    expect(screen.queryByLabelText("12 people on campus")).toBeNull();
  });

  it("shows the person icon count and location once collapsed", async () => {
    await renderBar({ collapsed: true });

    const actions = screen.getByTestId("campus-header-actions", hidden);
    expect(actions.props.pointerEvents).toBe("none");
    expect(actions.props.accessibilityElementsHidden).toBe(true);

    expect(screen.getByLabelText("12 people on campus")).toBeTruthy();
    expect(screen.getByText("library")).toBeTruthy();
  });

  it("shows the location key exactly as received", async () => {
    await renderBar({ collapsed: true, location: "_default" });

    expect(screen.getByText("_default")).toBeTruthy();
  });

  it("leaves out the location when there is none", async () => {
    await renderBar({ collapsed: true, location: undefined });

    expect(screen.getByLabelText("12 people on campus")).toBeTruthy();
    expect(screen.queryByText("library", hidden)).toBeNull();
  });
});

describe("CampusHeaderHero", () => {
  it("shows the count and location on the page", async () => {
    await render(
      <CampusHeaderHero
        noOfParticipants={1}
        location="library"
        progress={shared(0)}
      />,
    );

    expect(screen.getByText("1 person on campus now")).toBeTruthy();
    expect(screen.getByText("You’re at library")).toBeTruthy();
  });

  it("keeps the page's count, with its skeleton, while loading even mid-scroll", async () => {
    await render(<CampusHeaderHero progress={shared(0.5)} />);

    expect(screen.getByText("0 people on campus now")).toBeTruthy();
    expect(screen.getByTestId("campus-header-summary").props.style).toEqual(
      expect.objectContaining({ opacity: 1 }),
    );
  });

  describe("with Reduce Motion on", () => {
    beforeEach(() => {
      jest.mocked(useReducedMotion).mockReturnValue(true);
    });

    afterEach(() => {
      jest.mocked(useReducedMotion).mockReturnValue(false);
    });

    // The mock's `interpolate` returns undefined, so this checks the hand-off
    // doesn't happen rather than the exact fade.
    it("keeps the page's count instead of handing it to the bar", async () => {
      await render(
        <CampusHeaderHero noOfParticipants={12} progress={shared(0.25)} />,
      );

      const { style } = screen.getByTestId("campus-header-summary").props;
      expect(style.opacity).not.toBe(0);
    });
  });

  it("hands the count to the bar as soon as the page scrolls", async () => {
    await render(
      <CampusHeaderHero noOfParticipants={12} progress={shared(0.25)} />,
    );

    expect(screen.getByTestId("campus-header-summary").props.style).toEqual(
      expect.objectContaining({ opacity: 0 }),
    );
  });
});
