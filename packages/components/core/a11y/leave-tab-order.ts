import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

/**
 * Takes the host of a composite widget out of the tab order whenever `tabOut` emits, and puts it back on the next
 * macrotask, once the browser has moved the focus. A host that hands its focus to an item would otherwise be where
 * Shift+Tab from that item lands, and pass the focus straight back to the item.
 *
 * @param tabOut Emits while Tab leaves the widget, such as `tabOut` of the widget's key manager.
 * @param host Element holding the widget's tab stop.
 * @param renderedTabIndex Tab index the host binding renders, `null` for none. Read when the host is put back.
 * @param destroyRef Lifetime of the widget, which also ends a pending restore.
 * @docs-private
 */
export function kbqLeaveTabOrderOnTabOut(
    tabOut: Observable<void>,
    host: HTMLElement,
    renderedTabIndex: () => number | null,
    destroyRef: DestroyRef
): void {
    let restore: ReturnType<typeof setTimeout> | undefined;

    destroyRef.onDestroy(() => clearTimeout(restore));

    tabOut.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
        // Written to the DOM only: the browser moves the focus as soon as this Tab is handled, before change detection
        // could apply a binding, and the tab index the widget holds may be the consumer's own.
        host.tabIndex = -1;

        // The binding still holds its value and will not write it again, so the restore puts that value back itself.
        clearTimeout(restore);
        restore = setTimeout(() => {
            const tabIndex = renderedTabIndex();

            if (tabIndex === null) {
                host.removeAttribute('tabindex');
            } else {
                host.tabIndex = tabIndex;
            }
        });
    });
}
