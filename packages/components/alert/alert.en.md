Shows important information on a page. Can contain a hint, signal a status change, or indicate a problem.

### Size

Alerts come in two sizes. The normal size is the default; pass `[compact]="true"` for the denser compact size used in tight spaces such as popovers and forms.

<!-- example(alert-overview) -->

### Variant

By default, alerts are styled conservatively and stand out only by the icon color. If the block gets lost on screen, you can draw attention to it using the colored background variant.

<!-- example(alert-variants) -->

### Status

The `alertColor` input sets the status: `error`, `warning`, `success` or `info` (the default). It drives the background in the colored variant and auto-tints a projected status icon that has no explicit `[color]`: the icon is tinted to the matching status color, except `info`, which is tinted to `contrast`. Set `[color]` on the icon yourself to opt out of the auto-tint.

<!-- example(alert-status) -->

### Hide

The block can be hidden by clicking the icon button in the corner of the alert. The alert does not hide itself — listen to the `(closed)` output (emitted when the close control is activated) and remove or hide the alert in your own code. If the system reports a problem, the alert is displayed permanently and the user cannot close it.

<!-- example(alert-close) -->

### Content

The alert can contain links and buttons; the icon and heading can be omitted. In a lengthy notification, the text can be split into paragraphs.

<!-- example(alert-content) -->

### Accessibility

- **Static alerts.** The host applies only CSS classes and no ARIA role, which is correct for an alert rendered with the page: forcing `role="alert"` would make a screen reader announce page-load content unexpectedly.
- **Dynamically shown alerts.** When an alert appears in response to a user action (a validation error, a status change), add `role="alert"` for urgent messages, or `aria-live="polite"` with `aria-atomic="true"` for non-urgent status, so assistive technology announces it. Alternatively, announce the message with `LiveAnnouncer` from `@angular/cdk/a11y`.
- **Status by icon alone.** The status is conveyed by the icon color, which is not perceivable by every user. Repeat the severity in the title or body text (or add visually hidden text, e.g. `<span class="cdk-visually-hidden">Error:</span>`), and mark a decorative status icon `aria-hidden="true"`.
- **Close control.** Put the close button on a native `<button>` with an accessible name (`aria-label="Close"`) so it is reachable and operable by keyboard.
- **Focus on dismiss.** Dismissing an alert while focus is on its close control drops focus to `<body>`. Move focus to a logical target after removal — prefer `FocusMonitor.focusVia` from `@angular/cdk/a11y` so the focus ring is preserved.
