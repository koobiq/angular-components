# accordion Specification Delta

## MODIFIED Requirements

### Requirement: Controlled value

Binding `value` to a string or an array SHALL expand exactly the items whose values it contains and collapse the others, on the first render and on every later change of the binding; in single mode only its first non-empty value counts. `null` and `undefined` SHALL leave the accordion uncontrolled. The binding MUST NOT stop the user from toggling items; the bound value is applied again only when it changes or when `stateSavingKey` changes (see Changing the state saving key).

#### Scenario: Changing the bound value in multiple mode

- **WHEN** a multiple accordion's `value` changes from `['item-1']` to `['item-2']`
- **THEN** `item-1` collapses and `item-2` expands

#### Scenario: Bound array in multiple mode

- **WHEN** a multiple accordion's `value` is `['item-1', 'item-2']`
- **THEN** both items are expanded

### Requirement: Unusable saved payloads

A saved payload SHALL be ignored as if nothing were saved, so `defaultValue` applies, unless it is an empty array, an array holding at least one string, or an object in the previous `{ [itemId]: { expanded, value } }` format with at least one entry whose `expanded` is a boolean and whose `value` is a string. Other entries SHALL be dropped from an accepted payload. A payload in the previous format SHALL be read as the values of its expanded entries and reconciled like any saved state.

#### Scenario: Unrelated payload

- **WHEN** the store holds a string, a number, an unrelated object or an array of non-strings and `defaultValue` is `item-2`
- **THEN** `item-2` is expanded and no error is thrown

#### Scenario: Previous format

- **WHEN** a single-mode store entry maps three item ids to `{ expanded: true, value: 'item-1' }`, `{ expanded: false, value: 'item-2' }` and `{ expanded: true, value: 'removed-item' }`
- **THEN** only `item-1` is expanded and the store is rewritten to `['item-1']`

### Requirement: Changing the state saving key

When `stateSavingKey` changes after the first render, the accordion SHALL restore the state saved under the new key once the items rendered in the same pass are bound. When nothing is saved under the new key, the items SHALL keep their current state. While `value` is bound to anything other than `null` or `undefined`, the key change SHALL instead apply the bound value again, whatever the new key holds.

#### Scenario: State under the new key

- **WHEN** the store holds `['item-2']` under `another-key` and `stateSavingKey` changes to `another-key`
- **THEN** only `item-2` is expanded

#### Scenario: Nothing under the new key

- **WHEN** the user has expanded `item-1` and `stateSavingKey` changes to a key with nothing saved
- **THEN** `item-1` stays expanded
