import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqDataSizePipe, KbqFormattersModule } from '@koobiq/components/core';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { KbqIconModule } from '@koobiq/components/icon';
import type { ExampleIncidentHeaders } from './incident-headers';
import { ExampleIncidentTechniques } from './incident-techniques';
import type { ExampleSecurityIncident } from './security-incidents';

@Component({
    selector: 'example-incident-details',
    imports: [
        KbqDl,
        KbqDt,
        KbqDd,
        ExampleIncidentTechniques,
        KbqIconModule,
        LuxonDateModule,
        KbqFormattersModule,
        KbqDataSizePipe
    ],
    template: `
        @let row = incident();
        @let labels = headers();
        <kbq-dl>
            <kbq-dt>{{ labels.description }}</kbq-dt>
            <kbq-dd>{{ row.description }}</kbq-dd>
            <kbq-dt>{{ labels.detectedAt }}</kbq-dt>
            <kbq-dd>{{ row.detectedAt | kbqAbsoluteShortDateTime }}</kbq-dd>
            <kbq-dt>{{ labels.detector }}</kbq-dt>
            <kbq-dd>{{ row.detector }}</kbq-dd>
            <kbq-dt>{{ labels.affectedHost }}</kbq-dt>
            <kbq-dd>{{ row.affectedHost }}</kbq-dd>
            <kbq-dt>{{ labels.subnet }}</kbq-dt>
            <kbq-dd>{{ row.subnet }}</kbq-dd>
            <kbq-dt>{{ labels.sourceIp }}</kbq-dt>
            <kbq-dd>{{ row.sourceIp }}</kbq-dd>
            <kbq-dt>{{ labels.destinationIp }}</kbq-dt>
            <kbq-dd>{{ row.destinationIp }}:{{ row.port }} ({{ row.protocol }})</kbq-dd>
            @if (row.process) {
                <kbq-dt>{{ labels.process }}</kbq-dt>
                <kbq-dd>{{ row.process }} (PID {{ row.pid }})</kbq-dd>
            }
            @if (row.filePath) {
                <kbq-dt>{{ labels.filePath }}</kbq-dt>
                <kbq-dd>
                    <i kbq-icon="kbq-file-o_16"></i>
                    {{ row.filePath }}
                </kbq-dd>
            }
            @if (row.fileSize !== undefined) {
                <kbq-dt>{{ labels.fileSize }}</kbq-dt>
                <kbq-dd>{{ row.fileSize | kbqDataSize }}</kbq-dd>
            }
            <kbq-dt>{{ labels.techniques }}</kbq-dt>
            <kbq-dd>
                <example-incident-techniques [ids]="row.techniques" />
            </kbq-dd>
        </kbq-dl>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleIncidentDetails {
    readonly incident = input.required<ExampleSecurityIncident>();
    readonly headers = input.required<ExampleIncidentHeaders>();
}
