# Spec Delta

## MODIFIED Requirements

### Requirement: Projected indicator

An element marked with `kbq-loader-overlay-indicator`, whose marker directive is imported, and placed at the top level of the overlay's content SHALL be rendered in place of the default spinner, so a consumer can show a spinner of another size or color, or another indicator. Such an element anywhere in the content MUST remove the default spinner, but one nested in an unmarked wrapper is not projected, so no indicator is shown.

#### Scenario: Custom spinner

- **WHEN** a `kbq-progress-spinner` with the `kbq-loader-overlay-indicator` attribute and the error color is projected
- **THEN** that spinner is shown with the class `kbq-error`
- **AND** the default spinner is not rendered

#### Scenario: Indicator nested in a wrapper

- **WHEN** the content is a plain `div` that wraps an element marked `kbq-loader-overlay-indicator`
- **THEN** neither that element nor the default spinner is rendered

### Requirement: Projected text

An element marked with `kbq-loader-overlay-text`, whose marker directive is imported, and placed at the top level of the overlay's content SHALL be rendered in place of the `text` input, which is then ignored even when it is bound. Such an element anywhere in the content MUST make the overlay ignore `text`, but one nested in an unmarked wrapper is not projected, so no text is shown.

#### Scenario: Projected text only

- **WHEN** `<div kbq-loader-overlay-text>Создание отчета</div>` is projected
- **THEN** the overlay shows "Создание отчета" in that element

#### Scenario: Projected text and a bound text

- **WHEN** a text element is projected and `text` is also bound
- **THEN** only the projected element is rendered

#### Scenario: Text nested in a wrapper

- **WHEN** `text` is bound and the content is a plain `div` that wraps an element marked `kbq-loader-overlay-text`
- **THEN** no text is rendered, neither the bound string nor the marked element

### Requirement: Projected caption

An element marked with `kbq-loader-overlay-caption`, whose marker directive is imported, and placed at the top level of the overlay's content SHALL be rendered in place of the `caption` input, which is then ignored even when it is bound. Such an element anywhere in the content MUST make the overlay ignore `caption`, but one nested in an unmarked wrapper is not projected, so no caption is shown.

#### Scenario: Projected caption only

- **WHEN** `<div kbq-loader-overlay-caption>18,7 МБ из 25 МБ — осталось 2 мин</div>` is projected
- **THEN** the overlay shows that string in that element

#### Scenario: Projected caption and a bound caption

- **WHEN** a caption element is projected and `caption` is also bound
- **THEN** only the projected element is rendered

#### Scenario: Caption nested in a wrapper

- **WHEN** `caption` is bound and the content is a plain `div` that wraps an element marked `kbq-loader-overlay-caption`
- **THEN** no caption is rendered, neither the bound string nor the marked element

### Requirement: Only marked content is rendered

The overlay SHALL render only the top-level nodes of its content that match one of the three marker selectors, with what is inside them: an element carrying a marker attribute, or a node whose `ngProjectAs` names one. It renders the nodes matching a marker only while its content holds an element with the matching marker directive. Any other content placed inside `kbq-loader-overlay` MUST NOT be rendered.

#### Scenario: Unmarked content

- **WHEN** a plain `<span>` is placed inside `kbq-loader-overlay`
- **THEN** the span is not rendered

#### Scenario: Content projected with ngProjectAs

- **WHEN** a `span` with `ngProjectAs="[kbq-loader-overlay-caption]"` is placed next to an element marked `kbq-loader-overlay-caption`
- **THEN** the span is rendered in the caption's place as well
