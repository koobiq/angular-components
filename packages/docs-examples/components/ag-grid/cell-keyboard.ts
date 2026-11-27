import type { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent } from 'rxjs';

// The grid keeps focus on the cell itself and Tab never reaches the controls inside it,
// so Enter on the focused cell is handled instead.
export const exampleOnCellEnter = (
    cell: HTMLElement,
    destroyRef: DestroyRef,
    callback: (event: KeyboardEvent) => void
): void => {
    fromEvent<KeyboardEvent>(cell, 'keydown')
        .pipe(
            filter(({ key, target }) => key === 'Enter' && target === cell),
            takeUntilDestroyed(destroyRef)
        )
        .subscribe(callback);
};
