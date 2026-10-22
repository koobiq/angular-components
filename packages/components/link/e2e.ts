import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDefaultSizes } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkPrefix, KbqLinkSuffix, KbqLinkUnderline } from '@koobiq/components/link';

const states = [
    { name: 'default', class: '', disabled: false },
    { name: 'hovered', class: 'kbq-hovered', disabled: false },
    { name: 'active', class: 'kbq-active', disabled: false },
    { name: 'focused', class: 'cdk-keyboard-focused', disabled: false },
    { name: 'disabled', class: '', disabled: true }
] as const;

const kinds: { name: string; pseudo: boolean; underline?: KbqLinkUnderline; visited?: boolean }[] = [
    { name: 'link', pseudo: false },
    { name: 'underline hover', pseudo: false, underline: 'hover' },
    { name: 'underline none', pseudo: false, underline: 'none' },
    { name: 'visited', pseudo: false, visited: true },
    { name: 'pseudo', pseudo: true },
    { name: 'pseudo, always', pseudo: true, underline: 'always' }
];

const sizes: KbqDefaultSizes[] = ['compact', 'normal', 'big'];

@Component({
    selector: 'e2e-link-states',
    imports: [KbqLink],
    template: `
        <div class="e2e-link-states" data-testid="e2eScreenshotTarget">
            @for (state of states; track state.name) {
                @for (kind of kinds; track kind.name) {
                    <div>
                        @if (kind.pseudo) {
                            <span
                                kbqLink
                                [class]="state.class"
                                [disabled]="state.disabled"
                                [underline]="kind.underline"
                            >
                                Scan report
                            </span>
                        } @else {
                            <a
                                kbqLink
                                href="#"
                                [class]="state.class"
                                [class.kbq-visited]="kind.visited"
                                [disabled]="state.disabled"
                                [underline]="kind.underline"
                                [useVisited]="!!kind.visited"
                            >
                                Scan report
                            </a>
                        }
                    </div>
                }
            }
        </div>
    `,
    styles: `
        .e2e-link-states {
            display: inline-grid;
            grid-template-columns: repeat(6, max-content);
            gap: var(--kbq-size-s) var(--kbq-size-l);
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLinkStates'
    }
})
export class E2eLinkStates {
    protected readonly states = states;
    protected readonly kinds = kinds;
}

@Component({
    selector: 'e2e-link-size',
    imports: [KbqLink, KbqLinkPrefix, KbqLinkSuffix, KbqIconModule],
    template: `
        <div class="e2e-link-size" data-testid="e2eScreenshotTarget">
            @for (size of sizes; track size) {
                <div>
                    Text
                    <a kbqLink href="#" [size]="size">text</a>
                    text
                </div>
            }
            @for (size of sizes; track size) {
                <div>
                    Text
                    <a kbqLink href="#" [size]="size">
                        <i kbq-icon="kbq-calendar-o_16" kbqLinkPrefix></i>
                        prefix
                    </a>
                    text
                </div>
            }
            @for (size of sizes; track size) {
                <div>
                    Text
                    <a kbqLink href="#" [size]="size">
                        suffix
                        <i kbq-icon="kbq-chevron-down-s_16" kbqLinkSuffix></i>
                    </a>
                    text
                </div>
            }
            @for (size of sizes; track size) {
                <div>
                    Text
                    <a kbqLink href="#" [size]="size">
                        <i kbq-icon="kbq-calendar-o_16" kbqLinkPrefix></i>
                        both
                        <i kbq-icon="kbq-chevron-down-s_16" kbqLinkSuffix></i>
                    </a>
                    text
                </div>
            }
            @for (size of sizes; track size) {
                <div>
                    Text
                    <a kbqLink external href="#" [size]="size">external</a>
                    text
                </div>
            }
        </div>
    `,
    styles: `
        .e2e-link-size {
            display: inline-grid;
            grid-template-columns: repeat(3, max-content);
            gap: var(--kbq-size-m) var(--kbq-size-xl);
            padding: var(--kbq-size-s);
            white-space: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLinkSize'
    }
})
export class E2eLinkSize {
    protected readonly sizes = sizes;
}

