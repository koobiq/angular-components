import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkModule } from '@koobiq/components/link';
import { ExampleData } from '@koobiq/docs-examples';
import { DocsStackblitzWriter } from './stackblitz-writer';

@Component({
    selector: 'docs-stackblitz-button',
    imports: [KbqIconModule, KbqLinkModule],
    template: `
        <span class="kbq-link__text">StackBlitz</span>
        <i kbq-icon="kbq-north-east_16"></i>
    `,
    encapsulation: ViewEncapsulation.None,
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
            this._exampleId = value;
            this.exampleData = new ExampleData(value);
        } else {
            this._exampleId = undefined;
            this.exampleData = undefined;
        }
    }

    private _exampleId: string | undefined;

    get hasIcon() {
        return true;
    }

    private exampleData: ExampleData | undefined;

    constructor(
        elementRef: ElementRef<HTMLAnchorElement>,
        focusMonitor: FocusMonitor,
        private stackBlitzWriter: DocsStackblitzWriter
    ) {
        super(elementRef, focusMonitor);
    }

    protected openStackBlitz(): void {
        if (!this._exampleId || !this.exampleData) return;

        this.stackBlitzWriter.createStackBlitzForExample(this._exampleId, this.exampleData).then((open) => open());
    }
}
