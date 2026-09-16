# Campus by Rise Mobile Architectural Plan

## Overview

Campus Mobile is the native companion to the Campus by Rise web experience.
It gives invited members a reliable way to:

- See who is active or inactive in Campus.
- See permitted availability and location information.
- Set their own availability to available, busy, or do-not-disturb.
- Discover scheduled and currently active meetings.
- Join and participate in meetings with native audio and video.
- Receive meeting reminders and open the correct meeting from a notification.

The mobile application does not render or embed the 2D campus. The web
application remains the spatial campus client.

The measurable outcomes are:

- A signed-in member can reach live and upcoming meetings without using the
  web campus.
- Presence changes received from the server appear within two seconds at p95
  under normal connectivity.
- Meeting join success is measurable separately from permission, access, and
  network failures.
- Time from an accepted join request to first remote audio is below five
  seconds at p95 on the supported reference-device network.
- Backgrounding an active meeting disables camera publication while preserving
  audio where the operating system permits.

## Product Boundary

### Included in mobile v1

- Google OAuth login for users already invited and onboarded.
- Protected application routes.
- Today view for live and upcoming meetings.
- Meeting list and meeting details.
- Native LiveKit audio/video participation.
- Campus member directory.
- Aggregated online, away, busy, DND, and offline state.
- Permitted current space or meeting location.
- Source-aware presence across web, mobile, and meeting sessions.
- Self-service availability changes.
- Push reminders and meeting deep links.
- Poor-network and offline states.

### Explicitly excluded

- 2D world rendering or a WebView containing the web campus.
- Kaplay, Skia, a game loop, movement, collision, or avatar controls.
- Proximity-based communication.
- Desk claiming or project displays.
- Invitation acceptance and first-time onboarding.
- Notice wall, resources, asynchronous chat, and project comments.
- Meeting creation, admission, moderation, broadcast speaker management, or
  other host controls.
- Admin-heavy workflows.
- Expo web as a release target.

## Platform Baseline

The application targets:

- Expo SDK 57.
- React Native 0.86.
- React 19.2.
- TypeScript 6 in strict mode.
- iOS 16.4 or newer.
- Android 7 or newer.
- Node.js 22.13 or newer for development and CI.

The repository uses Continuous Native Generation. Generated `ios/` and
`android/` directories remain uncommitted unless the team deliberately adopts
native-project ownership later.

Because LiveKit, background media, and remote notifications require native
configuration, development builds are the standard development environment.
Expo Go is limited to UI work that does not exercise those integrations.

## Technology Stack

| Technology                                        | Responsibility                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| Expo Router                                       | Typed routes, protected routes, native stacks, tabs, and deep links |
| React Native                                      | Native application UI                                               |
| TypeScript                                        | Static types and contract safety                                    |
| Uniwind and Tailwind CSS v4                       | Semantic design tokens and component styling                        |
| TanStack Query                                    | HTTP server state, caching, retries, and invalidation               |
| Zustand                                           | Minimal shared client state and normalized realtime presence        |
| openapi-fetch                                     | Type-safe HTTP transport generated from the Campus API contract     |
| openapi-typescript                                | Generated path and operation types from the OpenAPI document        |
| LiveKit React Native SDK                          | Meeting audio, video, participants, and reconnects                  |
| Expo SecureStore                                  | Refresh-token storage                                               |
| Expo AuthSession and WebBrowser                   | Google authorization-code flow with PKCE                            |
| Expo Notifications                                | Meeting reminders and notification responses                        |
| NetInfo                                           | Connectivity state and query online management                      |
| Expo Image                                        | Cached and memory-efficient remote images                           |
| FlashList                                         | Virtualized meeting and member lists                                |
| Reanimated and Gesture Handler                    | Purposeful UI transitions and gestures                              |
| PostHog adapter                                   | Product events, errors, and API correlation metadata                |
| Jest, jest-expo, and React Native Testing Library | Unit and component tests                                            |
| MSW                                               | HTTP integration tests                                              |
| Maestro                                           | Native end-to-end flows on Android and iOS builds                   |

Native packages must be installed directly in the mobile application and pinned
through the lockfile using Expo-compatible versions.

## Architectural Model

```text
src/
├── app/                 Expo Router composition only
├── core/                External systems and application infrastructure
├── design-system/       Domain-independent native UI primitives
├── features/            Product-domain modules
├── shared/              Domain-independent types and utilities
└── assets/              Images, icons, and embedded fonts
```