@Component({
    selector: 'e2e-link-icons',
    imports: [KbqLink, KbqLinkPrefix, KbqLinkSuffix, KbqIconModule],
    template: `
        <div class="e2e-link-icons" data-testid="e2eScreenshotTarget">
            @for (state of states; track state.name) {
                <div>
                    <a kbqLink href="#" [class]="state.class" [disabled]="state.disabled">
                        <i kbq-icon="kbq-calendar-o_16" kbqLinkPrefix></i>
                        Scan report
                        <i kbq-icon="kbq-chevron-down-s_16" kbqLinkSuffix></i>
                    </a>
                </div>
                <div>
                    <a
                        kbqLink
                        useVisited
                        href="#"
                        class="kbq-visited"
                        [class]="state.class"
                        [disabled]="state.disabled"
                    >
                        <i kbq-icon="kbq-calendar-o_16" kbqLinkPrefix></i>
                        Scan report
                        <i kbq-icon="kbq-chevron-down-s_16" kbqLinkSuffix></i>
                    </a>
                </div>
                <div>
                    <span kbqLink [class]="state.class" [disabled]="state.disabled">
                        <i kbq-icon="kbq-calendar-o_16" kbqLinkPrefix></i>
                        Scan report
                        <i kbq-icon="kbq-chevron-down-s_16" kbqLinkSuffix></i>
                    </span>
                </div>
            }
        </div>
    `,
    styles: `
        .e2e-link-icons {
            display: inline-grid;
            grid-template-columns: repeat(3, max-content);
            gap: var(--kbq-size-s) var(--kbq-size-l);
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLinkIcons'
    }
})
export class E2eLinkIcons {
    protected readonly states = states;
}

@Component({
    selector: 'e2e-link-custom-content',
    imports: [KbqLink, KbqLinkSuffix],
    template: `
        <div class="e2e-link-custom-content" data-testid="e2eScreenshotTarget">
            <div>
                Ends with
                <a kbqLink href="#">
                    a period
                    <span kbqLinkSuffix>.</span>
                </a>
            </div>
            <div>
                Ends with
                <a kbqLink external href="#">
                    external
                    <span kbqLinkSuffix>.</span>
                </a>
            </div>
            <div>
                <a kbqLink external href="#">
                    caption
                    <span class="e2e-link-caption" kbqLinkSuffix>task/koobiq.io</span>
                </a>
            </div>
        </div>
    `,
    styles: `
        .e2e-link-custom-content {
            display: inline-grid;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-s);
        }

        .e2e-link-caption {
            display: block;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLinkCustomContent'
    }
})
export class E2eLinkCustomContent {}

