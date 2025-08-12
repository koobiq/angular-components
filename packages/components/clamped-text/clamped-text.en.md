The `Clamped Text` component displays only part of a long text and adds an “Expand” button.
When clicked, the full text appears. At the bottom, there’s a “Collapse” button to hide the extra text again.

<!-- example(clamped-text-overview) -->

If the hidden part would only contain one line, the component doesn’t hide it behind the button — it just shows it right away.
Collapsing in this case wouldn’t make sense, because the expanded text would be the same height as the “Expand” button itself.
