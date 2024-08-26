import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DocsearchComponent } from './docsearch.component';

const DOCSEARCH_BUTTON_SELECTOR = 'DocSearch-Button';
const DOCSEARCH_MODAL_SELECTOR = 'DocSearch-Modal';

@Component({
    selector: 'test-app',
    standalone: true,
    template: '<docs-docsearch />',
    imports: [DocsearchComponent]
})
class TestApp {}

const getDocsearchButton = (): HTMLButtonElement => {
    return document.getElementsByClassName(DOCSEARCH_BUTTON_SELECTOR)[0] as HTMLButtonElement;
};

const getDocsearchModal = (): HTMLDivElement => {
    return document.getElementsByClassName(DOCSEARCH_MODAL_SELECTOR)[0] as HTMLDivElement;
};

describe(DocsearchComponent.name, () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestApp]
        }).compileComponents();
        TestBed.createComponent(TestApp);
    });

    it(`should render "${DOCSEARCH_BUTTON_SELECTOR}"`, () => {
        expect(getDocsearchButton()).toBeInstanceOf(HTMLButtonElement);
    });

    it(`should open "${DOCSEARCH_MODAL_SELECTOR}" on "${DOCSEARCH_BUTTON_SELECTOR}" click`, () => {
        expect(getDocsearchModal()).toBeUndefined();
        getDocsearchButton().click();
        expect(getDocsearchModal()).toBeInstanceOf(HTMLDivElement);
    });
});