// Hebrew rather than English: the bidi algorithm lays English words out left to right even in a right-to-left
// paragraph, so the scenario would show nothing of the right-to-left layout.
@Component({
    selector: 'e2e-link-rtl',
    imports: [KbqLink, KbqLinkPrefix, KbqLinkSuffix, KbqIconModule],
    template: `
        <div class="e2e-link-rtl" data-testid="e2eScreenshotTarget" dir="rtl">
            <div>
                טקסט
                <a kbqLink href="#">קישור</a>
                טקסט
            </div>
            <div>
                טקסט
                <a kbqLink href="#">
                    <i kbq-icon="kbq-calendar-o_16" kbqLinkPrefix></i>
                    קישור
                </a>
                טקסט
            </div>
            <div>
                טקסט
                <a kbqLink href="#">
                    קישור
                    <i kbq-icon="kbq-chevron-down-s_16" kbqLinkSuffix></i>
                </a>
                טקסט
            </div>
            <div>
                טקסט
                <a kbqLink href="#">
                    <i kbq-icon="kbq-calendar-o_16" kbqLinkPrefix></i>
                    קישור
                    <i kbq-icon="kbq-chevron-down-s_16" kbqLinkSuffix></i>
                </a>
                טקסט
            </div>
            <div>
                טקסט
                <a kbqLink external href="#">קישור</a>
                טקסט
            </div>
            <div>
                טקסט
                <a kbqLink external href="#">
                    קישור
                    <span kbqLinkSuffix>.</span>
                </a>
            </div>
        </div>
    `,
    styles: `
        .e2e-link-rtl {
            display: inline-grid;
            gap: var(--kbq-size-xs);
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLinkRtl'
    }
})
export class E2eLinkRtl {}

@Component({
    selector: 'e2e-link-multiline',
    imports: [KbqLink, KbqLinkPrefix, KbqLinkSuffix, KbqIconModule],
    template: `
        <div class="e2e-link-multiline" data-testid="e2eScreenshotTarget">
            @for (state of states; track state.name) {
                <div>
                    I agree
                    <a kbqLink href="#" [class]="state.class">with the terms of the license agreement</a>
                    in full.
                </div>
                <div>
                    I agree
                    <a kbqLink external href="#" [class]="state.class">
                        <i kbq-icon="kbq-scroll-o_16" kbqLinkPrefix></i>
                        with the terms of the license agreement
                        <span kbqLinkSuffix>.</span>
                    </a>
                </div>
                <div>
                    I agree
                    <span kbqLink [class]="state.class">with the terms of the license agreement</span>
                    in full.
                </div>
            }
        </div>
    `,
    styles: `
        .e2e-link-multiline {
            display: inline-grid;
            grid-template-columns: repeat(3, 160px);
            gap: var(--kbq-size-s) var(--kbq-size-l);
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLinkMultiline'
    }
})
export class E2eLinkMultiline {
    protected readonly states = states.filter(({ name }) => ['default', 'hovered', 'focused'].includes(name));
}

@Component({
    selector: 'e2e-link-print',
    imports: [KbqLink],
    template: `
        <div class="e2e-link-print" data-testid="e2eScreenshotTarget">
            <div>
                <a kbqLink print href="https://www.cvedetails.com/cve/CVE-2019-1020010/">CVE-2019-1020010</a>
            </div>
            <div>
                <a kbqLink href="https://koobiq.io/en/components/link" [print]="'koobiq.io/link'">Link</a>
            </div>
            <div>
                <a kbqLink href="https://koobiq.io/en/components/link">Link</a>
            </div>
            <div>
                <a kbqLink print disabled href="https://koobiq.io/en/components/link">Link</a>
            </div>
            <div>
                <span kbqLink print>Scan report</span>
            </div>
        </div>
    `,
    styles: `
        .e2e-link-print {
            display: inline-grid;
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLinkPrint'
    }
})
export class E2eLinkPrint {}

@Component({
    selector: 'e2e-link-trailing-icon-wrap',
    imports: [KbqLink, KbqLinkPrefix, KbqLinkSuffix, KbqIconModule],
    template: `
        @for (size of sizes; track size) {
            <div data-testid="e2eLinkTrailingIconWrapItem">
                <a kbqLink external href="#" [size]="size">Technical support center</a>
            </div>
            <div data-testid="e2eLinkTrailingIconWrapItem">
                <a kbqLink href="#" [size]="size">
                    <i kbq-icon="kbq-calendar-o_16" kbqLinkPrefix></i>
                    Scan report
                    <i kbq-icon="kbq-arrow-right_16" kbqLinkSuffix></i>
                </a>
            </div>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--kbq-size-xs);
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLinkTrailingIconWrap'
    }
})
export class E2eLinkTrailingIconWrap {
    protected readonly sizes = sizes;
}

@Component({
    selector: 'e2e-link-caption-wrap',
    imports: [KbqLink, KbqLinkSuffix],
    template: `
        <a kbqLink external href="#">
            Scan report
            <span class="e2e-link-caption-wrap__caption" kbqLinkSuffix>
                Scheduled by the security team for the night of every first Monday
            </span>
        </a>
    `,
    styles: `
        :host {
            display: block;
            width: 160px;
        }

        .e2e-link-caption-wrap__caption {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLinkCaptionWrap'
    }
})
export class E2eLinkCaptionWrap {}
