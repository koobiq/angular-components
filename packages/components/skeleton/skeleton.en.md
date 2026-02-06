`KbqSkeleton` is a temporary placeholder that occupies the space of the loading element and displays its approximate layout while the actual content is still loading.

<!-- example(skeleton-overview) -->

### Usage examples

#### Panel loading

Skeletons are also useful when opening a side panel with loading content.

<!-- example(skeleton-in-sidepanel) -->

### Guidelines

Use:

- When waiting for page content to load and display, to provide a sense of page structure and minimize layout shifts.
- If the page load takes 2 to 10 seconds, use skeletons.

Don't use:

- If loading takes less than 1 second, no loading indicators are needed.
- If you need to show loading for a single element, such as a video, use a [progress spinner](en/components/progress-spinner). Skeletons are better suited for full-page loading.
- For long-running processes such as file conversion or data upload/download, use [progress bars](en/components/progress-bar) or [progress spinners](en/components/progress-spinner). It's recommended to display the remaining time next to the progress bar.