### Dependency direction

Allowed dependencies:

```text
app           -> features, core, design-system, shared
features      -> core, design-system, shared
core          -> shared
design-system -> shared
shared        -> no higher application layer
```

The following are prohibited:

- Feature-to-feature imports.
- Deep imports into another feature.
- `core` importing a feature.
- Shared or design-system code importing a Campus domain.
- Route files performing API, realtime, media, or business logic.

Each feature exposes a deliberately small public API through `index.ts`.
Feature-private components, hooks, services, schemas, state, types, fixtures,
and tests remain colocated in that feature.

Feature directories are created when their implementation begins rather than
being generated empty.

## Route Architecture

```text
src/app/
├── _layout.tsx
├── +not-found.tsx
├── (auth)/
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   └── callback.tsx
└── (app)/
    ├── _layout.tsx
    ├── (tabs)/
    │   ├── _layout.tsx
    │   ├── index.tsx             Today
    │   ├── meetings.tsx
    │   └── campus.tsx            Member presence
    ├── meeting/[meetingId].tsx
    ├── member/[memberId].tsx
    └── settings.tsx
```

Expo Router protected routes separate authenticated and unauthenticated
surfaces. Protection in the client is a navigation safeguard, not an
authorization boundary; the API remains authoritative.

The root and tab layouts own navigation configuration and provider composition.
Meeting and member routes accept identifiers only, then load authoritative data
through their features.

Native tabs are isolated to the tab layout so an Expo Router API migration does
not affect feature code. Meeting participation is presented outside the tab
navigator as a focused full-screen route.

The application is portrait-first. The active meeting route may allow
landscape orientation and must restore portrait behavior when it closes.

## Feature Domains

| Feature         | Responsibility                                                                |
| --------------- | ----------------------------------------------------------------------------- |
| `auth`          | Session bootstrap, Google login, token refresh, logout, and route eligibility |
| `meetings`      | Live/upcoming lists, details, access state, and join orchestration            |
| `meeting-room`  | LiveKit room lifecycle, media controls, participants, and reconnect UI        |
| `presence`      | Presence snapshot, realtime updates, directory, filters, and freshness        |
| `availability`  | The current user's available, busy, or DND mutation                           |
| `notifications` | Permission education, device registration, and meeting routing                |
| `settings`      | Account details, permissions, diagnostics, and logout                         |

`meetings` must not import `meeting-room`. The route layer composes a validated
meeting with the room feature after the join grant is issued.

## Core Infrastructure

```text
core/
├── analytics/
├── api/
├── auth/
├── config/
├── connectivity/
├── lifecycle/
├── media/
├── notifications/
├── persistence/
└── realtime/
```

Every external provider sits behind a typed application-owned port:

- `OpenApiClient`
- `AuthTokenStore`
- `RealtimeClient`
- `MeetingMediaClient`
- `NotificationClient`
- `AnalyticsClient`

Feature code depends on these ports rather than openapi-fetch, LiveKit,
SecureStore, Expo Notifications, or PostHog directly.

Subscription and application-lifecycle behavior lives in focused reusable hooks
or external stores. Route and component files must not import `useEffect`
directly. Data fetching uses TanStack Query, derived values are computed during
render, user actions use event handlers, and external-store subscriptions use
`useSyncExternalStore` where applicable.

## State Ownership

| State                                  | Owner                  |
| -------------------------------------- | ---------------------- |
| Meeting lists and details              | TanStack Query         |
| Campus member profile data             | TanStack Query         |
| Access token                           | In-memory auth session |
| Refresh token                          | Expo SecureStore       |
| Authentication bootstrap status        | Auth store             |
| Normalized realtime presence           | Presence store         |
| LiveKit room, tracks, and participants | LiveKit room instance  |
| Route and selected identifiers         | Expo Router            |
| Component-only interaction state       | Local React state      |

Presence is stored by member ID rather than repeatedly searching arrays.
Selectors subscribe to the smallest required slice so one member update does
not rerender the entire application.

LiveKit participant and track state must not be copied into Zustand or TanStack
Query. Display models are derived from LiveKit-owned state.

Meeting status, member status, and filtered lists are derived values rather
than separately synchronized state.

## Campus API Integration

The Campus API OpenAPI document at `/docs-json` is the source of truth.
`openapi-typescript` generates the `paths` type consumed by `openapi-fetch`.
Generated transport types are committed and never edited manually. Feature
services map transport documents into stable mobile domain models.

