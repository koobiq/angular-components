# Spec Delta

## Purpose

Describes what `kbqLink` from `@koobiq/components/link` guarantees to consumers: how an element becomes a link or a pseudo link, how its content is laid out, how users activate it with the pointer, the keyboard or assistive technology, how it prints, and how the application-wide defaults apply.

## ADDED Requirements

### Requirement: Link host

The `kbqLink` attribute SHALL turn its element into a link with the `kbq-link` class, exported to templates as `kbqLink`. An `<a>` SHALL be a regular link, with or without a `href`, unless `pseudo` is set. Any other element, and an `<a>` with `pseudo`, SHALL be a pseudo link and carry `kbq-link_pseudo`.

#### Scenario: Element other than an anchor

- **WHEN** `kbqLink` is applied to a `<span>`
- **THEN** the span has the classes `kbq-link` and `kbq-link_pseudo`

#### Scenario: Anchor without a href

- **WHEN** `kbqLink` is applied to an `<a>` that has neither a `href` nor `pseudo`
- **THEN** the anchor has no `kbq-link_pseudo` class and no `role`

#### Scenario: Anchor marked pseudo

- **WHEN** `pseudo` is set to `true` on that anchor
- **THEN** it has the `kbq-link_pseudo` class and `role="button"`

### Requirement: Content structure

The link SHALL render the content marked `kbqLinkPrefix` first, then the rest of its content inside a text element with the `kbq-link__text` class, then a trailing element with the `kbq-link__trailing` class that holds the external icon and the content marked `kbqLinkSuffix`. The marked elements SHALL get the `kbq-link__prefix` and `kbq-link__suffix` classes.

#### Scenario: Link with a leading and a trailing icon

- **WHEN** a link holds an icon marked `kbqLinkPrefix`, the text "Save" and an icon marked `kbqLinkSuffix`
- **THEN** its children are the prefix icon, the text element reading "Save" and the trailing element holding the suffix icon, in that order

#### Scenario: Punctuation after the text

- **WHEN** the period that ends a sentence is put in an element marked `kbqLinkSuffix`
- **THEN** the text element does not contain the period and the trailing element does

#### Scenario: Nothing after the text

- **WHEN** a link has no suffix content and is not external
- **THEN** the trailing element has no child elements

### Requirement: Only the text is underlined

Only the text element SHALL draw the underline. Prefix and suffix content MUST NOT be underlined while staying part of the link's click area; their text and the icons without a color of their own SHALL take the color of the link in every state.

#### Scenario: Icons and punctuation

- **WHEN** a link has a prefix icon, a suffix icon or a period marked `kbqLinkSuffix`
- **THEN** only the text is underlined and the icons and the period have the link color

### Requirement: Whitespace at the edges of the text

The link SHALL remove the space, tab, line feed, carriage return and form feed characters at the start and the end of its text, so that a formatted template adds no underlined space. Whitespace inside the text and non-breaking spaces SHALL be kept. The text SHALL be trimmed again after it changes, including text projected through another component.

#### Scenario: Formatted template

- **WHEN** the text "Save" stands on its own line between a prefix and a suffix icon
- **THEN** the text element reads exactly "Save"

#### Scenario: Interpolated text changes

- **WHEN** the interpolated text changes from "first" to "second"
- **THEN** the text element reads exactly "second"

#### Scenario: Spaces inside the text

- **WHEN** the text is "Save report"
- **THEN** the three spaces between the words are kept

#### Scenario: Text projected through a wrapper

- **WHEN** a wrapper component projects its content into a link and the projected text changes
- **THEN** the text element reads exactly the new text

### Requirement: Trimmed text gets its spaces back

When content rendered at an edge of the text moves a trimmed text node away from that edge, the node SHALL get back the whitespace it lost on that side.

#### Scenario: Block rendered before the text

- **WHEN** a link reads "new messages" and a conditional `<b>3</b>` is then rendered before the text
- **THEN** the text element reads "3 new messages"
- **AND** after the block is removed it reads "new messages" again

