# Spec Delta

## MODIFIED Requirements

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

### Requirement: Where a context ends

The context of a marker SHALL be the shortest non-empty run of characters after the colon, without a line break, that is followed by `]]`. Every character in it, including single square brackets, parentheses, braces, punctuation and non-Latin scripts, SHALL reach the template unchanged, unless the context has the list form of the "List context" requirement, which reaches the template as an array.

#### Scenario: Special characters

- **WHEN** `text` is `with special chars [[testSlot2:0123456789!@#$%^&*()_+-=[]{}]] and 0123456789!@#$%^&*()_+-=[]{}`
- **THEN** the slot renders `0123456789!@#$%^&*()_+-=[]{}`
- **AND** the text " and 0123456789!@#$%^&*()_+-=[]{}" follows it unchanged

#### Scenario: Non-Latin text and emoji

- **WHEN** the context of a marker holds Cyrillic and CJK characters and an emoji
- **THEN** the slot renders them unchanged

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
