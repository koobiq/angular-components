import { HttpClient } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { shareReplay } from 'rxjs/operators';

@Component({
    selector: 'docs-example-source',
    templateUrl: 'docs-example-source.html',
    styleUrls: ['docs-example-source.scss'],
    host: {
        class: 'docs-example-source'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DocsExampleSource {
    @ViewChild('code') code: ElementRef;

    /** The URL of the document to display. */
    @Input()
    set url(url: string) {
        if (!url) {
            return;
        }

        this.fetchDocument(url);
    }

    lineNumbers = '';

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private http: HttpClient
    ) {}

    private setLineNumbers() {
        const text = this.code.nativeElement.textContent!.match(/\n/g);
        const length = text ? text.length + 1 : 0;

        this.lineNumbers = '';

        for (let i = 1; i <= length; i++) {
            this.lineNumbers += `${i}\n`;
        }

        this.changeDetectorRef.markForCheck();
    }

    private fetchDocument(url: string) {
        this.http
            .get(url, { responseType: 'text' })
            .pipe(shareReplay(1))
            .subscribe((e) => this.updateDocument(e));
    }

    /**
     * Updates the displayed document.
     * @param rawDocument The raw document content to show.
     */
    private updateDocument = (rawDocument: string): void => {
        this.code.nativeElement.innerHTML = rawDocument;

        this.setLineNumbers();
    };
}