### Requirement: Size

The `size` input SHALL accept `compact`, `normal` and `big`, default to the size of the application-wide options (`normal` unless provided), and set the typography of the link and the gaps to its icons. The host SHALL carry exactly one class `kbq-link_size_<size>`.

#### Scenario: Default size

- **WHEN** a link has no `size` and no options are provided
- **THEN** it has the `kbq-link_size_normal` class

#### Scenario: Changing the size

- **WHEN** `size` changes from `compact` to `big`
- **THEN** the link has `kbq-link_size_big` and no longer has `kbq-link_size_compact` or `kbq-link_size_normal`

### Requirement: External link icon

With `external` set, the link SHALL render the `kbq-north-east_16` icon with the `kbq-link__external-icon` class at the start of the trailing element, before any suffix content. The icon SHALL be hidden from assistive technology. `external` MUST NOT set `target`; without it no external icon is rendered.

#### Scenario: External link

- **WHEN** an `<a>` with a `href` has `external`
- **THEN** the trailing element starts with the `kbq-north-east_16` icon, which has `aria-hidden="true"`
- **AND** the anchor has no `target` attribute

#### Scenario: External link ending a sentence

- **WHEN** an external link also holds a period marked `kbqLinkSuffix`
- **THEN** the external icon comes first in the trailing element and the period follows it

### Requirement: Pseudo link role

A pseudo link SHALL get `role="button"`, unless its element is a `<button>` or a `<label>`, declares a `role` in the template, or has a negative `tabIndex`. A regular link MUST NOT get a role from the component.

#### Scenario: Pseudo link from a span

- **WHEN** `kbqLink` is applied to a `<span>`
- **THEN** the span has `role="button"`

#### Scenario: Regular link

- **WHEN** `kbqLink` is applied to an `<a>` with a `href`
- **THEN** the anchor has no `role` attribute

### Requirement: Enter and Space activate a pseudo link

While a pseudo link acts as a button, Enter and Space pressed on it SHALL click it on keydown and prevent the key's default action. A Space keydown repeated while the key is held SHALL be prevented without clicking again. Keys pressed on an element inside the link SHALL be left alone.

#### Scenario: Pressing Enter and Space

- **WHEN** a pseudo `<span>` has focus and the user presses Enter and then Space
- **THEN** the span is clicked twice and both keydown events have their default action prevented

#### Scenario: Holding Space

- **WHEN** the user presses Space on a pseudo link and the keydown repeats while the key is held
- **THEN** the link is clicked once and the repeated keydown has its default action prevented

### Requirement: Pseudo anchor with a href

On a pseudo `<a>` that has a `href`, the link SHALL leave Enter to the browser's own link activation and SHALL click the anchor on Space.

#### Scenario: Enter and Space on a pseudo anchor with a href

- **WHEN** an `<a pseudo href="#">` has focus and the user presses Enter
- **THEN** the component neither clicks the anchor nor prevents the key's default action
- **AND** pressing Space clicks the anchor once

### Requirement: Keys another directive has handled

A keydown of Enter or Space whose default action another listener on the element has already prevented, as `kbqDropdownTriggerFor` does, MUST NOT activate the pseudo link.

#### Scenario: Directive handling Enter and Space

- **WHEN** another directive on a pseudo link prevents the default action of Enter and Space
- **AND** the user presses Enter and then Space
- **THEN** that directive handles both keys, the link keeps `role="button"` and it is not clicked

### Requirement: Declared role is kept

A `role` written on the element in the template SHALL stay on the element, on a regular link and on a pseudo link. A pseudo link with a declared role MUST NOT be activated by the component on Enter or Space; its own role and keyboard handling apply.

#### Scenario: Regular link with a role

- **WHEN** an `<a href>` link declares `role="menuitem"`
- **THEN** it has `role="menuitem"`

#### Scenario: Pseudo link with a role