The shared openapi-fetch client:

- Uses generated literal paths, parameters, bodies, success documents, and
  error documents without handwritten transport types.
- Uses the `/v1` API prefix.
- Sends `Authorization: Bearer <token>` through request middleware.
- Generates and forwards `x-correlation-id` through request middleware.
- Returns successful documents without expecting an envelope.
- Normalizes the shared `{ error: { code, message, details } }` error contract.
- Maps `INVALID_ARGUMENT` field details to form errors.
- Honors pagination metadata.
- Applies bounded exponential backoff through TanStack Query only to safe,
  retryable operations.
- Does not automatically retry `400`, `401`, `403`, `404`, or conflict errors.
- Handles `RATE_LIMITED` without an immediate retry loop.

A `401` starts one shared refresh operation. Concurrent failed requests await
that operation and retry once. Refresh failure clears local credentials and
returns the user to sign-in.

The backend must publish OpenAPI contracts for:

- Google authorization-code exchange, refresh, and logout.
- Meetings visible to the current member.
- Meeting details and access state.
- A short-lived LiveKit join grant.
- Presence snapshot.
- Availability update.
- Push-device registration and revocation.

Exact route names and wire documents remain owned by the Campus API and are
consumed from OpenAPI rather than duplicated in this repository.

## Authentication

Mobile v1 supports login only for users who have already accepted an invitation
and completed onboarding on the web.

The authentication flow is:

```text
Protected route
  -> Google authorization code with PKCE
  -> Campus API code exchange
  -> access token held in memory
  -> refresh token stored in SecureStore
  -> authenticated route group
```

OAuth callbacks use the application scheme and production universal/app links.
Client secrets must never be shipped in the application.

An account that has not completed invitation onboarding receives a typed access
error and a link to finish onboarding on the web. Mobile does not implement an
open registration path.

Logout revokes the server session where supported, unregisters the push token,
disconnects realtime and LiveKit, clears Query caches, and deletes SecureStore
credentials. SecureStore cleanup is mandatory because iOS keychain values can
survive application reinstallation.

## Presence Architecture

Presence is an aggregate of independent server sessions:

```ts
type PresenceSource = "web" | "mobile" | "meeting";
type PresenceState = "online" | "away" | "offline";
type Availability = "available" | "busy" | "dnd";
```

A member is active when at least one authoritative session is active. Closing
one device cannot mark the member offline while another session remains.

The server owns:

- Session aggregation and expiry.
- Current permitted location.
- Presence and availability precedence.
- Privacy and role-based visibility.
- Last-seen visibility.
- Monotonic event sequence or version values.

The mobile app:

- Loads an initial authorized snapshot.
- Subscribes through `core/realtime`.
- Applies snapshot, upsert, and remove events by member ID.
- Rejects stale or duplicate versions.
- Exposes source information only when the API permits it.
- Sends a mobile heartbeat while foregrounded.
- Stops foreground heartbeat when backgrounded unless an active meeting keeps
  an authorized meeting session alive.
- Never overwrites a web-world location with a generic mobile location.

Availability is a user preference shared across devices. Offline availability
changes are not silently queued; the UI keeps the previous server value and
offers an explicit retry.

The member directory uses a virtualized list and supports status, role, cohort,
and track filters only when those fields are included in the authorized
response.

## Meeting Architecture

Joining a meeting is always an explicit action.

```text
Meeting details
  -> access check
  -> pre-join permission and device state
  -> request short-lived join grant
  -> initialize native audio session
  -> connect to LiveKit
  -> publish user-selected tracks
  -> connected meeting
```

The room lifecycle uses one discriminated status:

```text
idle -> preparing -> joining -> connected -> reconnecting
     -> leaving -> ended
     -> failed
```

The first join defaults to microphone and camera off. The pre-join screen makes
both controls explicit. Camera never activates because a meeting merely became
live or because the user opened its details.

The meeting room supports:

- Mute and unmute.
- Camera enable and disable.
- Front and rear camera selection.
- Speaker, earpiece, Bluetooth, and wired-route handling where available.
- Active-speaker and participant list UI.
- Permission-denied guidance.
- Reconnect state with a deliberate leave option.
- Clean leave and track disposal.

Meeting authorization and LiveKit grants are server-enforced. Grants are
short-lived, scoped to one room and participant, kept in memory, and excluded
from logs and analytics.

