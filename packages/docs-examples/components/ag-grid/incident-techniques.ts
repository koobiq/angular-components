import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { KbqLink } from '@koobiq/components/link';
import { exampleOnCellEnter } from './cell-keyboard';
import {
    type ExampleSecurityIncident,
    type ExampleTechniqueId,
    exampleTechniqueLabel,
    exampleTechniqueUrl
} from './security-incidents';

@Component({
    selector: 'example-incident-techniques',
    imports: [KbqLink],
    template: `
        @for (id of ids(); track id) {
            <div>
                <a kbqLink external target="_blank" rel="noopener noreferrer" [href]="techniqueUrl(id)">
                    {{ techniqueLabel(id) }}
                </a>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleIncidentTechniques {
    readonly ids = input.required<ExampleTechniqueId[]>();

    protected readonly techniqueLabel = exampleTechniqueLabel;
    protected readonly techniqueUrl = exampleTechniqueUrl;
}

type TechniquesCellParams = ICellRendererParams<ExampleSecurityIncident> & {
    resolveIncident?: (id: string) => ExampleSecurityIncident | undefined;
};

@Component({
    selector: 'example-incident-techniques-cell',
    imports: [ExampleIncidentTechniques],
    template: `
        <example-incident-techniques
            [ids]="ids()"
            (click)="$event.stopPropagation()"
            (keydown.enter)="$event.stopPropagation()"
            (keydown.tab)="onTab($event)"
        />
    `,
    styles: `
        :host {
            display: block;
            padding-block: var(--kbq-size-s);
            white-space: normal;
            line-height: var(--kbq-typography-text-normal-line-height);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleIncidentTechniquesCell implements ICellRendererAngularComp {
    private readonly destroyRef = inject(DestroyRef);

    protected readonly ids = signal<ExampleTechniqueId[]>([]);

    agInit(params: TechniquesCellParams): void {
        this.refresh(params);
        exampleOnCellEnter(params.eGridCell, this.destroyRef, (event) => {
            event.stopPropagation();
            params.eGridCell.querySelector('a')?.focus();
        });
    }

    refresh({ data, resolveIncident }: TechniquesCellParams): boolean {
        const incident = data && (resolveIncident ? resolveIncident(data.id) : data);

        this.ids.set(incident?.techniques ?? []);

        return true;
    }

    protected onTab(event: Event): void {
        if (!(event instanceof KeyboardEvent) || !(event.target instanceof HTMLAnchorElement)) return;

        const item = event.target.parentElement;

        if (event.shiftKey ? item?.previousElementSibling : item?.nextElementSibling) event.stopPropagation();
    }
}
