import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    input,
    output,
    TemplateRef,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButton, KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverTrigger } from '@koobiq/components/popover';
import { merge } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { KbqFilterBar } from './filter-bar';
import { KbqFilter, KbqSaveFilterError, KbqSaveFilterEvent, KbqSaveFilterStatuses } from './filter-bar.types';

/**
 * The "save / rename filter" popover, extracted from `KbqFilters` (SRP). Owns the save form state, the
 * name control, validation/error display and the save/rename flow. It declares the popover's header,
 * content and footer templates and pushes them imperatively onto the trigger it is given (via the
 * `popoverTrigger` input), so there is no cross-component template binding on the parent (which would
 * otherwise risk `ExpressionChangedAfterItHasBeenCheckedError`). `KbqFilters` keeps the trigger (on its
 * main button), focus management and the public `filterSavedSuccessfully`/`filterSavedUnsuccessfully` API,
 * delegating to this component.
 *
 * @docs-private
 */
@Component({
    selector: 'kbq-filter-save-popover',
    imports: [ReactiveFormsModule, KbqButtonModule, KbqFormsModule, KbqInputModule, KbqAlertModule],
    template: `
        <ng-template #header>{{ popoverHeader }}</ng-template>

        <ng-template #content>
            @if (showFilterSavingError) {
                <kbq-alert
                    class="layout-margin-bottom-m"
                    role="alert"
                    [alertColor]="'error'"
                    [alertStyle]="'colored'"
                    [compact]="true"
                >
                    {{ filterSavingErrorText }}
                </kbq-alert>
            }
            <div class="kbq-form-vertical">
                <div class="kbq-form__row">
                    <label class="kbq-form__label">{{ localeData.name }}</label>

                    <kbq-form-field class="kbq-form__control">
                        <input
                            #newFilterName
                            kbqInput
                            type="text"
                            [attr.aria-label]="localeData.name"
                            [formControl]="filterName"
                            (keydown.enter)="saveAsNew($event)"
                        />

                        @if (filterName.hasError('filterNameAlreadyExist')) {
                            <kbq-error>{{ localeData.error }}</kbq-error>
                        }
                    </kbq-form-field>
                </div>
            </div>
        </ng-template>

        <ng-template #footer>
            <button
                #saveFilterButton
                kbq-button
                class="layout-margin-right-l"
                [class.kbq-progress]="isSaving"
                [disabled]="isSaving"
                [color]="'contrast'"
                [kbqStyle]="'filled'"
                (click)="saveAsNew()"
            >
                {{ localeData.saveButton }}
            </button>
            <button
                kbq-button
                [color]="'contrast-fade'"
                [kbqStyle]="'filled'"
                [disabled]="isSaving"
                (click)="close(true)"
            >
                {{ localeData.cancelButton }}
            </button>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqFilterSavePopover implements AfterViewInit {
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    /** Popover trigger owned by the parent (`KbqFilters` main button). */
    readonly popoverTrigger = input.required<KbqPopoverTrigger>();
    /** Filter bar, used for the save payload, the current filter and localized strings. */
    readonly filterBar = input.required<KbqFilterBar>();

    /** Emits when the user saves/renames a filter. */
    readonly save = output<KbqSaveFilterEvent>();
    /** Emits when the popover closes; the boolean requests focus restoration by the parent. */
    readonly closed = output<boolean>();

    /** @docs-private */
    readonly headerTemplate = viewChild.required<TemplateRef<unknown>>('header');
    /** @docs-private */
    readonly contentTemplate = viewChild.required<TemplateRef<unknown>>('content');
    /** @docs-private */
    readonly footerTemplate = viewChild.required<TemplateRef<unknown>>('footer');

    private readonly newFilterName = viewChild.required<ElementRef>('newFilterName');
    private readonly saveFilterButton = viewChild.required<KbqButton>('saveFilterButton');

    /** new filter name for saving */
    filterName: FormControl<string | null> = new FormControl<string | null>(null);

    /** true if saving a new filter, false if saving changes in filter */
    saveNewFilter: boolean = false;

    showFilterSavingError: boolean = false;

    /** Custom error text passed to `showError()`; `null` when the locale-derived default should be used. */
    private customErrorText: string | null = null;

    isSaving: boolean = false;

    /** localized data
     * @docs-private */
    get localeData() {
        return this.filterBar().configuration.filters;
    }

    /** localized data
     * @docs-private */
    get filterSavingErrorText(): string {
        return this.customErrorText ?? this.localeData.errorHint;
    }

    /** header of popover. Depends on the mode */
    get popoverHeader(): string {
        return this.saveNewFilter ? this.localeData.saveAsNew : this.localeData.saveChanges;
    }

    ngAfterViewInit(): void {
        // Push the templates onto the parent's trigger imperatively (no parent-side binding).
        const trigger = this.popoverTrigger();

        trigger.header = this.headerTemplate();
        trigger.content = this.contentTemplate();
        trigger.footer = this.footerTemplate();
    }

    openSaveAsNewFilterPopover() {
        this.saveNewFilter = true;

        this.preparePopover();
    }

    openChangeFilterNamePopover() {
        this.saveNewFilter = false;

        this.preparePopover();
    }

    saveAsNew(event?: Event) {
        if (this.filterName.invalid) return;

        const name = this.filterName.value || '';

        // @todo default filter
        // Shallow structural copy (new filter + new pipes array + per-pipe shallow copy), mirroring
        // `KbqFilters.selectFilter`. Avoids `structuredClone` so non-cloneable custom pipe `value`
        // payloads survive a save; every pipe writes `value` by reassignment, never in place.
        const current = this.filterBar().filter();
        const filter: KbqFilter = current
            ? { ...current, pipes: current.pipes.map((pipe) => ({ ...pipe })) }
            : ({ pipes: [] } as unknown as KbqFilter);

        filter.name = name;
        filter.saved = true;
        filter.changed = false;

        this.isSaving = true;
        this.popoverTrigger().preventClose = true;
        this.filterName.disable();

        if (this.saveNewFilter) {
            this.save.emit({ filter, filterBar: this.filterBar(), status: KbqSaveFilterStatuses.NewFilter });
        } else {
            this.save.emit({ filter, filterBar: this.filterBar(), status: KbqSaveFilterStatuses.NewName });
        }

        event?.preventDefault();
    }

    showError(error?: KbqSaveFilterError) {
        if (error?.nameAlreadyExists) {
            this.filterName.setErrors({ filterNameAlreadyExist: true });
        }

        this.showFilterSavingError = true;

        this.customErrorText = error?.text ?? null;
    }

    close = (restoreFocus: boolean = true) => {
        this.popoverTrigger().hide();

        this.closed.emit(restoreFocus);

        setTimeout(() => this.changeDetectorRef.detectChanges());

        this.showFilterSavingError = false;
    };

    /** Hide the popover on a successful save. Focus restoration is handled by the parent. */
    savedSuccessfully() {
        this.isSaving = false;
        this.popoverTrigger().preventClose = false;

        this.popoverTrigger().hide();

        this.changeDetectorRef.markForCheck();
    }

    /** Release the saving state after a failed save (the error itself is shown by the host via `showError`). */
    savedUnsuccessfully() {
        this.isSaving = false;
        this.popoverTrigger().preventClose = false;

        this.filterName.enable();
        // Focus via FocusMonitor (keyboard origin) so the focus ring is preserved on the retry path.
        setTimeout(() => this.saveFilterButton().focusViaKeyboard());

        this.changeDetectorRef.markForCheck();
    }

    private preparePopover() {
        this.filterName = new FormControl<string>(this.filterBar().filter()?.name || '', Validators.required);

        const trigger = this.popoverTrigger();

        trigger.show();

        // Tie to the popover instance (recreated each open) so this per-open control's subscription
        // doesn't accumulate across open/close cycles.
        this.filterName.valueChanges
            .pipe(distinctUntilChanged(), takeUntilDestroyed(trigger.instanceDestroyRef))
            .subscribe(() => (this.showFilterSavingError = false));

        merge(...trigger.defaultClosingActions())
            .pipe(
                filter(() => !this.isSaving),
                takeUntilDestroyed(trigger.instanceDestroyRef)
            )
            .subscribe(() => this.close(false));

        trigger.visibleChange
            .pipe(
                filter((state) => !state),
                takeUntilDestroyed(trigger.instanceDestroyRef)
            )
            .subscribe(this.close);

        setTimeout(() => {
            this.newFilterName().nativeElement.focus();
            this.filterName.setErrors(null);
        });
    }
}
