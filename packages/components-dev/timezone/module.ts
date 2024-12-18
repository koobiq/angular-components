import { Component, ViewEncapsulation } from '@angular/core';
import { KbqTimezoneModule } from '@koobiq/components/timezone';
import { TimezoneExamplesModule } from 'packages/docs-examples/components/timezone';

@Component({
    standalone: true,
    imports: [
        KbqTimezoneModule,
        TimezoneExamplesModule
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None
})
export class TimezoneDev {}
