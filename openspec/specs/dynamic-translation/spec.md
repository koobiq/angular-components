# dynamic-translation Specification

## Purpose

Describes what `@koobiq/components/dynamic-translation` guarantees to consumers: how `kbq-dynamic-translation` renders an already translated string, how `[[name:context]]` markers in it are replaced by templates registered with `kbqDynamicTranslationSlot`, and how the helper that renders plain elements for markers behaves.

## Requirements

### Requirement: Text is rendered as given

`kbq-dynamic-translation` SHALL render its required `text` input as it is given. It MUST NOT translate the string or follow the active locale. A text without slot markers SHALL render unchanged, and an empty text SHALL render nothing.

#### Scenario: Text without markers

- **WHEN** `text` is "text without any slot"
- **THEN** the text content of `kbq-dynamic-translation` is exactly "text without any slot"

#### Scenario: Empty text

- **WHEN** `text` is an empty string
- **THEN** `kbq-dynamic-translation` has no text content

### Requirement: Text is not parsed as markup

The parts of `text` outside slot markers SHALL be rendered as text nodes. Markup in them MUST NOT be interpreted: tags and character references appear literally.

#### Scenario: Tags in the text

- **WHEN** `text` is `Press <b>Save</b>`
- **THEN** the user sees the characters `<b>Save</b>`
- **AND** no `b` element is created

### Requirement: Output structure

The component SHALL place the text parts and the rendered slot templates directly inside its host element, in the order they appear in `text`, without a wrapper element. The host element SHALL carry no classes, role or ARIA attributes of its own.

#### Scenario: Text around a slot

- **WHEN** `text` is `text before slot1 [[testSlot1:slot1 context]] text between slots [[testSlot2:slot2 context]] text after slot2` and both slots are registered
- **THEN** the text and elements rendered inside the host are, in order, the text "text before slot1 ", the first slot's element, the text " text between slots ", the second slot's element and the text " text after slot2", with no element around them
- **AND** the component adds no attribute to the `kbq-dynamic-translation` element

### Requirement: Slot templates are registered by name

`kbqDynamicTranslationSlot` on a template SHALL register that template under the name given by its required value. Only slot templates that are direct content children of `kbq-dynamic-translation` SHALL be registered: `@if`, `@for` and `<ng-container>` around a slot do not count as nesting, another element does. A slot whose name is an empty string MUST be ignored. Names enter the marker pattern unescaped, so a name MUST NOT hold a regular-expression special character, such as `.`, `|` or `(`.

#### Scenario: Structural syntax

- **WHEN** the content of `kbq-dynamic-translation` holds `<a *kbqDynamicTranslationSlot="'link'; let context">{{ context }}</a>`
- **THEN** every `[[link:…]]` marker in `text` renders that link

#### Scenario: Slots produced by a control-flow block

- **WHEN** the slot templates are rendered by an `@for` block placed directly inside `kbq-dynamic-translation`
- **THEN** each of them is registered under its name

#### Scenario: Slot nested in another element

- **WHEN** a slot template is placed inside a `span` within the content of `kbq-dynamic-translation`
- **THEN** it is not registered, and its markers stay in the output as literal text

#### Scenario: Name with a special character

- **WHEN** a slot is named `a.b` and `text` is `[[axb]] [[a.b]]`
- **THEN** `[[axb]]` is removed from the output
- **AND** `[[a.b]]` renders the slot

#### Scenario: Name with an unbalanced parenthesis

- **WHEN** a slot is named `a(`
- **THEN** rendering `kbq-dynamic-translation` throws a `SyntaxError`, whatever its `text`

### Requirement: Slot directive needs a template

`kbqDynamicTranslationSlot` MUST be applied to a template, through the `*` syntax or on an `<ng-template>`. Applied to a plain element, it SHALL fail with Angular's missing-provider error for `TemplateRef`.

#### Scenario: Directive without the asterisk

- **WHEN** a template contains `<a kbqDynamicTranslationSlot="link">` without the `*`
- **THEN** creating the view throws Angular's missing-provider error for `TemplateRef`

### Requirement: Last slot with a name wins

When two registered slot templates share a name, the one that comes later in the content SHALL render every marker of that name. The earlier one MUST NOT render.

