import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLoaderOverlayModule, KbqLoaderOverlaySurface } from '@koobiq/components/loader-overlay';

/**
 * @title Loader-overlay background
 */
@Component({
    selector: 'loader-overlay-background-example',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="example__grid">
            @for (surface of surfaces; track surface.value) {
                <div class="example__item {{ surface.surfaceClass }}">
                    <div class="example__content">
                        <p class="example__paragraph kbq-text-normal">{{ content }}</p>
                        <p class="example__paragraph example__paragraph_fade kbq-text-normal">
                            {{ contentFade }}
                        </p>
                    </div>
                    <kbq-loader-overlay
                        class="example__overlay"
                        size="compact"
                        [text]="surface.value"
                        [surface]="surface.value"
                    />
                </div>
            }
        </div>
    `,
    styles: `
        :host {
            display: block;

            --example-padding: var(--kbq-size-l);
            --example-overlay-transition-duration: 200ms;
            --example-overlay-transition-easing: cubic-bezier(0.23, 1, 0.32, 1);
        }

        .example__grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 20px;
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

        @media (max-width: 600px) {
            .example__grid {
                grid-template-columns: 1fr;
            }

            .example__item,
            .example__item:nth-child(5) {
                grid-column: auto;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayBackgroundExample {
    protected readonly content =
        'Content behind the overlay becomes barely visible, as if hidden in fog. The interface remains recognizable while loading continues, but the main actions are temporarily unavailable.';
    protected readonly contentFade =
        'The overlay blends seamlessly with the background, leaving no visible boundary around its edges. Matching the overlay color to the surface keeps the container connected to the surrounding interface.';

    protected readonly surfaces: ReadonlyArray<{
        value: KbqLoaderOverlaySurface;
        surfaceClass: string;
    }> = [
        { value: 'bg', surfaceClass: 'example__item_bg' },
        { value: 'bg-secondary', surfaceClass: 'example__item_bg-secondary' },
        { value: 'bg-tertiary', surfaceClass: 'example__item_bg-tertiary' },
        { value: 'card', surfaceClass: 'example__item_card' },
        { value: 'solid', surfaceClass: 'example__item_bg' }
    ];
}