Screen sharing, recording, reactions, hand raising, moderation, and host
controls are outside mobile v1.

### Background and interruptions

When an active meeting enters the background:

- Camera publication is disabled immediately.
- Camera is not automatically restored on foreground.
- Audio remains active where platform policy and granted permissions permit.
- Android uses an appropriately declared foreground service and visible system
  notification.
- iOS uses the required audio background mode.
- Incoming calls, audio-focus loss, device-route changes, and permission
  revocation transition through the room state machine.

Leaving the meeting stops the native audio session, local tracks, room
connection, timers, and subscriptions.

### Poor bandwidth

Degradation order is:

```text
video and audio
  -> reduced or unsubscribed video
  -> audio only
  -> meeting status and participant presence
  -> cached meeting details
```

The media adapter exposes connection quality and reconnect state without
copying individual LiveKit events into component state.

## Notifications and Deep Links

Mobile requests notification permission after login in context, not on first
launch.

The device token is associated with the authenticated account and installation.
It is refreshed when the provider changes it and revoked on logout.

Meeting reminders carry an application route, not a LiveKit token. Opening a
notification:

1. Restores or refreshes authentication.
2. Opens `/meeting/[meetingId]`.
3. Refetches meeting state and access.
4. Enables Join only when the server still permits it.

Expired, cancelled, moved, unauthorized, or already-ended meetings show an
explicit state instead of silently redirecting.

## Offline and Connectivity Behavior

NetInfo drives TanStack Query's online manager and realtime reconnect policy.

Non-sensitive meeting summaries may be persisted for read-only offline access.
The application never persists:

- LiveKit grants.
- Access tokens.
- Realtime presence snapshots.
- Media track state.

Cached data is labelled with its last refresh time. Presence is never presented
as current while disconnected.

Reconnect order is authentication refresh, HTTP invalidation, realtime
resubscription, and then meeting reconnect if the user is still in an explicit
meeting session.

## UI, Accessibility, and Performance

Uniwind remains the styling system. Semantic CSS variables define complete
light and dark themes. Dynamic class-name construction is prohibited.

The design system owns native primitives such as buttons, text, fields, status
badges, empty states, permission prompts, sheets, and loading indicators.
Components that understand meetings or Campus members stay in their features.

Implementation rules:

- Use `expo-image` for remote avatars and images.
- Use FlashList for member and meeting collections.
- Use `Pressable`, native stack behavior, native safe-area handling, and native
  platform menus where appropriate.
- Use `gap` for sibling spacing.
- Use continuous border curves with rounded corners.
- Use `experimental_backgroundImage` for gradients and CSS-style `boxShadow`
  for shadows.
- Use Reanimated for transform and opacity motion, not React state per frame.
- Respect reduced-motion, dynamic type, screen readers, contrast, and minimum
  44-by-44 point touch targets.
- Do not make status distinguishable by color alone.

## Security and Privacy

- The API enforces every role, cohort, meeting, location, and visibility rule.
- Protected routes do not replace server authorization.
- Secrets and provider credentials never enter the application bundle.
- Logs and analytics redact authorization headers, refresh tokens, LiveKit
  grants, email addresses, and media metadata.
- Camera and microphone state are always visible during a meeting.
- DND and availability changes are acknowledged by the server before being
  shown as committed.
- No audio or video is recorded by mobile v1.

## Observability

Provider-specific analytics remain behind `AnalyticsClient`.

Required events include:

- `mobile_auth_succeeded`
- `mobile_auth_failed`
- `presence_screen_opened`
- `availability_change_succeeded`
- `availability_change_failed`
- `meeting_join_requested`
- `meeting_join_succeeded`
- `meeting_join_failed`
- `meeting_reconnecting`
- `meeting_media_degraded`
- `meeting_left`

Meeting events include a meeting identifier, authorized member identifier,
platform, app version, connection class, duration, failure category, and API
correlation ID. They must not include credentials or raw media information.

Dashboards report:

- Login success rate.
- Presence-event freshness.
- Meeting join success rate.
- Time to first remote audio.
- Reconnect rate and duration.
- Permission-denied rate.
- Audio-only degradation rate.
- Crash-free meeting sessions.

## Testing and Evals

### Unit tests

Test:

- API error and validation-field normalization.
- Single-flight token refresh.
- Presence session aggregation projections.
- Out-of-order and duplicate realtime events.
- Availability mutation rollback.
- Meeting lifecycle transitions.
- Permission and audio-route decisions.
- Background camera shutdown.
- Retry and degradation policies.

