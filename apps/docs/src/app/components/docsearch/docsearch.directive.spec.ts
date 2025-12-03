import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocsDocsearchDirective } from './docsearch.directive';

@Component({
    imports: [DocsDocsearchDirective],
    template: '<docs-docsearch />'
})
class TestApp {}

const render = (): ComponentFixture<TestApp> => {
    TestBed.configureTestingModule({ imports: [TestApp] }).compileComponents();
    const fixture = TestBed.createComponent(TestApp);

    fixture.autoDetectChanges();

    return fixture;
};

const getDocsearchButton = (): HTMLButtonElement => {
    return document.getElementsByClassName('DocSearch-Button')[0] as HTMLButtonElement;
};

const getDocsearchModal = (): HTMLDivElement => {
    return document.getElementsByClassName('DocSearch-Modal')[0] as HTMLDivElement;
};

describe(DocsDocsearchDirective.name, () => {
    it(`should render docsearch button`, async () => {
        render();
        expect(getDocsearchButton()).toBeInstanceOf(HTMLButtonElement);
    });

    it(`should open docsearch modal`, async () => {
        render();
        expect(getDocsearchModal()).toBeUndefined();
        getDocsearchButton().click();
        expect(getDocsearchModal()).toBeInstanceOf(HTMLDivElement);
    });
});
