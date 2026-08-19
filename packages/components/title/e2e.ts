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
     * Sizes both sub-pixel hosts to 0.4 px less than their own text, which is the only reliable way to build
     * that case: it does not depend on the font metrics of the machine running the test. Both then report
     * equal integer `offsetWidth`/`scrollWidth`, so the directive takes its sub-pixel branch — where `clip`
     * must stay silent and `ellipsis` must show the tooltip.
     */
    ngAfterViewInit(): void {
        [this.subPixelClip(), this.subPixelEllipsis()].forEach(({ nativeElement }) => {
            const textWidth = nativeElement.getBoundingClientRect().width;

            nativeElement.style.width = `${textWidth - 0.4}px`;
        });
    }
}
