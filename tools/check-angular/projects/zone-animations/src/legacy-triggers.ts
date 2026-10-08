import { animate, AnimationEvent, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelModule, KbqSidepanelService } from '@koobiq/components/sidepanel';

/** One phase of an application trigger, as its `(@trigger.start)` / `(@trigger.done)` callback reports it. */
export interface LegacyAnimationRecord {
    trigger: string;
    phase: string;
    from: string;
    to: string;
}

/**
 * A page that animates with `@angular/animations` itself: a filter bar that fades in and out around a
 * `kbq-select` and a dropdown, a badge that pops inside a dropdown item, a sidepanel whose content fades in,
 * and `[@.disabled]` over the page.
 */
@Component({
    selector: 'check-legacy-triggers',
    imports: [
        ReactiveFormsModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqDropdownModule,
        KbqSidepanelModule
    ],
    animations: [
        trigger('fade', [
            transition(':enter', [style({ opacity: 0 }), animate('150ms ease-out', style({ opacity: 1 }))]),
            // The start is explicit: jsdom computes no `opacity`, and the engine never removes a leaving element
            // whose start style computes empty.
            transition(':leave', [style({ opacity: 1 }), animate('100ms ease-in', style({ opacity: 0 }))])
        ]),
        trigger('pop', [
            transition(':enter', [style({ transform: 'scale(0.5)' }), animate('120ms', style({ transform: 'none' }))])
        ])
    ],
    template: `
        <div class="check-legacy-page" [@.disabled]="motionOff()">
            <button kbq-button class="check-legacy-toggle" (click)="filtersShown.set(!filtersShown())">Filters</button>
            <button kbq-button class="check-legacy-open-details" (click)="openDetails()">Details</button>

            @if (filtersShown()) {
                <section
                    class="check-legacy-filters"
                    @fade
                    (@fade.start)="record($event)"
                    (@fade.done)="record($event)"
                >
                    <kbq-form-field>
                        <kbq-select
                            placeholder="Status"
                            [formControl]="status"
                            (openedChange)="selectOpenedChanges.update((changes) => [...changes, $event])"
                        >
                            @for (option of statuses; track option) {
                                <kbq-option [value]="option">{{ option }}</kbq-option>
                            }
                        </kbq-select>
                    </kbq-form-field>

                    <button
                        kbq-button
                        class="check-legacy-actions"
                        [kbqDropdownTriggerFor]="actionsDropdown"
                        (dropdownOpened)="dropdownEvents.update((events) => [...events, 'opened'])"
                        (dropdownClosed)="dropdownEvents.update((events) => [...events, 'closed'])"
                    >
                        Actions
                    </button>

                    <kbq-dropdown #actionsDropdown="kbqDropdown">
                        @for (action of actions; track action) {
                            <button kbq-dropdown-item (click)="lastAction.set(action)">
                                {{ action }}
                                @if (action === lastAction()) {
                                    <span
                                        class="check-legacy-badge"
                                        @pop
                                        (@pop.start)="record($event)"
                                        (@pop.done)="record($event)"
                                    >
                                        last
                                    </span>
                                }
                            </button>
                        }
                    </kbq-dropdown>
                </section>
            }
        </div>

        <ng-template #details>
            <kbq-sidepanel-header>Details</kbq-sidepanel-header>
            <kbq-sidepanel-body>
                <p class="check-legacy-note" @fade (@fade.start)="record($event)" (@fade.done)="record($event)">
                    Status: {{ status.value ?? 'any' }}
                </p>
            </kbq-sidepanel-body>
            <kbq-sidepanel-footer>
                <kbq-sidepanel-actions>
                    <button kbq-button kbq-sidepanel-close class="check-legacy-close-details">Close</button>
                </kbq-sidepanel-actions>
            </kbq-sidepanel-footer>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegacyTriggersScenario {
    readonly filtersShown = signal(false);
    readonly motionOff = signal(false);

    readonly statuses = ['Open', 'In progress', 'Closed'];
    readonly status = new FormControl<string | null>(null);
    readonly selectOpenedChanges = signal<boolean[]>([]);

    readonly actions = ['Export', 'Archive'];
    readonly lastAction = signal<string | null>(null);
    readonly dropdownEvents = signal<string[]>([]);

    readonly animations = signal<LegacyAnimationRecord[]>([]);
    readonly detailsOpened = signal(0);
    readonly detailsClosed = signal(0);

    private readonly sidepanel = inject(KbqSidepanelService);
    private readonly details = viewChild.required<TemplateRef<unknown>>('details');

    protected openDetails(): void {
        const ref = this.sidepanel.open(this.details());

        ref.afterOpened().subscribe(() => this.detailsOpened.update((count) => count + 1));
        ref.afterClosed().subscribe(() => this.detailsClosed.update((count) => count + 1));
    }

    protected record({ triggerName, phaseName, fromState, toState }: AnimationEvent): void {
        this.animations.update((records) => [
            ...records,
            { trigger: triggerName, phase: phaseName, from: fromState, to: toState }
        ]);
    }
}
