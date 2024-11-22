import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HighlightModule } from 'ngx-highlightjs';
import { codeHTML, codeXML } from '../../components-dev/code-block/code-files-example';
import { KbqCodeBlockComponent } from './code-block.component';
import { KbqCodeBlockModule } from './code-block.module';

describe('CodeBlockComponent', () => {
    let component: KbqCodeBlockDefault;
    let fixture: ComponentFixture<KbqCodeBlockDefault>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                HighlightModule,
                KbqCodeBlockModule
            ],
            declarations: [KbqCodeBlockDefault]
        }).compileComponents();

        fixture = TestBed.createComponent(KbqCodeBlockDefault);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component.codeBlock).toBeTruthy();
    });

    it('should switch value on expanding code block', () => {
        component.codeBlock.toggleViewAll();

        expect(component.codeBlock.viewAll).toBe(true);
    });

    it('should have less-contrast class', () => {
        const codeContainer = fixture.debugElement.query(By.css('.kbq-code-block'));
        const codeContainerEl: HTMLElement = codeContainer.nativeElement;

        expect(codeContainerEl.classList.contains('kbq-code-block_filled')).toBeTruthy();
    });

    it('should have 2 tabs', () => {
        const tabsGroup = fixture.debugElement.queryAll(By.css('.kbq-tab-label'));

        expect(tabsGroup.length).toBe(2);
    });

    it('should invoke handler methods after click on buttons in action bar', fakeAsync(() => {
        const codeButtons = fixture.debugElement.queryAll(By.css('.kbq-code-block-actionbar .kbq-button-icon'));
        const downloadCodeSpyFn = jest.spyOn(component.codeBlock, 'downloadCode');
        const copyCodeSpyFn = jest.spyOn(component.codeBlock, 'copyCode');
        const openExternalSystemSpyFn = jest.spyOn(component.codeBlock, 'openExternalSystem');

        expect(codeButtons.length).toBe(3);

        codeButtons[0].triggerEventHandler('click');
        codeButtons[1].triggerEventHandler('click');
        tick(100);
        codeButtons[2].triggerEventHandler('click');

        expect(downloadCodeSpyFn).toHaveBeenCalledTimes(1);
        expect(copyCodeSpyFn).toHaveBeenCalledTimes(1);
        expect(openExternalSystemSpyFn).toHaveBeenCalledTimes(1);
    }));
});

@Component({
    template: `
        <kbq-code-block [filled]="lessContrast" [codeFiles]="codeFiles" [maxHeight]="200" />
    `
})
class KbqCodeBlockDefault {
    @ViewChild(KbqCodeBlockComponent) codeBlock: KbqCodeBlockComponent;

    codeFiles = [
        {
            filename: 'index.html',
            content: codeHTML,
            language: 'html',
            link: 'https://stackblitz.com/edit/web-platform-f5jywg?file=index.html'
        },
        {
            filename: 'menu.xml',
            content: codeXML,
            language: 'xml',
            link: 'https://stackblitz.com/edit/web-platform-f5jywg?file=index.html'
        }
    ];

    lessContrast = true;
}
