import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ModalExamplesModule } from 'packages/docs-examples/components/modal';

@Component({
    standalone: true,
    imports: [
        ModalExamplesModule
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalDev {}
