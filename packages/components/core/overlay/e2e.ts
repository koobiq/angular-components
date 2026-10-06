import { CdkScrollable } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, KbqOverlayLayer } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopBarModule } from '@koobiq/components/top-bar';

const OPTIONS = ['Network Watcher', 'Firewall Sentinel', 'Threat Hunter', 'Malware Sentry'];

/**
 * A select opened from the content under a sticky bar, and a dropdown opened from the bar: the first one slides
 * under the bar while the content scrolls, the second one paints over it.
 */
@Component({
    selector: 'e2e-overlay-layer-sticky-bar',
    imports: [
        CdkScrollable,
        KbqButtonModule,
        KbqDropdownModule,
        KbqFormFieldModule,
        KbqOverlayLayer,
        KbqSelectModule,
        KbqTopBarModule
    ],
    template: `
        <div class="e2e-overlay-layer-sticky-bar__scroller" data-testid="e2eOverlayLayerScroller" cdkScrollable>
            <kbq-top-bar [withShadow]="true">
                <div kbqTopBarContainer placement="start">
                    <div class="kbq-title kbq-truncate-line">Dashboards</div>
                </div>

                <div kbqTopBarSpacer></div>

                <div kbqTopBarContainer placement="end">
                    <button
                        kbq-button
                        data-testid="e2eOverlayLayerBarTrigger"
                        [color]="componentColors.Contrast"
                        [kbqDropdownTriggerFor]="barDropdown"
                    >
                        Actions
                    </button>

                    <kbq-dropdown #barDropdown="kbqDropdown" xPosition="before">
                        <button kbq-dropdown-item>Rename</button>
                        <button kbq-dropdown-item>Duplicate</button>
                        <button kbq-dropdown-item>Delete</button>
                    </kbq-dropdown>
                </div>
            </kbq-top-bar>

            <div class="e2e-overlay-layer-sticky-bar__content" data-testid="e2eOverlayLayerContent" kbqOverlayLayer>
                <kbq-form-field>
                    <kbq-select data-testid="e2eOverlayLayerSelect" [value]="options[0]">
                        @for (option of options; track option) {
                            <kbq-option [value]="option">{{ option }}</kbq-option>
                        }
                    </kbq-select>
                </kbq-form-field>

                @for (row of rows; track row) {
                    <p class="e2e-overlay-layer-sticky-bar__row">Row {{ row }}</p>
                }
            </div>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xxs);
            max-width: 550px;
        }

        .e2e-overlay-layer-sticky-bar__scroller {
            height: 240px;
            overflow-y: auto;
        }

        .kbq-top-bar {
            --kbq-top-bar-inset-block-start: 0;
        }

        .e2e-overlay-layer-sticky-bar__content {
            padding: var(--kbq-size-m) var(--kbq-size-xxl);
        }

        .e2e-overlay-layer-sticky-bar__row {
            margin: 0;
            padding: var(--kbq-size-m) 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eOverlayLayerStickyBar'
    }
})
export class E2eOverlayLayerStickyBar {
    protected readonly options = OPTIONS;
    protected readonly rows = Array.from({ length: 12 }, (_, index) => index + 1);
    protected readonly componentColors = KbqComponentColors;
}

/** Overlays opened from inside the marked element that have to stay in the application-wide container. */
@Component({
    selector: 'e2e-overlay-layer-global-overlays',
    imports: [
        KbqButtonModule,
        KbqFormFieldModule,
        KbqOverlayLayer,
        KbqPopoverModule,
        KbqSelectModule,
        KbqToolTipModule
    ],
    template: `
        <div class="e2e-overlay-layer-global-overlays__content" data-testid="e2eOverlayLayerContent" kbqOverlayLayer>
            <button kbq-button data-testid="e2eOverlayLayerTooltipTrigger" kbqTooltip="Tooltip">Tooltip</button>

            <button kbq-button data-testid="e2eOverlayLayerModalTrigger" (click)="openModal()">Modal</button>

            <button
                kbq-button
                data-testid="e2eOverlayLayerPopoverTrigger"
                kbqPopover
                [kbqPopoverContent]="popoverContent"
            >
                Popover
            </button>

            <ng-template #popoverContent>
                <kbq-form-field>
                    <kbq-select data-testid="e2eOverlayLayerPopoverSelect" [value]="options[0]">
                        @for (option of options; track option) {
                            <kbq-option [value]="option">{{ option }}</kbq-option>
                        }
                    </kbq-select>
                </kbq-form-field>
            </ng-template>

            <ng-template #modalContent>
                <kbq-form-field>
                    <kbq-select data-testid="e2eOverlayLayerModalSelect" [value]="options[0]">
                        @for (option of options; track option) {
                            <kbq-option [value]="option">{{ option }}</kbq-option>
                        }
                    </kbq-select>
                </kbq-form-field>
            </ng-template>
        </div>
    `,
    styles: `
        .e2e-overlay-layer-global-overlays__content {
            display: flex;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eOverlayLayerGlobalOverlays'
    }
})
export class E2eOverlayLayerGlobalOverlays {
    private readonly modalService = inject(KbqModalService);
    private readonly modalContent = viewChild.required<TemplateRef<object>>('modalContent');

    protected readonly options = OPTIONS;

    protected openModal(): void {
        this.modalService.create({ kbqTitle: 'Modal', kbqContent: this.modalContent() });
    }
}
