Tabs divide content into groups and allow you to switch between them without reloading the page.

<!-- example(tabs-overview) -->

### States

#### Vertical tabs

You can place a long list of tabs vertically so all elements can be visible without scrolling. To enable the function, use the `vertical` attribute.

<!-- example(tabs-vertical) -->

You can use untitled vertical tabs. In this case, add a tooltip for icons to clarify the name of each section.

<!-- example(tabs-vertical-icons) -->

#### Underlined tabs

Use the `underlined` attribute.

<!-- example(tabs-underlined) -->

#### Disabled

A disabled tab can't be selected. It doesn't have interactive states.

<!-- example(tabs-disabled) -->

#### Empty tab

To specify that a tab is empty, use the `empty` attribute. You can select such a tab, and it has interactive states.

<!-- example(tabs-empty-label) -->

Don't use empty tabs together with inactive tabs. They look similar, which may confuse users.

#### Scroll

When there isn't enough place for tabs in a single row, they aren't placed in the next row. Instead, they gradually get hidden with the option to show elements outside the visible area.

<!-- example(tabs-with-scroll) -->

When there isn't enough place for vertical tabs, a scrollbar appears.

<!-- example(tabs-with-scroll-vertical) -->

#### Adjusting to the container width

By default, the width of horizontal tabs depends on the text inside them. If necessary, the panel with tabs can match the container width. For this, use the `kbq-stretch-tabs` attribute.

<!-- example(tabs-stretch) -->

### Customizable tab design

You can configure how tabs look according to your product design using the `kbq-tab-label` directive.

<!-- example(tabs-custom-label) -->

### Tabs and navigation

Unlike `KbqTabGroup`, `KbqTabNavBar` is used for navigation between application pages or sections (using `routerLink`).

<!-- example(tabs-nav-bar-overview) -->

### Hot keys

| <span style="min-width: 140px;">Key</span>                                                      | Action                             |
| ----------------------------------------------------------------------------------------------- | ---------------------------------- |
| <span class="docs-hot-key-button">←</span>                                                      | Move the focus to the previous tab |
| <span class="docs-hot-key-button">→</span>                                                      | Move the focus to the next tab     |
| <span class="docs-hot-key-button">Home</span>                                                   | Move the focus to the first tab    |
| <span class="docs-hot-key-button">End</span>                                                    | Move the focus to the last tab     |
| <span class="docs-hot-key-button">Space</span> / <span class="docs-hot-key-button">Enter</span> | Select the tab in focus            |

### Recommendations

Use tabs in the following cases:

- For content navigation on a page when it's vital to have quick access to separate parts.
- For additional navigation.

Don't use tabs in the following cases:

- When you can place all content on a single page or screen. There's no need to hide some of its parts under tabs.
- For selecting values in forms. Don't confuse tabs with input boxes: [radio buttons](/en/components/radio) and [button toggles](/en/components/button-toggle).
- For main navigation. Use the [Navbar](/en/components/navbar) component instead.
- When you need to change the view for the same type of data (list, tile, or table). Instead, use a [button menu](/en/components/dropdown) or [button toggle](/en/components/button-toggle).
- When there's already content in a tab. You can't use both vertical and horizontal tabs at the same time. Instead, use fewer tabs, use only one type of tab, a button toggle, or button menu.
- If there's only one tab, you don't need a panel with tabs.
- For indicating steps in the form master. Tabs have a similar appearance to steps. To make sure that there is no confusion, a designer must use different styles for these elements. It's useful to leave a comment for a developer as well. For example: Note that these are form steps, not tabs.
