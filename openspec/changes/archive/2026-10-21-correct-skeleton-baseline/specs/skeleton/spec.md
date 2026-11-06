# skeleton Specification Delta

## MODIFIED Requirements

### Requirement: Styles load on their own

Rendering the skeleton directive, an element preset or a layout preset that draws at least one placeholder SHALL load the skeleton styles, presets included, without a skeleton-specific theme mixin or stylesheet import from the consumer. A layout preset whose counts leave it nothing to draw loads no styles. The global Koobiq design tokens MUST still be present, as for every component, because the wave colors come from them.

#### Scenario: No skeleton stylesheet

- **WHEN** an application that includes the Koobiq design tokens imports only `KbqSkeleton` and renders `<kbq-skeleton />`
- **THEN** the element is painted as a skeleton with its wave

#### Scenario: Layout preset with nothing to draw

- **WHEN** the only skeleton an application renders is a `kbq-skeleton-tabs` with `count` set to 0 and projected content that holds no skeleton
- **THEN** the skeleton styles are not loaded, and the host gets none of the layout styles of the preset
