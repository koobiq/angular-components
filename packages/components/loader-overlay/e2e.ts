import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLoaderOverlayModule, KbqLoaderOverlaySurface } from '@koobiq/components/loader-overlay';
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
        @for (surface of surfaces; track surface.value) {
            <div class="e2e-loader-overlay-background__item {{ surface.surfaceClass }}">
                <div class="e2e-loader-overlay-background__content">
                    <p class="e2e-loader-overlay-background__paragraph kbq-text-normal">{{ content }}</p>
                    <p
                        class="e2e-loader-overlay-background__paragraph e2e-loader-overlay-background__paragraph_fade kbq-text-normal"
                    >
                        {{ contentFade }}
                    </p>
                </div>
                <kbq-loader-overlay
                    class="e2e-loader-overlay-background__overlay"
                    size="compact"
                    [text]="surface.value"
                    [surface]="surface.value"
                />
            </div>
        }
    `,
    styles: `
        :host {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 20px;

            --e2e-padding: var(--kbq-size-l);
            --e2e-overlay-transition-duration: 200ms;
            --e2e-overlay-transition-easing: cubic-bezier(0.23, 1, 0.32, 1);
        }

        .e2e-loader-overlay-background__item {
            --e2e-overlay-size-reduction: 0px;
            --e2e-overlay-inset-y: 0px;
            --e2e-overlay-inset-x: 0px;

            display: flex;
            flex-direction: column;
            min-width: 0;
            aspect-ratio: 16 / 9;
            box-sizing: border-box;
            padding: var(--e2e-padding) var(--e2e-padding) 0;
            border-radius: var(--kbq-size-m);
            grid-column: span 2;
        }

        .e2e-loader-overlay-background__item:nth-child(5) {
            grid-column: 2 / span 2;
        }

        @media (max-width: 600px) {
            :host {
                grid-template-columns: 1fr;
            }

            .e2e-loader-overlay-background__item,
            .e2e-loader-overlay-background__item:nth-child(5) {
                grid-column: auto;
            }
        }

        .e2e-loader-overlay-background__overlay {
            inset: var(--e2e-overlay-inset-y) auto auto var(--e2e-overlay-inset-x);
            width: calc(100% - var(--e2e-overlay-size-reduction));
            height: calc(100% - var(--e2e-overlay-size-reduction));
            box-sizing: border-box;
            transition:
                top var(--e2e-overlay-transition-duration) var(--e2e-overlay-transition-easing),
                left var(--e2e-overlay-transition-duration) var(--e2e-overlay-transition-easing),
                width var(--e2e-overlay-transition-duration) var(--e2e-overlay-transition-easing),
                height var(--e2e-overlay-transition-duration) var(--e2e-overlay-transition-easing);
        }

        @media (hover: hover) and (pointer: fine) {
            .e2e-loader-overlay-background__item:hover {
                --e2e-overlay-size-reduction: var(--e2e-padding);
                --e2e-overlay-inset-y: calc(var(--e2e-padding) * -1);
                --e2e-overlay-inset-x: calc(var(--e2e-padding) * 2);
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .e2e-loader-overlay-background__overlay {
                transition: none;
            }
        }

        .e2e-loader-overlay-background__content {
            flex: 1;
            overflow: hidden;
        }

        .e2e-loader-overlay-background__paragraph {
            margin: 0;
        }

        .e2e-loader-overlay-background__paragraph + .e2e-loader-overlay-background__paragraph {
            margin-top: 4px;
        }

        .e2e-loader-overlay-background__paragraph_fade {
            color: var(--kbq-foreground-contrast-secondary);
        }

        .e2e-loader-overlay-background__item_bg {
            background: var(--kbq-background-bg);
        }

        .e2e-loader-overlay-background__item_bg-secondary {
            background: var(--kbq-background-bg-secondary);
        }

        .e2e-loader-overlay-background__item_bg-tertiary {
            background: var(--kbq-background-bg-tertiary);
        }

        .e2e-loader-overlay-background__item_card {
            background: var(--kbq-background-card);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLoaderOverlayBackground'
    }
})
export class E2eLoaderOverlayBackground {
    protected readonly content =
        'Content behind the overlay becomes barely visible, as if hidden in fog. The interface remains recognizable while loading continues, but the main actions are temporarily unavailable.';
    protected readonly contentFade =
        'The overlay blends seamlessly with the background, leaving no visible boundary around its edges. Matching the overlay color to the surface keeps the container connected to the surrounding interface.';
    protected readonly surfaces: ReadonlyArray<{
        value: KbqLoaderOverlaySurface;
        surfaceClass: string;
    }> = [
        { value: 'bg', surfaceClass: 'e2e-loader-overlay-background__item_bg' },
        { value: 'bg-secondary', surfaceClass: 'e2e-loader-overlay-background__item_bg-secondary' },
        { value: 'bg-tertiary', surfaceClass: 'e2e-loader-overlay-background__item_bg-tertiary' },
        { value: 'card', surfaceClass: 'e2e-loader-overlay-background__item_card' },
        { value: 'solid', surfaceClass: 'e2e-loader-overlay-background__item_bg' }
    ];
}

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
