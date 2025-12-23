import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal, TemplateRef, viewChild } from '@angular/core';
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
                @for (size of sizes; track $index) {
                    <button kbq-button [attr.data-testid]="getId(size)" (click)="open({ size })">{{ size }}</button>
                }
                @for (position of positions; track $index) {
                    <button kbq-button [attr.data-testid]="getId(position)" (click)="open({ position })">
                        {{ position }}
                    </button>
                }
                <button
                    kbq-button
                    [attr.data-testid]="getId('nested')"
                    (click)="openNested({ size: sidepanelSize.Small })"
                >
                    nested
                </button>
            </div>

            <ng-template #sidepanel>
                <kbq-sidepanel-header [closeable]="true">Sidepanel Template Content</kbq-sidepanel-header>
                <kbq-sidepanel-body>
                    <div class="kbq-subheading">Sidepanel Template Body</div>
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

    protected readonly sizes = Object.values(KbqSidepanelSize);
    protected readonly sidepanelSize = KbqSidepanelSize;
    protected readonly positions = Object.values(KbqSidepanelPosition);

    protected readonly states = signal<SidepanelState[][]>([]);

    getId(type) {
        return `e2e-sidepanel-${type}`;
    }

    open({ size, position }: SidepanelState): void {
        this.sidepanelService.open(this.template(), {
            position: position ?? KbqSidepanelPosition.Right,
            size
        });
    }

    openNested({ size, position }: SidepanelState): void {
        [0, 1].forEach(() => this.open({ size, position }));
    }

    ngOnDestroy() {
        this.sidepanelService.closeAll();
    }
}
