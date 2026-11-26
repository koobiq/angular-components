import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    Renderer2,
    signal,
    ViewEncapsulation
} from '@angular/core';
import type { ICellRendererAngularComp, IInnerHeaderAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams, IHeaderParams } from 'ag-grid-community';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import type { ExampleSecurityIncident } from './security-incidents';

@Component({
    selector: 'example-connection-header',
    imports: [KbqIcon],
    template: `
        <i kbq-icon="kbq-plug_16" color="contrast-fade"></i>
        <span class="cdk-visually-hidden">{{ label() }}</span>
    `,
    styles: `
        .example-connection-header .ag-header-cell-label {
            justify-content: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ExampleConnectionHeader implements IInnerHeaderAngularComp {
    protected readonly label = signal('');

    agInit({ displayName }: IHeaderParams): void {
        this.label.set(displayName);
    }

    refresh(params: IHeaderParams): boolean {
        this.agInit(params);

        return true;
    }
}

@Component({
    selector: 'example-connection-cell',
    imports: [KbqIcon, KbqTooltipTrigger],
    template: `
        @if (connection(); as state) {
            <i
                kbq-icon="kbq-circle_16"
                aria-hidden="false"
                role="img"
                kbqTrigger="hover"
                [attr.aria-label]="state"
                [kbqTooltip]="state"
                [kbqVisible]="cellFocused()"
                [color]="state === 'Connected' ? 'success' : 'contrast-fade'"
            ></i>
        }
    `,
    styles: `
        .kbq-icon {
            transform: scale(0.5);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleConnectionCell implements ICellRendererAngularComp {
    private readonly renderer = inject(Renderer2);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly cellFocused = signal(false);
    protected readonly connection = signal<ExampleSecurityIncident['connection'] | undefined>(undefined);

    agInit(params: ICellRendererParams<ExampleSecurityIncident, ExampleSecurityIncident['connection']>): void {
        this.refresh(params);

        const cell = params.eGridCell;

        this.cellFocused.set(cell.matches(':focus'));
        this.destroyRef.onDestroy(this.renderer.listen(cell, 'focus', () => this.cellFocused.set(true)));
        this.destroyRef.onDestroy(this.renderer.listen(cell, 'blur', () => this.cellFocused.set(false)));
    }

    refresh({ value }: ICellRendererParams<ExampleSecurityIncident, ExampleSecurityIncident['connection']>): boolean {
        this.connection.set(value ?? undefined);

        return true;
    }
}
