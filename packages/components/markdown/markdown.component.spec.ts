import { Component, Provider, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, ComponentFixtureAutoDetect, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqMarkdownModule } from '@koobiq/components/markdown';


function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            KbqMarkdownModule,
            ...imports
        ],
        declarations: [component],
        providers: [
            { provide: ComponentFixtureAutoDetect, useValue: true },
            ...providers
        ]
    }).compileComponents();

    return TestBed.createComponent<T>(component);
}


// tslint:disable no-unnecessary-class
@Component({
    template: '<kbq-markdown [markdownText]="markdownText"></kbq-markdown>'
})
class KbqMarkdownWithAttribute {
    markdownText: string = '';
}

@Component({
    template: '<kbq-markdown>## header test</kbq-markdown>'
})
class KbqMarkdownWithContent {}


describe('KbqMarkdown', () => {
    describe('basic behaviors', () => {
        it('should render markdown from attribute', fakeAsync(() => {
            const headerTest = 'header test';
            const fixture = createComponent(KbqMarkdownWithAttribute);
            fixture.componentInstance.markdownText = `# ${headerTest}`;
            fixture.detectChanges();

            tick();

            const mdElement = fixture.debugElement.query(By.css('.kbq-markdown > .markdown-output > h1'));

            expect(mdElement.nativeElement.textContent).toBe(headerTest);
        }));

        it('should render markdown from content', fakeAsync(() => {
            const headerTest = 'header test';
            const fixture = createComponent(KbqMarkdownWithContent);
            fixture.detectChanges();

            tick();
            const mdElement = fixture.debugElement.query(By.css('.kbq-markdown > .markdown-output > h2'));

            expect(mdElement?.nativeElement.textContent).toBe(headerTest);
        }));
    });
});
