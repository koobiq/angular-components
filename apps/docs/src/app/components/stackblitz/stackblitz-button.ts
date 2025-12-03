import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Component, ElementRef, Input, NgZone, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkModule } from '@koobiq/components/link';
import { ExampleData } from '@koobiq/docs-examples';
import { DocsStackblitzWriter } from './stackblitz-writer';

@Component({
    selector: 'docs-stackblitz-button',
    imports: [KbqButtonModule, KbqIconModule, KbqLinkModule],
    template: `
        <span class="kbq-link__text">StackBlitz</span>
        <i kbq-icon="kbq-north-east_16"></i>
    `,
    encapsulation: ViewEncapsulation.None,
    providers: [DocsStackblitzWriter],
    host: {
        class: 'docs-stackblitz-button kbq-link_external',
        '(click)': 'openStackBlitz()',
        '(keydown.enter)': 'openStackBlitz()'
    }
})
export class DocsStackblitzButtonComponent extends KbqLink {
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
        elementRef: ElementRef<HTMLAnchorElement>,
        focusMonitor: FocusMonitor,
        changeDetector: ChangeDetectorRef,
        private stackBlitzWriter: DocsStackblitzWriter,
        private ngZone: NgZone
    ) {
        super(elementRef, focusMonitor, changeDetector);
    }

    openStackBlitz(): void {
        if (this.openStackBlitzFn) {
            this.openStackBlitzFn();
        } else {
            console.warn('StackBlitz is not ready yet. Please try again in a few seconds.');
        }
    }

    private prepareStackBlitzForExample(exampleId: string, data: ExampleData): void {
        this.ngZone.runOutsideAngular(async () => {
            this.openStackBlitzFn = await this.stackBlitzWriter.createStackBlitzForExample(exampleId, data);
        });
    }
}
