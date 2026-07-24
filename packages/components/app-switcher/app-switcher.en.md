A menu for switching between applications and platforms.

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

The component uses [Scrollbar](/en/components/scrollbar), so its dependencies must be installed:

```bash
npm install overlayscrollbars@2.7.3
```

</div>
</div>

<!-- example(app-switcher-overview) -->

### Multiple platforms

When the system has multiple platforms, the applications of the selected platform are shown at the top of the list and the platform name is displayed. Other platforms are collapsed at the bottom of the list. 4 or more applications of the same type within a platform are grouped together. The main platform is marked with a badge.

Search appears when more than 7 applications are available. Results are displayed as a flat list.

<!-- example(app-switcher-sites) -->

### Keyboard navigation

The list of applications can be operated entirely from the keyboard.

| <div style="min-width: 270px;">Key</div>                                                        | Action                                                                         |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| <span class="docs-hot-key-button">↑</span> / <span class="docs-hot-key-button">↓</span>         | Move focus to the previous/next item.                                          |
| <span class="docs-hot-key-button">Home</span> / <span class="docs-hot-key-button">End</span>    | Move focus to the first/last item.                                             |
| <span class="docs-hot-key-button">→</span>                                                      | Expand an application group, or open the flyout of another platform.           |
| <span class="docs-hot-key-button">←</span>                                                      | Collapse a group, move from an alias to its group, or close a platform flyout. |
| <span class="docs-hot-key-button">Enter</span> / <span class="docs-hot-key-button">Space</span> | Open the focused application, or expand/collapse a group.                      |
| <span class="docs-hot-key-button">Esc</span>                                                    | Close the switcher.                                                            |

Typing the first letters of an item jumps to it. When search is available, <span class="docs-hot-key-button">↓</span> moves focus from the search field into the list, and <span class="docs-hot-key-button">↑</span> on the first item returns focus to the search field.
