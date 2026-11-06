# Spec Delta

## MODIFIED Requirements

### Requirement: Aspect ratio input

The `aspectRatio` input SHALL accept a CSS `aspect-ratio` value (such as `4 / 3` or `1.5`) and set it as the `--kbq-flag-aspect-ratio` custom property in the host's inline style, without `!important`. It SHALL outrank both the proportions the shape implies and any stylesheet rule that redefines that property without `!important`; an `!important` rule still wins over it. While it is unset, and after it is cleared, the host SHALL have no inline declaration of that property.

#### Scenario: Custom ratio

- **WHEN** `aspectRatio` is `4 / 3`
- **THEN** the host's inline style sets `--kbq-flag-aspect-ratio` to `4 / 3`

#### Scenario: Ratio on a square flag

- **WHEN** `shape` is `square` and `aspectRatio` is `4 / 3`
- **THEN** the flag has 4:3 proportions and is no longer square

#### Scenario: Clearing the ratio

- **WHEN** `aspectRatio` changes from `4 / 3` to `undefined`
- **THEN** the host's inline style no longer declares `--kbq-flag-aspect-ratio`

#### Scenario: Important stylesheet rule

- **WHEN** the consumer's stylesheet has `.my-flag { --kbq-flag-aspect-ratio: 1 / 1 !important; }` and a flag with the class `my-flag` has `aspectRatio="4 / 3"`
- **THEN** the flag has 1:1 proportions

### Requirement: Proportions from a stylesheet

The `--kbq-flag-aspect-ratio` custom property SHALL be declared by the component at zero specificity, so that a plain class rule of the consumer that redefines it SHALL set the proportions of every flag it matches that has no `aspectRatio`, for any shape, without `!important`. A flag the rule matches that has `aspectRatio` SHALL keep the ratio of the input.

#### Scenario: Class rule for a group of flags

- **WHEN** the consumer's stylesheet has `.my-flag { --kbq-flag-aspect-ratio: 4 / 3; }` and a flag has the class `my-flag`
- **THEN** the flag has 4:3 proportions, the same box as a flag with `aspectRatio="4 / 3"`

#### Scenario: Class rule and the input on one flag

- **WHEN** the consumer's stylesheet has `.my-flag { --kbq-flag-aspect-ratio: 4 / 3; }` and a flag with the class `my-flag` has `aspectRatio="1 / 1"`
- **THEN** the flag has 1:1 proportions