#### Scenario: Two slots named the same

- **WHEN** the content holds a `strong` slot and, after it, an `em` slot, both named `accent`, and `text` contains `[[accent:word]]`
- **THEN** the marker renders as `<em>word</em>`

### Requirement: Marker renders its slot template

A marker `[[name:context]]` whose `name` is a registered slot name SHALL be replaced by that slot's template, rendered with the context as its implicit template context (the `let` variable). The text before and after the marker SHALL stay in place, and every marker in a text SHALL be replaced in the same way, so one text can hold markers of several slots.

#### Scenario: Two different slots in one text

- **WHEN** `text` is `text before slot1 [[testSlot1:slot1 context]] text between slots [[testSlot2:slot2 context]] text after slot2`
- **AND** `testSlot1` is `<a *kbqDynamicTranslationSlot="'testSlot1'; let context" kbqLink>{{ context }}</a>` and `testSlot2` renders the context in a `strong` element
- **THEN** the output reads "text before slot1 ", a link with the text "slot1 context", " text between slots ", `<strong>slot2 context</strong>`, " text after slot2"

### Requirement: Marker without a context

A marker `[[name]]` of a registered slot SHALL render the slot's template with `undefined` as its implicit context.

#### Scenario: Link slot without a context

- **WHEN** `text` is `with empty slots [[testSlot1]]` and `testSlot1` renders its context inside a link
- **THEN** the text "with empty slots " is followed by a link with no text

### Requirement: Where a context ends

The context of a marker SHALL be the shortest non-empty run of characters after the colon, without a line break, that is followed by `]]`. Every character in it, including single square brackets, parentheses, braces, punctuation and non-Latin scripts, SHALL reach the template unchanged, unless the context has the list form of the "List context" requirement, which reaches the template as an array.

#### Scenario: Special characters

- **WHEN** `text` is `with special chars [[testSlot2:0123456789!@#$%^&*()_+-=[]{}]] and 0123456789!@#$%^&*()_+-=[]{}`
- **THEN** the slot renders `0123456789!@#$%^&*()_+-=[]{}`
- **AND** the text " and 0123456789!@#$%^&*()_+-=[]{}" follows it unchanged

#### Scenario: Non-Latin text and emoji

- **WHEN** the context of a marker holds Cyrillic and CJK characters and an emoji
- **THEN** the slot renders them unchanged

### Requirement: List context

A context written as `(first,second,…)` SHALL reach the template as an array of strings, split at every comma, with the spaces around each item kept. Any other context SHALL reach the template as the string itself; this includes `()` with nothing between the parentheses.

#### Scenario: List of items

- **WHEN** `text` is `with list [[testListSlot:(item1,item2,item3)]]` and the slot renders a `ul` with one `li` per item
- **THEN** the list holds the items "item1", "item2" and "item3"

#### Scenario: Spaces after commas

- **WHEN** the context is `(first, second)`
- **THEN** the template receives `['first', ' second']`

#### Scenario: Empty parentheses

- **WHEN** the context is `()`
- **THEN** the template receives the string `()`, not an array

### Requirement: Repeated markers

Every marker of a registered slot SHALL render its own instance of the slot template with its own context, so one slot can appear any number of times in a text.

#### Scenario: Same slot twice

- **WHEN** `text` is `first slot [[testSlot2:first context]] and second slot [[testSlot2:second context]]`
- **THEN** the output holds `<strong>first context</strong>` and, after the text " and second slot ", `<strong>second context</strong>`

### Requirement: Unknown names and malformed markers stay text

A `[[…]]` sequence whose name is not a registered slot name, compared case-sensitively, and any bracket sequence that does not form a complete marker SHALL stay in the output as literal text. No error SHALL be thrown for them. While no slot is registered, the marker pattern holds only an empty name, so `[[]]` and `[[:context]]` are removed from the output instead.

#### Scenario: Unregistered slot name

- **WHEN** `text` is `with undefined slot [[undefinedSlot:undefined slot context]]` and no slot is named `undefinedSlot`
- **THEN** the whole string is rendered as text, brackets included

#### Scenario: Incomplete and single brackets

