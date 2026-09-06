Clamped List displays long lists compactly, hides items that do not fit the configured limit, and lets users expand the full content.

### Clamped list

By default, 10 items are shown and the rest are hidden. If the hidden portion contains fewer than 6 items, the full list is displayed. These parameters can be changed if needed.

<!-- example(clamped-list-overview) -->

List items can be inline. For compactness, a short label is used on the expand button.

<!-- example(clamped-list) -->

A multi-line list with a centered dot as a separator. The label on the text button is capitalized.

<!-- example(clamped-list-dotted) -->

### Inputs

`kbqClampedList` is a directive: put it on the element that wraps the items, and read the rendered slice back through a template reference (`#list="kbqClampedList"`).

| Name                    | Type      | Default | Description                                                                                |
| ----------------------- | --------- | ------- | ------------------------------------------------------------------------------------------ |
| `items`                 | `T[]`     | `[]`    | The full list. `visibleItems()` is what you render.                                        |
| `collapsedVisibleCount` | `number`  | `10`    | How many items stay visible while collapsed.                                               |
| `hiddenThreshold`       | `number`  | `6`     | How many items must be hidden before the trigger is worth showing.                         |
| `isCollapsed`           | `boolean` | `true`  | Collapsed state, two-way bindable as `[(isCollapsed)]`. `isCollapsedChange` is its output. |

Read-only members for the template:

| Name                    | Type           | Description                                                                   |
| ----------------------- | -------------- | ----------------------------------------------------------------------------- |
| `visibleItems()`        | `T[]`          | The slice to render: truncated while collapsed, the full list otherwise.      |
| `exceededItemCount()`   | `number`       | How many items the collapsed state hides.                                     |
| `hasToggle()`           | `boolean`      | Whether enough items are hidden to render the trigger.                        |
| `showMoreCountText()`   | `string`       | Localized "show more" label with the hidden count already interpolated.       |
| `localeConfiguration()` | locale strings | `openText`, `closeText`, `showMoreText` and `moreText` for the active locale. |

`moreText` is a convenience string for a short trigger label ("25 more") — the directive never renders it itself.

### Writing a custom trigger

The trigger is yours to place, but not to make accessible: put `kbqClampedListTrigger` on it and the directive supplies `role="button"`, `tabindex="0"`, `aria-expanded` and an `aria-controls` pointing at the list. Do not write those attributes by hand, and do not reach for a bare `<a>` without them — `kbqClampedListTrigger` is what turns the element into a disclosure control.

<!-- prettier-ignore -->
```html
<div #list="kbqClampedList" kbqClampedList [items]="items">
    @for (item of list.visibleItems(); track item) {
        <span>{{ item }}</span>
    }

    @if (list.hasToggle()) {
        <a kbq-link kbqClampedListTrigger pseudo>
            {{ list.isCollapsed() ? list.showMoreCountText() : list.localeConfiguration().closeText }}
        </a>
    }
</div>
```

The trigger carries no spacing of its own — lay it out with the list like any other item.

> The API tab of this page is shared with **Clamped text**: both components ship from the `@koobiq/components/clamped-text` entry point, because they share the trigger directive, the `KbqClampedRoot` contract and one locale section.
