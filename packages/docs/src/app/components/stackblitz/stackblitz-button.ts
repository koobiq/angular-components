import { Component, Input, NgModule, NgZone, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { ExampleData } from '@koobiq/docs-examples';

import { StackblitzWriter } from './stackblitz-writer';


@Component({
    selector: 'docs-stackblitz-button',
    templateUrl: './stackblitz-button.html',
    host: {
        class: 'docs-stackblitz-button'
    },
    encapsulation: ViewEncapsulation.None
})
export class StackblitzButton {
    @Input()
    set exampleId(value: string | undefined) {
        if (value) {
            this.exampleData = new ExampleData(value);
            this.prepareStackBlitzForExample(value, this.exampleData);
        } else {
            this.exampleData = undefined;
            this.openStackBlitzFn = null;
        }
    }

    exampleData: ExampleData | undefined;

    private openStackBlitzFn: (() => void) | null = null;

    constructor(private stackBlitzWriter: StackblitzWriter, private ngZone: NgZone) {}

    openStackBlitz(): void {
        if (this.openStackBlitzFn) {
            this.openStackBlitzFn();
        } else {
            // tslint:disable-next-line:no-console
            console.log('StackBlitz is not ready yet. Please try again in a few seconds.');
        }
    }

    private prepareStackBlitzForExample(exampleId: string, data: ExampleData): void {
        this.ngZone.runOutsideAngular(async () => {
            this.openStackBlitzFn = await this.stackBlitzWriter.constructStackblitzForm(exampleId, data);
        });
    }
}

@NgModule({
    imports: [KbqButtonModule, KbqIconModule, KbqLinkModule],
    exports: [StackblitzButton],
    declarations: [StackblitzButton],
    providers: [StackblitzWriter]
})
export class StackblitzButtonModule {}
