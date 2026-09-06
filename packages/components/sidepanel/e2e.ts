import { ChangeDetectionStrategy, Component, inject, OnDestroy, TemplateRef, viewChild } from '@angular/core';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KbqSidepanelPosition, KbqSidepanelSize } from './sidepanel-config';
import { KbqSidepanelModule } from './sidepanel.module';
import { KbqSidepanelService } from './sidepanel.service';

type SidepanelState = {
    size?: KbqSidepanelSize;
    position?: KbqSidepanelPosition;
};

@Component({
    selector: 'e2e-sidepanel-state-and-style',
    imports: [
        KbqButton,
        KbqButtonCssStyler,
        KbqSidepanelModule
    ],
    template: `
        <div data-testid="e2eSidepanelTable">
            <div style="width: 75px" class="layout-column">
                <button kbq-button data-testid="e2eSidepanelMedium" (click)="open({ size: sidepanelSize.Medium })">
                    {{ sidepanelSize.Medium }}
                </button>
                <button kbq-button data-testid="e2eSidepanelLarge" (click)="open({ size: sidepanelSize.Large })">
                    {{ sidepanelSize.Large }}
                </button>
                <button
                    kbq-button
                    data-testid="e2eSidepanelRightLeft"
                    (click)="openAtPositions([sidepanelPosition.Right, sidepanelPosition.Left])"
                >
                    right left
                </button>
                <button
                    kbq-button
                    data-testid="e2eSidepanelTopBottom"
                    (click)="openAtPositions([sidepanelPosition.Top, sidepanelPosition.Bottom])"
                >
                    top bottom
                </button>
                <button kbq-button data-testid="e2eSidepanelNested" (click)="openNested({ size: sidepanelSize.Small })">
                    nested
                </button>
            </div>

            <ng-template #sidepanel>
                <kbq-sidepanel-header [closeable]="true">Sidepanel Template Content</kbq-sidepanel-header>
                <kbq-sidepanel-body>
                    <div class="kbq-subheading">Sidepanel Template Body</div>

                    @for (item of items; track $index) {
                        <div>{{ item }}</div>
                    }
                </kbq-sidepanel-body>

                <kbq-sidepanel-footer>
                    <kbq-sidepanel-actions align="left">
                        <button cdkFocusInitial kbq-button [color]="'contrast'">
                            <span>Button</span>
                        </button>
                    </kbq-sidepanel-actions>

                    <kbq-sidepanel-actions align="right">
                        <span>Action</span>
                    </kbq-sidepanel-actions>
                </kbq-sidepanel-footer>
            </ng-template>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSidepanelStateAndStyle'
    }
})
export class E2eSidepanelStateAndStyle implements OnDestroy {
    protected readonly template = viewChild.required<TemplateRef<any>>('sidepanel');
    protected readonly sidepanelService = inject(KbqSidepanelService);

    protected readonly items = Array.from({ length: 50 }, (_, i) => `Item #${i}`);

    protected readonly sidepanelSize = KbqSidepanelSize;
    protected readonly sidepanelPosition = KbqSidepanelPosition;

    getId(type: string) {
        return `e2e-sidepanel-${type}`;
    }

    open({ size, position }: SidepanelState): void {
        this.sidepanelService.open(this.template(), {
            position: position ?? KbqSidepanelPosition.Right,
            size
        });
    }

    openAtPositions(positions: KbqSidepanelPosition[]): void {
        positions.forEach((position) => {
            this.sidepanelService.open(this.template(), {
                position,
                size: KbqSidepanelSize.Small
            });
        });
    }

    openNested({ size, position }: SidepanelState): void {
        [0, 1].forEach(() => this.open({ size, position }));
    }

    ngOnDestroy() {
        this.sidepanelService.closeAll();
    }
}

@Component({
    selector: 'e2e-sidepanel-component-portal-content',
    imports: [KbqSidepanelModule, KbqButton, KbqButtonCssStyler],
    template: `
        <kbq-sidepanel-header [closeable]="true">Sidepanel Component Content</kbq-sidepanel-header>
        <kbq-sidepanel-body>
            @for (item of items; track $index) {
                <div>{{ item }}</div>
            }
        </kbq-sidepanel-body>
        <kbq-sidepanel-footer>
            <kbq-sidepanel-actions align="right">
                <button kbq-button kbq-sidepanel-close>
                    <span>Close</span>
                </button>
            </kbq-sidepanel-actions>
        </kbq-sidepanel-footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eSidepanelComponentPortalContent {
    protected readonly items = Array.from({ length: 50 }, (_, i) => `Item #${i}`);
}

/**
 * A component portal puts the attached component's own host element between `.kbq-sidepanel-content` and
 * the header/body/footer, and the package styles it — no host workaround here on purpose.
 */
@Component({
    selector: 'e2e-sidepanel-component-portal',
    imports: [KbqButton, KbqButtonCssStyler],
    template: `
        <button kbq-button data-testid="e2eOpenComponentSidepanel" (click)="open()">Open sidepanel</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSidepanelComponentPortal'
    }
})
export class E2eSidepanelComponentPortal implements OnDestroy {
    private readonly sidepanelService = inject(KbqSidepanelService);

    protected open(): void {
        this.sidepanelService.open(E2eSidepanelComponentPortalContent, { size: KbqSidepanelSize.Medium });
    }

    ngOnDestroy(): void {
        this.sidepanelService.closeAll();
    }
}

@Component({
    selector: 'e2e-sidepanel-scrollbar-no-overflow',
    imports: [KbqButton, KbqButtonCssStyler, KbqSidepanelModule],
    template: `
        <button kbq-button data-testid="e2eOpenSidepanel" (click)="open()">Open sidepanel</button>

        <ng-template #sidepanel>
            <kbq-sidepanel-header>Sidepanel</kbq-sidepanel-header>
            <kbq-sidepanel-body>Short content</kbq-sidepanel-body>
            <kbq-sidepanel-footer>Footer</kbq-sidepanel-footer>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSidepanelScrollbarNoOverflow'
    }
})
export class E2eSidepanelScrollbarNoOverflow implements OnDestroy {
    private readonly template = viewChild.required<TemplateRef<unknown>>('sidepanel');
    private readonly sidepanelService = inject(KbqSidepanelService);

    protected open(): void {
        this.sidepanelService.open(this.template(), { size: KbqSidepanelSize.Medium });
    }

    ngOnDestroy(): void {
        this.sidepanelService.closeAll();
    }
}