### Component and route tests

Use React Native Testing Library and Expo Router's testing utilities to verify:

- Authenticated and unauthenticated route guards.
- Today, meeting, and presence loading, empty, stale, offline, and error states.
- Join eligibility.
- Permission-denied recovery.
- Availability controls.
- Accessible labels, roles, focus, and non-color status indicators.

Route tests live outside `src/app` because every file in that directory is part
of Expo Router's routing surface.

### Integration tests

- MSW owns deterministic HTTP fixtures.
- Realtime and LiveKit use application-port fakes.
- Contract tests cover the shared API error and pagination documents.
- Generated OpenAPI types must match the committed server contract.

### Native end-to-end tests

Maestro flows run against built Android and iOS applications:

- Restore an authenticated test session and open Today.
- View live and upcoming meetings.
- Open a meeting notification route.
- Join, mute, enable camera, disable camera, and leave.
- Deny a media permission and recover through settings guidance.
- View member presence and update availability.
- Show a disconnected presence state without claiming stale members are live.

Background audio, Bluetooth routing, phone interruption, and camera shutdown
also receive a physical-device verification matrix because simulators cannot
fully validate native media publication.

### Deterministic evals

- `eval:architecture`: zero layer, feature, or deep-import violations.
- `eval:contracts`: zero generated OpenAPI drift.
- `eval:meeting-lifecycle`: all declared lifecycle transitions and cleanup
  invariants pass.
- `eval:accessibility`: zero serious automated accessibility findings on core
  screens.

The standard quality gate is:

```text
lint
  -> format check
  -> TypeScript
  -> unit/component tests
  -> architecture and contract evals
  -> Expo configuration validation
  -> Android build
  -> iOS build
  -> labelled or release-gated Maestro flows
```

## Delivery Sequence

1. Foundation: architecture boundaries, design tokens, test harnesses,
   generated contracts, environment validation, and development builds.
2. Authentication: Google login, SecureStore refresh, protected routes, and
   logout cleanup.
3. Presence: snapshot, normalized realtime updates, multi-source semantics,
   directory, and availability.
4. Meetings: lists, details, join grants, LiveKit room, permissions, controls,
   and cleanup.
5. Native integration: background audio, notifications, deep links,
   connectivity recovery, telemetry, EAS builds, and Maestro gates.

Each slice ships with its tests and deterministic eval coverage.

## External Contract Dependencies

Implementation depends on the Campus API and world/realtime service providing:

- Mobile OAuth exchange and refresh contracts.
- Authorized meeting query and join-grant contracts.
- Multi-source presence aggregation.
- Versioned presence events.
- Availability mutation.
- Push-device registration.
- Privacy-filtered location and last-seen data.

These are cross-service contract changes. Mobile may build against typed fakes
before they exist, but production integration cannot be declared complete until
the server-owned OpenAPI and realtime contracts are published and tested.

## Core Rules

1. Mobile is a companion application, not a second game client.
2. Route files compose features and contain no domain logic.
3. The server is authoritative for identity, access, presence, and meetings.
4. OpenAPI is the HTTP contract source of truth.
5. `openapi-fetch` is the only feature-facing HTTP client.
6. Realtime and media providers are accessed through application-owned ports.
7. TanStack Query owns HTTP server state.
8. Zustand owns only minimal shared client and normalized presence state.
9. LiveKit owns room, participant, and track state.
10. Credentials and meeting grants are never stored in general persistence.
11. Camera and microphone activation require visible user control.
12. Backgrounding disables camera and never silently restores it.
13. Features expose public entrypoints and cannot import one another.
14. Components do not call APIs or import `useEffect` directly.
15. Native builds, tests, cleanup, reconnection, accessibility, and telemetry
    are architectural requirements.

## Reference Basis

- [Campus API integration guide](../../../../server/dev/apps/campus-api/docs/intro.md)
- [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Router SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/)
- [Expo SecureStore SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/)
- [Expo Notifications SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/)
- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo Router testing](https://docs.expo.dev/router/reference/testing/)
- [Expo Maestro E2E workflows](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)
- [openapi-fetch](https://openapi-ts.dev/openapi-fetch/)
- [LiveKit Expo quickstart](https://docs.livekit.io/home/quickstarts/expo)
- [LiveKit React Native SDK](https://github.com/livekit/client-sdk-react-native)
