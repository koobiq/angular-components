import { Directive } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map, merge } from 'rxjs';
import { kbqInjectNativeElement } from '../utils';

/**
 * Directive that adds a `kbq-hovered` class to an element, based on its hover state.
 */
@Directive({
    standalone: true,
    selector: '[kbqHovered]',
    exportAs: 'kbqHovered',
    host: {
        '[class.kbq-hovered]': 'hovered()'
    }
})
export class KbqHovered {
    private readonly element = kbqInjectNativeElement();

    /**
     * Whether the element is hovered.
     */
    readonly hovered = toSignal(
        merge(
            fromEvent<MouseEvent>(this.element, 'mouseenter'),
            fromEvent<MouseEvent>(this.element, 'mouseleave')
        ).pipe(map(({ type }) => type === 'mouseenter')),
        { initialValue: false }
    );
}