- **WHEN** a pseudo `<span>` declares `role="link"` and `tabindex="0"` and the user presses Enter on it
- **THEN** it keeps `role="link"` and is not clicked

### Requirement: Pseudo link out of the tab order

A pseudo link whose `tabIndex` is negative, from the `tabIndex` input or from a `tabindex` attribute written on the element, SHALL get no role and MUST NOT be activated on Enter or Space, because something else activates it, such as the file input of a file upload.

#### Scenario: Negative tab index

- **WHEN** a pseudo `<span>` has `tabindex="-1"` and receives Enter
- **THEN** it has `tabindex="-1"`, no `role` and is not clicked

### Requirement: Label host

A `<label>` with `kbqLink` SHALL get no role and no `tabindex`, and MUST NOT be activated by the component on Enter or Space: it is reached and activated through its control. A `<label>` that declares a role in the template SHALL get the tab order of any other link.

#### Scenario: Label for a file input

- **WHEN** `kbqLink` is applied to a `<label for="file">` and the label receives Enter
- **THEN** the label has no `role` and no `tabindex` and is not clicked

### Requirement: Button host

A `<button>` with `kbqLink` SHALL be a pseudo link that gets no role from the component and that the component MUST NOT activate on Enter or Space; the native button does.

#### Scenario: Button as a pseudo link

- **WHEN** `kbqLink` is applied to a `<button>`
- **THEN** the button has the `kbq-link_pseudo` class and no `role` attribute

### Requirement: Printed address

The `print` input SHALL set the text printed after the link. An empty string, which a valueless `print` attribute is, SHALL print the resolved `href` without a leading `http://` or `https://` and the `www.` after it. Any other string SHALL be printed as is. Unbound or `null`, nothing SHALL be printed. The text SHALL be exposed in the `data-print` attribute and follow later changes of the `href`, including ones made by `routerLink`.

#### Scenario: Valueless print

- **WHEN** an `<a print>` link has `href="https://www.cvedetails.com/cve/CVE-2019-1020010/"`
- **THEN** its `data-print` is `cvedetails.com/cve/CVE-2019-1020010/`

#### Scenario: Given text

- **WHEN** `print` is `cvedetails.com/cve`
- **THEN** its `data-print` is `cvedetails.com/cve`

#### Scenario: Nothing to print

- **WHEN** `print` is unbound or `null`, or a link without a `href`, such as a pseudo `<span>`, has a valueless `print`
- **THEN** the link has no `data-print` attribute

#### Scenario: Router link

- **WHEN** an `<a print>` link has `routerLink` set to `/docs` and then to `/other` on an application served from `localhost`
- **THEN** its `data-print` is `localhost/docs` and then `localhost/other`

### Requirement: Printed page

When the page is printed, an enabled link with a printed text SHALL show its text without the underline, followed by a colon and, on the next line, the printed text. A disabled link and a link without a printed text MUST NOT print anything after their text.

#### Scenario: Printing a scan report

- **WHEN** a page with `<a print href="https://www.cvedetails.com/cve/CVE-2019-1020010/">CVE-2019-1020010</a>` is printed
- **THEN** the printout reads "CVE-2019-1020010:" and below it "cvedetails.com/cve/CVE-2019-1020010/"

#### Scenario: Disabled link

- **WHEN** a disabled link with `print` is printed
- **THEN** nothing is printed after its text

### Requirement: Focus marking

The link SHALL carry the focus-origin classes `cdk-focused` and `cdk-keyboard-focused`, `cdk-mouse-focused`, `cdk-touch-focused` or `cdk-program-focused` while it or an element inside it has focus, and SHALL draw a focus outline only for keyboard focus.

#### Scenario: Keyboard focus

- **WHEN** a link receives focus from the keyboard and then loses it
- **THEN** it has the `cdk-keyboard-focused` class while focused and loses it on blur

#### Scenario: Focus of a control inside a label

