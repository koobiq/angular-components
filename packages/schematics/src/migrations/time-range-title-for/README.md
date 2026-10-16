# time-range-title-for

Migration schematic invoked automatically by `ng update @koobiq/components@21`
(registered for `21.0.0-0`). Carries a time-range consumer across the two
changes of this release: the removal of `title.for` from the locale
configuration, and the component review that made `kbq-time-range` tell
Angular's forms layer the truth about itself. They ship in the same version, so
they ship as one schematic.

## Background

The title of `kbq-time-range` used to prepend `title.for` ("за" / "for") to the
selected period: "за последний час". The period now stands alone ("последний
час" / "Last hour"), and the duration templates of each locale carry whatever
word the period needs, so the key was removed.

The same release closed the gap between what the component claimed to the forms
layer and what it did. The published form-field adapter turned from a set of
declarations into a real implementation, and the manual `errorState` plumbing
went away with it.

| Member                                                                                | Before                | After                                       |
| ------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------- |
| `KbqTimeRangeEditor.timepickerList`                                                   | view query            | removed                                     |
| `KbqTimeRangeTitleAsControl.value` / `empty` / `required` / `disabled` / `errorState` | writable, never set   | read-only signals over the host and control |
| `KbqTimeRangeTitleAsControl.id` / `placeholder` / `focused`                           | writable, `undefined` | read-only signals, `id` generated           |
| `KbqTimeRangeTitleAsControl.controlType`                                              | writable              | readonly                                    |
| `KbqTimeRangeTitleAsControl.stateChanges`                                             | never emitted         | removed                                     |
| `KbqTimeRange.value` / `KbqTimeRange.disabled`                                        | absent                | read-only signals                           |
| `KbqTimeRange.setDisabledState` / `KbqTimeRangeEditor.setDisabledState`               | absent                | implemented                                 |
| `KbqTimeRangeTitle.disabled`                                                          | absent                | signal input                                |

The one-line defect behind the review is worth naming. `mapTimeRange` assembled
its argument as `toDate: this.form.controls.toTime.value` — the _time_ control
feeding the _date_ slot — and `combineDateAndTime` takes the calendar date from
its first argument. A user who picked "to: 20 September" got a range ending on
whatever day the timepicker held. The form's own validator read `toDate`
correctly, so validation and emission disagreed about what the range was.

## Breaking change

**`title.for` was removed from `KbqTimeRangeLocaleConfiguration`.** A literal
typed against the configuration — a `kbqTimeRangeLocaleConfigurationProvider()`
argument, for one — fails to compile on the key with an excess-property error;
an untyped one silently loses the override.

## Behaviour change

**The title shows the period alone.** A custom title template receives the
period without a prefix in `formattedDate`. A word you prefixed through
`title.for` belongs in your `durationTemplate.title` overrides now.

## What it does

The schematic walks every `.ts`, `.html`, `.scss` and `.css` file in the project
(skipping `node_modules` and `dist`). Stylesheets are visited because the markup
change is what a descendant selector keyed on the radiogroup notices.

| Auto-fix                                                              | Where |
| --------------------------------------------------------------------- | ----- |
| Removes `for` from the `title` section of a time-range locale literal | `.ts` |

A `title` literal is treated as the time-range one when it belongs to a
`timeRange` section, to a `kbqTimeRangeLocaleConfigurationProvider()` argument,
or to a literal that also carries `editor` or `durationTemplate`. No type
resolution is involved — the schematic's virtual tree has no `@koobiq` types to
resolve against — so an unrelated `title: { for: … }` is never touched. The
property is deleted together with exactly one adjacent separator, so the literal
keeps its shape and nothing else in the file is reformatted.

## What it does _not_ do (warn-only)

| Pattern                                                   | Manual migration                                                                 |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| A read of `title.for`                                     | Drop it — the title shows the period alone                                       |
| A `for` key left in a `title` literal or template binding | Remove it, or ignore the report for an unrelated object                          |
| `.timepickerList`                                         | Provide an `ErrorStateMatcher`; the editor no longer writes `errorState` by hand |
| `.errorState = …` and friends on the adapter              | Drive the state through the bound form control; read it with a call              |
| `.stateChanges` on the adapter                            | Read its signals in a `computed()` or an `effect()`                              |
| `(valueCorrected)`                                        | Still emits, but only for values it actually corrected                           |
| `.kbq-radio-group .kbq-time-range-editor__range`          | The from/to block is a sibling of the radiogroup now, not a descendant           |

Warnings are checked against the **post-fix** content, so an auto-fixed literal
does not also report as needing manual work. In dry-run mode (`--fix false`)
they are reported against the original content instead.

A pattern that names a component member is only evaluated for a file that also
mentions `kbq-time-range`, so an unrelated `.timepickerList` of your own is not
reported. The gate is per file rather than per receiver: where a member name is
common (`.value`, `.disabled`), a report can point at an assignment to an
unrelated object in a file that happens to use the control. Read the report
before changing anything — it is a pointer, not a diagnosis. A
`control().stateChanges` read off a form field is left to `form-field-signals`.

### Notes with no call site to point at

- Ranges emitted before this release ended on the wrong calendar day. Persisted
  values may need correcting.
- A disabled control is inert: the trigger leaves the tab order, the popover
  refuses to open, and the host takes a `kbq-disabled` class.
- The control becomes `touched` when the popover closes, so a `required` time
  range shows its error message at the moment the matcher intends instead of
  never.
- The popover footer dropped its unnamed `role="group"`, and the from/to
  prefixes are associated with their four inputs through `aria-labelledby`
  instead of an inert `aria-label` on a bare `<span>`.

`fix` defaults to `true`. `ng update` invokes migrations with no options at all,
so the rule applies that default itself rather than relying on the schema.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:time-range-title-for --project "<your project>"
```

Usage for Nx:

```shell
nx g @koobiq/components:time-range-title-for --project "<your project>"
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:time-range-title-for --project koobiq-docs
```

### Result

#### Before

```ts
import { kbqTimeRangeLocaleConfigurationProvider } from '@koobiq/components/time-range';

export const timeRangeConfiguration = kbqTimeRangeLocaleConfigurationProvider({
    title: {
        for: 'за',
        placeholder: 'Период'
    }
});
```

#### After

```ts
import { kbqTimeRangeLocaleConfigurationProvider } from '@koobiq/components/time-range';

export const timeRangeConfiguration = kbqTimeRangeLocaleConfigurationProvider({
    title: {
        placeholder: 'Период'
    }
});
```
