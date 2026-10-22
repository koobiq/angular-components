# Proposal

## Why

The baseline spec of `filter-bar` (`openspec/specs/filter-bar/spec.md`, written from the code on `c9c196a9b` and never checked) states behaviour the code does not have. A static audit of every requirement against `packages/components/filter-bar`, the parts of `core` it relies on and their tests found fourteen requirements with at least one wrong statement; this change corrects them so the spec describes what ships.

## What Changes

- **Pipe host classes**: `kbq-pipe_empty` follows whether the pipe reads as empty, which a pipe holding a value can do (a date range without its end, only locked values, everything selected under "all selected equals nothing selected").
- **Pipe options follow the templates**: a later template without `values` keeps the previous `valueTemplate` along with the previous `values`.
- **Pipe fill state**: the button is filled or outlined by whether the pipe reads as empty, not by whether it holds a value.
- **Clear and remove button visibility**: the `input` pipe never renders the button, and a cleanable pipe shows it only while it does not read as empty.
- **Focus returns to the pipe trigger**: toggling an option of a multi-select or multi-tree-select pipe does not move focus; only closing their panel returns it to the trigger.
- **All selected equals nothing selected**: once the panel closes, reopening it shows only the locked values selected, not every option.
- **Multi-tree-select pipe**: while a search query is entered, the select-all node toggles only the nodes the search shows.
- **Search in pipes**: the words of the query may be split between an option's name and caption.
- **Date pipe period list**: a preset whose `start` and `end` both parse as dates shows the formatted range on the trigger, not its name.
- **Save popover**: the name field opens without an error even when empty, and becomes invalid only once the user empties it.
- **Submitting the save popover**: the field and buttons are disabled before `onSave` is emitted, and a field left empty since the popover opened emits an empty name.
- **State saving switch and key**: the state is read once while the bar initializes; a bar initialized with `useStateSaving` off never reads or writes, even once it is turned on.
- **Restore waits for data**: the state waits for templates only while none of its pipes can be rebuilt; once one can, the others are left out instead of waited for.
- **Pipe registry and custom pipes**: providing another map replaces the whole registry, built-in types included, instead of adding to it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `filter-bar`: fourteen requirements corrected to match the code: Pipe host classes, Pipe options follow the templates, Pipe fill state, Clear and remove button visibility, Focus returns to the pipe trigger, All selected equals nothing selected, Multi-tree-select pipe, Search in pipes, Date pipe period list, Save popover, Submitting the save popover, State saving switch and key, Restore waits for data and Pipe registry and custom pipes.

## Impact

Only OpenSpec files: this change and, once archived, `openspec/specs/filter-bar/spec.md`. No source, test or documentation file changes.
