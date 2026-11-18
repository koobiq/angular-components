/** A click the page handles itself; with a modifier the browser opens the link in a new tab or window, as it should. */
export const docsNextIsPlainClick = (event: MouseEvent): boolean =>
    event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
