import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    input,
    signal,
    viewChild
} from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqLink } from '@koobiq/components/link';
import { KBQ_MODAL_DATA, KbqModalService } from '@koobiq/components/modal';
import { exampleOnCellEnter } from './cell-keyboard';
import { ExampleIncidentDetails } from './incident-details';
import type { ExampleIncidentHeaders } from './incident-headers';
import type { ExampleSecurityIncident } from './security-incidents';

type BadgeValue =
    ExampleSecurityIncident['severity'] | ExampleSecurityIncident['status'] | ExampleSecurityIncident['aiVerdict'];

@Component({
    selector: 'example-incident-badge',
    imports: [KbqBadgeModule],
    template: `
        <kbq-badge [compact]="compact()" [badgeColor]="colors[value()]">{{ value() }}</kbq-badge>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleIncidentBadge {
    readonly value = input.required<BadgeValue>();
    readonly compact = input(false, { transform: booleanAttribute });
    protected readonly colors: Record<BadgeValue, KbqBadgeColors> = {
        Safe: KbqBadgeColors.FadeSuccess,
        Malicious: KbqBadgeColors.FadeError,
        Analyzing: KbqBadgeColors.FadeContrast,
        New: KbqBadgeColors.FadeContrast,
        'In progress': KbqBadgeColors.FadeTheme,
        Resolved: KbqBadgeColors.FadeSuccess,
        Critical: KbqBadgeColors.Error,
        High: KbqBadgeColors.FadeError,
        Medium: KbqBadgeColors.FadeWarning,
        Low: KbqBadgeColors.FadeContrast
    };
}

@Component({
    selector: 'example-incident-badge-cell',
    imports: [ExampleIncidentBadge],
    template: `
        @if (value(); as label) {
            <example-incident-badge compact [value]="label" />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleIncidentBadgeCell implements ICellRendererAngularComp {
    protected readonly value = signal<BadgeValue | undefined>(undefined);

    agInit({ value }: ICellRendererParams<ExampleSecurityIncident, BadgeValue>): void {
        this.value.set(value ?? undefined);
    }

    refresh(params: ICellRendererParams<ExampleSecurityIncident, BadgeValue>): boolean {
        this.agInit(params);

        return true;
    }
}

type IncidentDetails = { incident: ExampleSecurityIncident; headers: ExampleIncidentHeaders };

@Component({
    selector: 'example-incident-dialog',
    imports: [ExampleIncidentDetails],
    template: `
        <example-incident-details [incident]="data.incident" [headers]="data.headers" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ExampleIncidentDialog {
    protected readonly data = inject<IncidentDetails>(KBQ_MODAL_DATA);
}

@Component({
    selector: 'example-incident-link',
    imports: [KbqLink],
    template: `
        <a kbqLink pseudo (click)="$event.stopPropagation(); open()">{{ incident().id }}</a>
    `,
    styles: `
        :host {
            white-space: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleIncidentLink {
    readonly incident = input.required<ExampleSecurityIncident>();
    readonly headers = input.required<ExampleIncidentHeaders>();
    readonly openIncident = input<(row: ExampleSecurityIncident) => void>();
    private readonly modal = inject(KbqModalService);

    open(): void {
        const incident = this.incident();
        const openIncident = this.openIncident();

        if (openIncident) {
            openIncident(incident);

            return;
        }

        this.modal.create({
            kbqTitle: incident.id + ' · ' + incident.event,
            kbqContent: ExampleIncidentDialog,
            kbqMaskClosable: true,
            data: { incident, headers: this.headers() } satisfies IncidentDetails,
            kbqFooter: []
        });
    }
}

type IncidentLinkParams = ICellRendererParams<ExampleSecurityIncident, string> & {
    headers: ExampleIncidentHeaders;
    resolveIncident?: (id: string) => ExampleSecurityIncident | undefined;
    openIncident?: (row: ExampleSecurityIncident) => void;
};

@Component({
    selector: 'example-incident-link-cell',
    imports: [ExampleIncidentLink],
    template: `
        @if (cell(); as link) {
            <example-incident-link
                [incident]="link.incident"
                [headers]="link.headers"
                [openIncident]="link.openIncident"
            />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleIncidentLinkCell implements ICellRendererAngularComp {
    private readonly destroyRef = inject(DestroyRef);
    private readonly link = viewChild(ExampleIncidentLink);
    protected readonly cell = signal<(IncidentDetails & Pick<IncidentLinkParams, 'openIncident'>) | undefined>(
        undefined
    );

    agInit(params: IncidentLinkParams): void {
        this.refresh(params);
        exampleOnCellEnter(params.eGridCell, this.destroyRef, (event) => {
            const link = this.link();

            if (link) {
                event.stopPropagation();
                link.open();
            }
        });
    }

    refresh({ value, data, headers, openIncident, resolveIncident }: IncidentLinkParams): boolean {
        const incident = value && (resolveIncident ? resolveIncident(value) : data);

        this.cell.set(incident ? { incident, headers, openIncident } : undefined);

        return true;
    }
}
