import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { Subject, timer } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { KbqBasePipe } from './base-pipe';

@Component({
    selector: 'kbq-pipe-input',
    // KbqInputModule re-exports KbqFormFieldModule (KbqFormField, KbqCleaner, KbqTrim).
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input
                autocomplete="off"
                kbqInput
                [attr.aria-label]="data.name"
                [formControl]="control"
                [placeholder]="data.name"
                (blur)="onBlur($event)"
                (keydown.enter)="onEnter($event)"
            />

            <!-- Must stay a single root element: the compiler copies its tag name onto the block's template
                 so it still matches <ng-content select="kbq-cleaner">. A sibling node here (element or text)
                 silently reroutes the cleaner to the form-field's wildcard slot. -->
            @if (data.cleanable) {
                <kbq-cleaner />
            }
        </kbq-form-field>
    `,
    styleUrls: ['base-pipe.scss', 'pipe-input.scss'],
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPipeInputComponent extends KbqBasePipe<string | null> implements OnInit {
    /** @docs-private */
    protected readonly input = viewChild.required(KbqInput);

    /**
     * Input control.
     *
     * Must stay nullable: `reset()` — all `KbqFormField.clearValue()` and its Escape handler ever call —
     * resolves to `defaultValue`, which is `null` only while `nonNullable` is unset. `{ nonNullable: true }`
     * would make `reset()` yield `''` and silently break the cleaner bridge below.
     */
    readonly control = new FormControl<string | null>('');

    /**
     * Debounce in milliseconds between the last keystroke and the typed value being applied to the filter.
     * Matches `defaultEmitValueTimeout` of `kbq-search-expandable`, so both search fields of a bar feel the
     * same. `Enter` and blur apply immediately and cancel a pending apply.
     */
    debounceTime = 200;

    /**
     * Minimum number of characters before typing applies the value to the filter. Anything shorter —
     * including an emptied field — is applied as `null`, so the filter never keeps text the user has
     * already erased. `Enter` and blur ignore the threshold. Set to `0` to apply every keystroke.
     */
    minLength = 3;

    /** Cancels a pending debounced apply once the value has been applied (or cleared) through another path. */
    private readonly cancelPendingApply = new Subject<void>();

    /** Whether the current pipe is empty. Used for apply style modifier */
    override get isEmpty(): boolean {
        // The base checks null/undefined only, so a consumer-seeded `value: ''` would read as non-empty.
        return !this.data.value;
    }

    ngOnInit(): void {
        this.control.setValue(this.data.value ?? '', { emitEvent: false });

        if (this.data.disabled) {
            // `emitEvent: false` is load-bearing: `disable()` re-emits valueChanges with the current value —
            // `null` for an empty pipe — which would trip the bridge below and fire a bogus onClearPipe.
            this.control.disable({ emitEvent: false });
        }

        // Cleaner and Escape bridge. Both `KbqFormField.clearValue()` and its Escape handler only call
        // `ngControl.reset()`, which nulls the control but never touches `data.value`. `reset()` yields null
        // while the view can only ever push a string, so `=== null` isolates those two paths from typing.
        this.control.valueChanges
            .pipe(
                filter((value) => value === null),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => this.onClear());

        // Auto-apply while typing. Seeding above and `disable()` both pass `emitEvent: false`, so a stored
        // value shorter than `minLength` is never wiped just by rendering the pipe.
        this.control.valueChanges
            .pipe(
                // Ahead of the `null` filter on purpose: a `reset()` clears the operator's memory too, so
                // retyping the very same text right after a clear still counts as a change.
                distinctUntilChanged(),
                // Only the view pushes strings; `null` belongs to the clear path handled above.
                filter((value): value is string => value !== null),
                // `switchMap` over a `timer` rather than `debounceTime`: `takeUntil` lets an explicit apply
                // (Enter, blur, clear) drop the pending emission, which would otherwise land afterwards and
                // overwrite the value that was just applied.
                switchMap((value) =>
                    timer(this.debounceTime).pipe(
                        map(() => value),
                        takeUntil(this.cancelPendingApply)
                    )
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((value) => this.commit(value.length >= this.minLength ? value : null));
    }

    /** @docs-private */
    // `Event`, not `KeyboardEvent`: Angular types the `keydown.enter` pseudo-event's `$event` as a plain
    // `Event`, and a narrower parameter fails the AOT template check (TS2345).
    protected onEnter(event: Event): void {
        // The bar may live inside a <form>; committing must not submit it.
        event.preventDefault();

        this.applyNow();
    }

    /** @docs-private */
    protected onBlur(event: FocusEvent): void {
        // kbq-cleaner is focusable, so pressing it blurs the input before its click reaches clearValue.
        // Committing here would emit onChangePipe with the very text the user is discarding — marking the
        // filter changed — right before onClearPipe. The cleaner's click owns that transition.
        if ((event.relatedTarget as HTMLElement | null)?.closest('.kbq-form-field__cleaner')) return;

        this.applyNow();
    }

    /** clears the pipe and triggers changes */
    override onClear(): void {
        // A debounce scheduled by the keystrokes that preceded the clear would put the discarded text
        // straight back into the filter.
        this.cancelPendingApply.next();

        super.onClear();

        // `emitEvent: false` prevents re-entering the bridge above. The value accessor's onChange still
        // runs, so the native input clears on this programmatic path too.
        this.control.reset(null, { emitEvent: false });
    }

    /** focuses the input */
    override open(): void {
        this.input().focus();
    }

    /** Applies the current text right away, bypassing both the debounce and the `minLength` threshold. */
    private applyNow(): void {
        this.cancelPendingApply.next();

        this.commit(this.control.value);
    }

    /** Commits a value to `data` and notifies the filter-bar. */
    private commit(next: string | null): void {
        const value = next || null;

        // `?? null` rather than a plain `===`: a pipe added from a template has no `value` key at all
        // (pipe-add spreads a KbqPipeTemplate = Omit<KbqPipe, 'value'>), so `data.value` is undefined and
        // `undefined === null` is false — letting an untouched blur emit onChangePipe and mark the filter
        // changed.
        if ((this.data.value ?? null) === value) return;

        this.data.value = value;

        this.stateChanges.next();

        this.filterBar?.onChangePipe.emit(this.data);
    }
}
