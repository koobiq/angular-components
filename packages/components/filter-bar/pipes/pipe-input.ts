import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { filter } from 'rxjs/operators';
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
    }

    /** @docs-private */
    // `Event`, not `KeyboardEvent`: Angular types the `keydown.enter` pseudo-event's `$event` as a plain
    // `Event`, and a narrower parameter fails the AOT template check (TS2345).
    protected onEnter(event: Event): void {
        // The bar may live inside a <form>; committing must not submit it.
        event.preventDefault();

        this.commit();
    }

    /** @docs-private */
    protected onBlur(event: FocusEvent): void {
        // kbq-cleaner is focusable, so pressing it blurs the input before its click reaches clearValue.
        // Committing here would emit onChangePipe with the very text the user is discarding — marking the
        // filter changed — right before onClearPipe. The cleaner's click owns that transition.
        if ((event.relatedTarget as HTMLElement | null)?.closest('.kbq-form-field__cleaner')) return;

        this.commit();
    }

    /** clears the pipe and triggers changes */
    override onClear(): void {
        super.onClear();

        // `emitEvent: false` prevents re-entering the bridge above. The value accessor's onChange still
        // runs, so the native input clears on this programmatic path too.
        this.control.reset(null, { emitEvent: false });
    }

    /** focuses the input */
    override open(): void {
        this.input().focus();
    }

    /** Commits the typed value to `data` and notifies the filter-bar. */
    private commit(): void {
        const value = this.control.value || null;

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
