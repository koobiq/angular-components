import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { KbqTitleDirective } from './title.directive';

/**
 * Overflow detection depends on real layout, which JSDOM cannot provide: the unit suite has to mock every
 * width. These fixtures put the measurement in a real browser instead — including the sub-pixel cases that
 * the rounding rules exist for.
 */
@Component({
    selector: 'e2e-title-overflow',
    imports: [KbqTitleDirective],
    template: `
        <button data-testid="titleKeyboard" class="truncated" kbq-title type="button">
            A very long button label that certainly does not fit
        </button>

        <div data-testid="titleTruncated" class="truncated" kbq-title>
            A very long value that certainly does not fit into this narrow container
        </div>

        <div data-testid="titleFits" class="wide" kbq-title>Short</div>

        <div data-testid="titleClamped" class="clamped" kbq-title>
            A long multiline value that is clamped to two lines and therefore overflows vertically, which is exactly
            what the vertical branch of the overflow check is for.
        </div>

        <div #subPixelClip data-testid="titleSubPixelClip" class="sub-pixel clip" kbq-title>Sub-pixel clip</div>

        <div #subPixelEllipsis data-testid="titleSubPixelEllipsis" class="sub-pixel ellipsis" kbq-title>
            Sub-pixel clip
        </div>

        <div data-testid="titleMultipleText" class="truncated" kbq-title>
            <div #kbqTitleContainer class="multiple-text">
                <span #kbqTitleText>Name</span>
                <span #kbqTitleText>A value long enough to be clipped by the container</span>
            </div>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            padding: 16px;
            font-family: Arial, sans-serif;
            font-size: 14px;
        }

        .truncated {
            width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .wide {
            width: 400px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .clamped {
            display: -webkit-box;
            width: 300px;
            overflow: hidden;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
        }

        .sub-pixel {
            overflow: hidden;
            white-space: nowrap;
        }

        .sub-pixel.clip {
            text-overflow: clip;
        }

        .sub-pixel.ellipsis {
            text-overflow: ellipsis;
        }

        .multiple-text {
            display: flex;
            gap: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTitleOverflow'
    }
})
export class E2eTitleOverflow implements AfterViewInit {
    readonly subPixelClip = viewChild.required<ElementRef<HTMLElement>>('subPixelClip');
    readonly subPixelEllipsis = viewChild.required<ElementRef<HTMLElement>>('subPixelEllipsis');

    /**
     * Narrows both sub-pixel hosts until they clip their own text without the integer
     * `offsetWidth`/`scrollWidth` pair noticing, which is what puts the directive on its sub-pixel branch —
     * where `clip` must stay silent and `ellipsis` must show the tooltip.
     *
     * Searched rather than computed with a fixed offset: how far the box can be narrowed before the two
     * integers part company depends on where the text width falls between them, so any single offset builds
     * a plain overflow case instead for some share of font metrics, and the two tests would then silently
     * assert the wrong branch.
     */
    ngAfterViewInit(): void {
        [this.subPixelClip(), this.subPixelEllipsis()].forEach(({ nativeElement }) => {
            const textWidth = nativeElement.getBoundingClientRect().width;

            for (const shave of [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]) {
                nativeElement.style.width = `${textWidth - shave}px`;

                if (nativeElement.offsetWidth === nativeElement.scrollWidth) return;
            }

            throw new Error(
                `Sub-pixel fixture: no width under ${textWidth}px both clips the text and keeps offsetWidth equal to scrollWidth.`
            );
        });
    }
}