- **WHEN** a `<label kbqLink>` wraps a file input that receives focus from the keyboard
- **THEN** the label has the `cdk-keyboard-focused` class

### Requirement: Tab order

A link on any element but a `<label>` SHALL have `tabindex="0"` by default. The `tabIndex` input, or a `tabindex` attribute written on the element, SHALL set it instead. While the link is disabled its `tabindex` SHALL be `-1`, and the `tabIndex` input SHALL keep the bound value for when it is enabled again.

#### Scenario: Bound tab index

- **WHEN** an enabled link binds `[tabIndex]="5"`
- **THEN** it has `tabindex="5"`

#### Scenario: Disabled link with a tab index

- **WHEN** that link is disabled
- **THEN** it has `tabindex="-1"` and its `tabIndex` input still reads 5

### Requirement: Methods

The link SHALL expose `focus()`, which moves DOM focus to its element, and `getHostElement()`, which returns that element.

#### Scenario: Focusing from code

- **WHEN** a consumer holds the link through `#link="kbqLink"` and calls `link.focus()`
- **THEN** the link element has DOM focus and is the element `link.getHostElement()` returns

### Requirement: Pointer stays on a wrapped link

When the text of a link wraps over several lines, the pointer moving across the gaps between the lines SHALL stay on the link.

#### Scenario: Moving the pointer down a wrapped link

- **WHEN** a link wraps onto several lines and the pointer moves down through the gaps between them
- **THEN** every point between the first and the last line is over the link

### Requirement: Trailing content wraps with the last word

The last word of the text, the external icon and suffix content such as punctuation or a trailing icon SHALL stay on one line together: when they do not fit, they wrap to the next line together. Content inside a suffix element, such as a caption, SHALL still wrap inside it.

#### Scenario: Not enough room for the icon

- **WHEN** a link with an external icon or a suffix icon is narrowed so that its last word still fits on the first line but the icon does not
- **THEN** the text takes two lines and the icon stays on the line of the last word

#### Scenario: Long caption in a suffix

- **WHEN** a block caption marked `kbqLinkSuffix` is longer than the link's container
- **THEN** the caption wraps over several lines within the container

### Requirement: Underline mode

The `underline` input SHALL accept `always`, `hover` and `none`. Unbound, the mode SHALL come from the application-wide options, and without one there it SHALL be `always` for a regular link and `hover` for a pseudo link. The host SHALL carry exactly one class `kbq-link_underline_<mode>`.

#### Scenario: Defaults

- **WHEN** no `underline` is bound and none is provided
- **THEN** a regular link has `kbq-link_underline_always` and a pseudo link has `kbq-link_underline_hover`

#### Scenario: Bound mode

- **WHEN** a link binds `underline` to `none`
- **THEN** it has `kbq-link_underline_none` and neither of the other two underline classes

### Requirement: Underline follows the mode

With `always` the text SHALL be underlined in every state. With `hover` it SHALL be underlined only while the link is hovered or pressed. With `none` it MUST NOT be underlined in any state.

#### Scenario: Pseudo link on hover

- **WHEN** the pointer moves over a pseudo link with the default mode
- **THEN** its text becomes underlined

### Requirement: Visited links

The `useVisited` input SHALL default to the application-wide options (`false` unless provided) and add the `kbq-link_use-visited` class. Only with it SHALL a link that the browser reports as visited, or that carries the `kbq-visited` class, be styled as visited; a disabled link MUST NOT be.

#### Scenario: Visited styling on

- **WHEN** a link has `useVisited` and the `kbq-visited` class
- **THEN** it has the `kbq-link_use-visited` class and the visited color

#### Scenario: Visited styling off by default

- **WHEN** a link has no `useVisited` and no options are provided
- **THEN** it has no `kbq-link_use-visited` class and looks like a link that was not visited

### Requirement: Disabled state

