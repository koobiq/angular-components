/** Events that a pop-up trigger must ignore in its closing actions. */
const preventHideEvents = new WeakSet<Event>();

/**
 * Marks an event so the base pop-up trigger ignores it in its closing actions. Wiring between entry
 * points, e.g. the radio marks the synthetic click a label re-dispatches on its input.
 *
 * @docs-private
 */
export function kbqMarkEventPreventHide(event: Event): void {
    preventHideEvents.add(event);
}

/**
 * Whether the event is marked with `kbqMarkEventPreventHide`. Accepts any object, since a closing
 * action can emit something that is not a DOM event at all, and only a real `Event` can be marked.
 *
 * @docs-private
 */
export function kbqIsEventPreventHide(event: object): boolean {
    return event instanceof Event && preventHideEvents.has(event);
}
