import { HttpTestingController } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DocsAppTestingModule } from '../../testing/testing-module';

import { DocsLiveExample } from './docs-live-example';
import { DocsLiveExampleModule } from './docs-live-example-module';


describe('docs-live-example', () => {
    let http: HttpTestingController;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [DocsLiveExampleModule, DocsAppTestingModule],
            declarations: [DocViewerTestComponent]
        }).compileComponents();
    }));

    beforeEach(inject([HttpTestingController], (h: HttpTestingController) => {
        http = h;
    }));

    it('should load doc into innerHTML', () => {
        const fixture = TestBed.createComponent(DocViewerTestComponent);
        fixture.detectChanges();

        const url = fixture.componentInstance.documentUrl;
        http.expectOne(url).flush(FAKE_DOCS[url]);

        const docViewer = fixture.debugElement.query(By.directive(DocsLiveExample));
        expect(docViewer).not.toBeNull();
        expect(docViewer.nativeElement.innerHTML).toBe('<div>my docs page</div>');
    });

    it('should save textContent of the doc', () => {
        const fixture = TestBed.createComponent(DocViewerTestComponent);
        fixture.detectChanges();

        const url = fixture.componentInstance.documentUrl;
        http.expectOne(url).flush(FAKE_DOCS[url]);

        const docViewer = fixture.debugElement.query(By.directive(DocsLiveExample));
        expect(docViewer.componentInstance.textContent).toBe('my docs page');
    });


    it('should correct hash based links', () => {
        const fixture = TestBed.createComponent(DocViewerTestComponent);
        fixture.componentInstance.documentUrl = `//koobiq.io/doc-with-links.html`;
        fixture.detectChanges();

        const url = fixture.componentInstance.documentUrl;
        http.expectOne(url).flush(FAKE_DOCS[url]);

        const docViewer = fixture.debugElement.query(By.directive(DocsLiveExample));
        // Our test runner runs at the page /context.html, so it will be the prepended value.
        expect(docViewer.nativeElement.innerHTML).toContain(`/context.html#test"`);
    });
});

@Component({
    selector: 'test',
    template: `
        <docs-live-example [documentUrl]="documentUrl"></docs-live-example>`
})
class DocViewerTestComponent {
    documentUrl = '//koobiq.io/simple-doc.html';
}

const FAKE_DOCS = {
    '//koobiq.io/simple-doc.html': '<div>my docs page</div>',
    '//koobiq.io/doc-with-example.html': `
      <div>Check out this example:</div>
      <div koobiq-docs-example="some-example"></div>`,
    '//koobiq.io/doc-with-links.html': `<a href="#test">Test link</a>`,
    '//koobiq.io/doc-with-element-ids.html': `<h4 id="my-header">Header</h4>`
};