The `disabled` input SHALL add the `kbq-disabled` class and take the link out of the tab order. A host that supports the native attribute, such as a `<button>`, SHALL get `disabled`; an `<a>`, a `<span>` or a `<label>` SHALL get `aria-disabled="true"` instead. A disabled pseudo link SHALL keep its role, and a disabled link SHALL keep its `href`.

#### Scenario: Disabled anchor

- **WHEN** an `<a href>` link is disabled
- **THEN** it has the `kbq-disabled` class, `tabindex="-1"` and `aria-disabled="true"`, and no `disabled` attribute

#### Scenario: Disabled button

- **WHEN** a `<button kbqLink disabled>` is rendered
- **THEN** it has the `disabled` attribute and no `aria-disabled`

### Requirement: Disabled link cannot be activated

While a link is disabled, a click on it or on its content SHALL have its default action prevented and MUST NOT reach any other click listener of the link or its content. A keydown of Enter, Space, ArrowDown, ArrowLeft or ArrowRight SHALL be stopped the same way before other directives on the element see it; other keys SHALL pass. Enabling the link again SHALL restore activation.

#### Scenario: Click on a disabled link

- **WHEN** a disabled link with a click listener is clicked
- **THEN** the click has its default action prevented and the listener is not called

#### Scenario: Keys on a disabled pseudo link

- **WHEN** a disabled pseudo link carries a directive that handles Enter and the user presses Enter
- **THEN** that directive does not receive the key

#### Scenario: Enabled again

- **WHEN** a link is disabled and then enabled again and the user clicks it
- **THEN** its click listener is called

### Requirement: Application-wide defaults

`KBQ_LINK_OPTIONS`, usually provided with `kbqLinkOptionsProvider()`, SHALL supply the defaults of `size`, `underline` and `useVisited`; keys left out SHALL keep the built-in defaults (`normal`, unset, `false`). A provider SHALL apply to the injector subtree it is declared in, and an input bound on a link SHALL win over it.

#### Scenario: Provided defaults

- **WHEN** the provider sets `size: 'compact'`, `underline: 'none'` and `useVisited: true`
- **THEN** a link has `kbq-link_size_compact`, `kbq-link_underline_none` and `kbq-link_use-visited`, and a pseudo link has `kbq-link_underline_none`

#### Scenario: Keys left out

- **WHEN** the provider sets only `size: 'big'`
- **THEN** a link has `kbq-link_size_big` and `kbq-link_underline_always` and no `kbq-link_use-visited`, and a pseudo link has `kbq-link_underline_hover`

#### Scenario: Provider scoped to a component

- **WHEN** a component provides `size: 'big'` and a link outside it provides nothing
- **THEN** the link inside that component has `kbq-link_size_big` and the link outside has `kbq-link_size_normal`

#### Scenario: Input wins over the provider

- **WHEN** the provider sets `size: 'compact'` and a link binds `size` to `big`
- **THEN** that link has `kbq-link_size_big`

### Requirement: Right-to-left layout

In a right-to-left context the prefix SHALL be laid out on the start (right) side of the text and the trailing element on the end (left) side, with the gaps between them mirrored.

#### Scenario: Link with icons in a right-to-left paragraph

- **WHEN** a link with a prefix icon and a suffix icon is rendered under `dir="rtl"`
- **THEN** the prefix icon is right of the text and the suffix icon is left of it

### Requirement: Accessibility checks

A link with prefix and suffix icons, an external link and a pseudo link SHALL each have no axe-core violations.

#### Scenario: Pseudo link

- **WHEN** axe-core checks a rendered pseudo `<span>` link
- **THEN** it reports no violations

### Requirement: NgModule

`KbqLinkModule` SHALL import and export `KbqLink`, `KbqLinkPrefix` and `KbqLinkSuffix` for NgModule consumers.

#### Scenario: Importing the module

- **WHEN** an NgModule imports `KbqLinkModule`
- **THEN** its templates can use `kbqLink`, `kbqLinkPrefix` and `kbqLinkSuffix`
