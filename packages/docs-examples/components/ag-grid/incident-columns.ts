import type { ColDef } from 'ag-grid-community';
import { ExampleIncidentBadgeCell, ExampleIncidentLinkCell } from './incident-cells';
import { ExampleConnectionCell, ExampleConnectionHeader } from './incident-connection';
import type { ExampleIncidentHeaders } from './incident-headers';
import { ExampleIncidentTechniquesCell } from './incident-techniques';
import type { ExampleSecurityIncident } from './security-incidents';

type IncidentField = keyof ExampleIncidentHeaders;

type IncidentColumn = ColDef<ExampleSecurityIncident> & { field: IncidentField };

const defaultFields: IncidentField[] = ['id', 'event', 'severity', 'status', 'affectedHost', 'sourceIp'];

export function exampleIncidentCellOptions(
    field: IncidentField,
    headers: ExampleIncidentHeaders,
    resolveIncident?: (id: string) => ExampleSecurityIncident | undefined
) {
    switch (field) {
        case 'id':
            return { cellRenderer: ExampleIncidentLinkCell, cellRendererParams: { headers, resolveIncident } };
        case 'techniques':
            return {
                cellRenderer: ExampleIncidentTechniquesCell,
                cellRendererParams: { resolveIncident },
                autoHeight: true
            };
        case 'connection':
            return {
                cellRenderer: ExampleConnectionCell,
                headerComponentParams: { innerHeaderComponent: ExampleConnectionHeader },
                headerClass: 'example-connection-header',
                headerTooltip: headers.connection,
                cellStyle: { textAlign: 'center' },
                width: 64
            };
        case 'aiVerdict':
        case 'status':
        case 'severity':
            return { cellRenderer: ExampleIncidentBadgeCell };
        default:
            return {};
    }
}

export function exampleIncidentColumns(
    headers: ExampleIncidentHeaders,
    ...columns: (IncidentField | IncidentColumn)[]
): ColDef<ExampleSecurityIncident>[] {
    return (columns.length ? columns : defaultFields).map((column) => {
        const definition = typeof column === 'string' ? { field: column } : column;

        return {
            headerName: headers[definition.field],
            width: definition.field === 'event' || definition.field === 'affectedHost' ? 220 : 145,
            ...exampleIncidentCellOptions(definition.field, headers),
            ...definition
        };
    });
}