- **WHEN** `text` is `with [[incomplete and [invalid] and [[testSlot2:valid]] syntax`
- **THEN** "with [[incomplete and [invalid] and " is rendered as text, followed by `<strong>valid</strong>` and the text " syntax"

#### Scenario: Name in a different case

- **WHEN** a slot is registered as `testSlot1` and `text` contains `[[TestSlot1:context]]`
- **THEN** the marker stays in the output as literal text

#### Scenario: No slot registered

- **WHEN** no slot template is registered and `text` is `before [[]] middle [[:note]] after`
- **THEN** the output holds only the texts "before ", " middle " and " after"

### Requirement: Output follows input changes

The rendered output SHALL follow the current `text` and the current set of registered slot templates. Changing `text`, or adding or removing a slot template, for example with `@if`, SHALL re-render the content.

#### Scenario: New text

- **WHEN** `text` changes to `NEW text before slot [[testSlot1:NEW slot context]] NEW text after slot`
- **THEN** the output reads "NEW text before slot ", a link with the text "NEW slot context" and " NEW text after slot"
- **AND** nothing of the previous text remains

#### Scenario: Slot removed by a condition

- **WHEN** a slot template is wrapped in `@if` and the condition becomes false
- **THEN** the markers of that slot are rendered as literal text

### Requirement: Helper renders plain elements for markers

`kbq-dynamic-translation-with-dynamic-component-creation` SHALL take a required `text` and a required `slots` list of `{ name, tag, attributes?, content? }`. For every marker of a listed slot it SHALL render a `tag` element whose text is the slot's `content`, or the marker's context when `content` is empty or not set, with every entry of `attributes` set as an attribute. With neither `content` nor a context, the text is `null`. These are plain DOM elements, not Angular components.

#### Scenario: Context as the element's text

- **WHEN** `text` is `[[bold:1000]] incidents have been registered.` and `slots` is `[{ name: 'bold', tag: 'b' }]`
- **THEN** the helper renders `<b>1000</b>` followed by the text " incidents have been registered."

#### Scenario: Fixed content and attributes

- **WHEN** a slot is `{ name: 'link', tag: 'a', content: 'docs', attributes: [{ key: 'href', value: '/docs' }] }` and `text` contains `[[link:ignored]]`
- **THEN** the marker renders as `<a href="/docs">docs</a>`

#### Scenario: Component selector as the tag

- **WHEN** `tag` is the selector of an Angular component
- **THEN** an element with that name is created, but the component is not instantiated

#### Scenario: Neither content nor context

- **WHEN** a slot is `{ name: 'bold', tag: 'b' }` and `text` contains `[[bold]]`
- **THEN** the marker renders as `<b>null</b>`

### Requirement: Helper creates its elements once

The helper SHALL create the elements for its markers once, after its first render in the browser. Later changes to `text` or `slots` MUST NOT create further `tag` elements or update the ones already created: a marker that appears later renders at most the empty placeholder `span` of the helper's template.

#### Scenario: First render

- **WHEN** the helper has been rendered for the first time in the browser
- **THEN** every marker of a listed slot is shown as its element

#### Scenario: Text changed after the first render

- **WHEN** `slots` is `[{ name: 'bold', tag: 'b' }]` and `text` changes after the first render from `[[bold:1]] incidents` to `[[bold:1]] and [[bold:2]] incidents`
- **THEN** `<b>1</b>` stays, and no `b` element is created for `[[bold:2]]`
- **AND** an empty `span` with `data-slot-name="bold"` stands in place of `[[bold:2]]`

### Requirement: Module and standalone use

`KbqDynamicTranslationModule` SHALL import and export `KbqDynamicTranslation`, `KbqDynamicTranslationSlot` and `KbqDynamicTranslationHelper`. Each of them SHALL also be standalone, so it can be imported on its own.

#### Scenario: Importing the module

- **WHEN** a standalone component imports `KbqDynamicTranslationModule`
- **THEN** its template can use `kbq-dynamic-translation` and `*kbqDynamicTranslationSlot`

#### Scenario: Importing one piece

- **WHEN** a standalone component imports only `KbqDynamicTranslation` and `KbqDynamicTranslationSlot`
- **THEN** its template can use both without the module
