import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';

@Component({
    selector: 'e2e-loader-overlay-states',
    imports: [KbqLoaderOverlayModule],
    template: `
        <!-- Base -->
        <div>
            Content
            <kbq-loader-overlay size="compact" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="normal" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="big" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="big" [transparent]="false" />
        </div>

        <!-- With text -->
        <div>
            Content
            <kbq-loader-overlay text="Text" size="compact" />
        </div>
        <div>
            Content
            <kbq-loader-overlay text="Text" size="normal" />
        </div>
        <div>
            Content
            <kbq-loader-overlay text="Text" size="big" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="big" text="Text" [transparent]="false" />
        </div>

        <!-- With text and caption -->
        <div>
            Content
            <kbq-loader-overlay text="Text" size="compact" caption="Caption" />
        </div>
        <div>
            Content
            <kbq-loader-overlay text="Text" size="normal" caption="Caption" />
        </div>
        <div>
            Content
            <kbq-loader-overlay text="Text" size="big" caption="Caption" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="big" text="Text" caption="Caption" [transparent]="false" />
        </div>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(4, 1fr);
            gap: var(--kbq-size-xxs);
        }

        div {
            width: 170px;
            height: 170px;
            border: 1px dashed;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLoaderOverlayStates'
    }
})
export class E2eLoaderOverlayStates {}

@Component({
    selector: 'e2e-loader-overlay-background',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="example__item example__item_bg">
            <div class="example__content">
                <p class="example__paragraph kbq-text-normal">
                    Content behind the overlay becomes barely visible, as if hidden in fog. The interface remains
                    recognizable while loading continues, but the main actions are temporarily unavailable.
                </p>
                <p class="example__paragraph example__paragraph_fade kbq-text-normal">
                    The overlay blends seamlessly with the background, leaving no visible boundary around its edges.
                    Matching the overlay color to the surface keeps the container connected to the surrounding
                    interface.
                </p>
            </div>
            <kbq-loader-overlay class="example__overlay" size="compact" text="bg" surface="bg" />
        </div>
        <div class="example__item example__item_bg-secondary">
            <div class="example__content">
                <p class="example__paragraph kbq-text-normal">
                    Content behind the overlay becomes barely visible, as if hidden in fog. The interface remains
                    recognizable while loading continues, but the main actions are temporarily unavailable.
                </p>
                <p class="example__paragraph example__paragraph_fade kbq-text-normal">
                    The overlay blends seamlessly with the background, leaving no visible boundary around its edges.
                    Matching the overlay color to the surface keeps the container connected to the surrounding
                    interface.
                </p>
            </div>
            <kbq-loader-overlay class="example__overlay" size="compact" text="bg-secondary" surface="bg-secondary" />
        </div>
        <div class="example__item example__item_bg-tertiary">
            <div class="example__content">
                <p class="example__paragraph kbq-text-normal">
                    Content behind the overlay becomes barely visible, as if hidden in fog. The interface remains
                    recognizable while loading continues, but the main actions are temporarily unavailable.
                </p>
                <p class="example__paragraph example__paragraph_fade kbq-text-normal">
                    The overlay blends seamlessly with the background, leaving no visible boundary around its edges.
                    Matching the overlay color to the surface keeps the container connected to the surrounding
                    interface.
                </p>
            </div>
            <kbq-loader-overlay class="example__overlay" size="compact" text="bg-tertiary" surface="bg-tertiary" />
        </div>
        <div class="example__item example__item_card">
            <div class="example__content">
                <p class="example__paragraph kbq-text-normal">
                    Content behind the overlay becomes barely visible, as if hidden in fog. The interface remains
                    recognizable while loading continues, but the main actions are temporarily unavailable.
                </p>
                <p class="example__paragraph example__paragraph_fade kbq-text-normal">
                    The overlay blends seamlessly with the background, leaving no visible boundary around its edges.
                    Matching the overlay color to the surface keeps the container connected to the surrounding
                    interface.
                </p>
            </div>
            <kbq-loader-overlay class="example__overlay" size="compact" text="card" surface="card" />
        </div>
        <div class="example__item example__item_bg">
            <div class="example__content">
                <p class="example__paragraph kbq-text-normal">
                    Content behind the overlay becomes barely visible, as if hidden in fog. The interface remains
                    recognizable while loading continues, but the main actions are temporarily unavailable.
                </p>
                <p class="example__paragraph example__paragraph_fade kbq-text-normal">
                    The overlay blends seamlessly with the background, leaving no visible boundary around its edges.
                    Matching the overlay color to the surface keeps the container connected to the surrounding
                    interface.
                </p>
            </div>
            <kbq-loader-overlay class="example__overlay" size="compact" text="solid" surface="solid" />
        </div>
    `,
    styles: `
        :host {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 20px;

            --example-padding: var(--kbq-size-l);
            --example-overlay-transition-duration: 200ms;
            --example-overlay-transition-easing: cubic-bezier(0.23, 1, 0.32, 1);
        }

        .example__item {
            --example-overlay-size-reduction: 0px;
            --example-overlay-inset-y: 0px;
            --example-overlay-inset-x: 0px;

            display: flex;
            flex-direction: column;
            min-width: 0;
            aspect-ratio: 16 / 9;
            box-sizing: border-box;
            padding: var(--example-padding) var(--example-padding) 0;
            border-radius: var(--kbq-size-m);
            grid-column: span 2;
        }

        .example__item:nth-child(5) {
            grid-column: 2 / span 2;
        }

        @media (max-width: 600px) {
            :host {
                grid-template-columns: 1fr;
            }

            .example__item,
            .example__item:nth-child(5) {
                grid-column: auto;
            }
        }

        .example__overlay {
            inset: var(--example-overlay-inset-y) auto auto var(--example-overlay-inset-x);
            width: calc(100% - var(--example-overlay-size-reduction));
            height: calc(100% - var(--example-overlay-size-reduction));
            box-sizing: border-box;
            transition:
                top var(--example-overlay-transition-duration) var(--example-overlay-transition-easing),
                left var(--example-overlay-transition-duration) var(--example-overlay-transition-easing),
                width var(--example-overlay-transition-duration) var(--example-overlay-transition-easing),
                height var(--example-overlay-transition-duration) var(--example-overlay-transition-easing);
        }

        @media (hover: hover) and (pointer: fine) {
            .example__item:hover {
                --example-overlay-size-reduction: var(--example-padding);
                --example-overlay-inset-y: calc(var(--example-padding) * -1);
                --example-overlay-inset-x: calc(var(--example-padding) * 2);
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .example__overlay {
                transition: none;
            }
        }

        .example__content {
            flex: 1;
            overflow: hidden;
        }

        .example__paragraph {
            margin: 0;
        }

        .example__paragraph + .example__paragraph {
            margin-top: 4px;
        }

        .example__paragraph_fade {
            color: var(--kbq-foreground-contrast-secondary);
        }

        .example__item_bg {
            background: var(--kbq-background-bg);
        }

        .example__item_bg-secondary {
            background: var(--kbq-background-bg-secondary);
        }

        .example__item_bg-tertiary {
            background: var(--kbq-background-bg-tertiary);
        }

        .example__item_card {
            background: var(--kbq-background-card);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLoaderOverlayBackground'
    }
})
export class E2eLoaderOverlayBackground {}

@Component({
    selector: 'e2e-loader-overlay-card',
    imports: [KbqButtonModule, KbqLoaderOverlayModule],
    template: `
        <button data-testid="e2eOpenModalWithLoader" (click)="open()">Open modal</button>

        <ng-template #modalContent>
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text
            <kbq-loader-overlay text="Loading data..." size="compact" [card]="true" />
        </ng-template>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 350px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLoaderOverlayCard'
    }
})
export class E2eLoaderOverlayCard {
    private readonly modalContent = viewChild.required<TemplateRef<any>>('modalContent');

    private readonly modal = inject(KbqModalService);

    protected open(): void {
        this.modal.create({
            kbqTitle: 'Loading data',
            kbqContent: this.modalContent(),
            kbqOkText: 'Close',
            kbqSize: ModalSize.Small
        });
    }
}
