import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Component, ElementRef, Input, NgModule, NgZone, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkModule } from '@koobiq/components/link';
import { ExampleData } from '@koobiq/docs-examples';
import { StackblitzWriter } from './stackblitz-writer';

@Component({
    selector: 'docs-stackblitz-button',
    template: `
        <span class="kbq-link__text">StackBlitz</span>
        <i kbq-icon="kbq-north-east_16"></i>
    `,
    host: {
        class: 'docs-stackblitz-button kbq-external',
        '(click)': 'openStackBlitz()',
        '(keydown.enter)': 'openStackBlitz()'
    },
    encapsulation: ViewEncapsulation.None
})
export class StackblitzButton extends KbqLink {
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

    get hasIcon() {
        return true;
    }

    exampleData: ExampleData | undefined;

    private openStackBlitzFn: (() => void) | null = null;

    constructor(
        elementRef: ElementRef,
        focusMonitor: FocusMonitor,
        changeDetector: ChangeDetectorRef,
        private stackBlitzWriter: StackblitzWriter,
        private ngZone: NgZone
    ) {
        super(elementRef, focusMonitor, changeDetector);
    }

    openStackBlitz(): void {
        if (this.openStackBlitzFn) {
            this.openStackBlitzFn();
        } else {
            console.log('StackBlitz is not ready yet. Please try again in a few seconds.');
        }
    }

    private prepareStackBlitzForExample(exampleId: string, data: ExampleData): void {
        this.ngZone.runOutsideAngular(async () => {
            this.openStackBlitzFn = await this.stackBlitzWriter.createStackBlitzForExample(exampleId, data);
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
