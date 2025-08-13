import { Component, DebugElement, model, Provider, signal, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqContentPanelContainer } from './content-panel';
import { KbqContentPanelModule } from './module';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component, NoopAnimationsModule], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getCloseButtonElement = (debugElement: DebugElement): HTMLButtonElement => {
    return debugElement.nativeElement.querySelector('.kbq-content-panel-header__close-button');
};

const getContentPanelContainerElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.nativeElement.querySelector('.kbq-content-panel-container')!;
};

const getContentPanelContainerPanelElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.nativeElement.querySelector('.kbq-content-panel-container__panel')!;
};

const ESCAPE_KEY_EVENT = new KeyboardEvent('keydown', { key: 'Escape' });

@Component({
    standalone: true,
    imports: [KbqContentPanelModule],
    selector: 'test-content-panel',
    template: `
        <kbq-content-panel-container
            [width]="width()"
            [maxWidth]="maxWidth()"
            [minWidth]="minWidth()"
            [disableClose]="disableClose()"
            [disableCloseByEscape]="disableCloseByEscape()"
            [(opened)]="opened"
        >
            <div>test</div>

            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>Test</div>
                    <div kbqContentPanelHeaderActions>
                        <button>test</button>
                    </div>
                </kbq-content-panel-header>

                <kbq-content-panel-body>
                    @for (_i of paragraphs; track $index) {
                        <p>test</p>
                    }
                </kbq-content-panel-body>

                <kbq-content-panel-footer>
                    <button>test</button>
                </kbq-content-panel-footer>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestContentPanel {
    readonly container = viewChild.required(KbqContentPanelContainer);

    readonly opened = model(false);
    readonly minWidth = signal(300);
    readonly width = signal(400);
    readonly maxWidth = signal(500);
    readonly disableClose = signal(false);
    readonly disableCloseByEscape = signal(false);

    readonly paragraphs = Array.from({ length: 100 });
}

describe(KbqContentPanelModule.name, () => {
    it('should toggle panel by KbqContentPanelContainer instance', () => {
        const { componentInstance } = createComponent(TestContentPanel);

        expect(componentInstance.opened()).toBe(false);

        componentInstance.container().toggle();
        expect(componentInstance.opened()).toBe(true);

        componentInstance.container().toggle();
        expect(componentInstance.opened()).toBe(false);
    });

    it('should open/close panel by KbqContentPanelContainer instance', () => {
        const { componentInstance } = createComponent(TestContentPanel);

        expect(componentInstance.opened()).toBe(false);

        componentInstance.container().close();
        expect(componentInstance.opened()).toBe(false);

        componentInstance.container().open();
        expect(componentInstance.opened()).toBe(true);
    });

    it('should open panel by KbqContentPanelContainer instance', () => {
        const { componentInstance } = createComponent(TestContentPanel);

        expect(componentInstance.opened()).toBe(false);

        componentInstance.container().open();
        expect(componentInstance.opened()).toBe(true);
    });

    it('should open/close panel by two-way binding', () => {
        const { componentInstance } = createComponent(TestContentPanel);

        expect(componentInstance.opened()).toBe(false);

        componentInstance.opened.set(true);
        expect(componentInstance.opened()).toBe(true);

        componentInstance.opened.set(false);
        expect(componentInstance.opened()).toBe(false);
    });

    it('should close panel by close button', () => {
        const fixture = createComponent(TestContentPanel);
        const { componentInstance, debugElement } = fixture;

        componentInstance.container().open();
        fixture.detectChanges();
        expect(componentInstance.opened()).toBe(true);

        getCloseButtonElement(debugElement).click();

        expect(componentInstance.opened()).toBe(false);
    });

    it('should hide close button by disableClose attribute', async () => {
        const fixture = createComponent(TestContentPanel);
        const { componentInstance, debugElement } = fixture;

        componentInstance.disableClose.set(true);
        componentInstance.container().open();
        await fixture.whenStable();
        expect(componentInstance.opened()).toBe(true);

        expect(getCloseButtonElement(debugElement)).toBeNull();
    });

    it('should close panel by pressing ESCAPE key', async () => {
        const fixture = createComponent(TestContentPanel);
        const { componentInstance, debugElement } = fixture;

        componentInstance.container().open();
        await fixture.whenStable();
        expect(componentInstance.opened()).toBe(true);

        getContentPanelContainerElement(debugElement).dispatchEvent(ESCAPE_KEY_EVENT);
        expect(componentInstance.opened()).toBe(false);
    });

    it('should NOT close panel by pressing ESCAPE key when disableClose attribute is provided', async () => {
        const fixture = createComponent(TestContentPanel);
        const { componentInstance, debugElement } = fixture;

        componentInstance.disableClose.set(true);
        componentInstance.container().open();
        await fixture.whenStable();
        expect(componentInstance.opened()).toBe(true);

        getContentPanelContainerElement(debugElement).dispatchEvent(ESCAPE_KEY_EVENT);
        expect(componentInstance.opened()).toBe(true);
    });

    it('should NOT close panel by pressing ESCAPE key when disableCloseByEscape attribute is provided', async () => {
        const fixture = createComponent(TestContentPanel);
        const { componentInstance, debugElement } = fixture;

        componentInstance.disableClose.set(false);
        componentInstance.disableCloseByEscape.set(true);
        componentInstance.container().open();
        await fixture.whenStable();
        expect(componentInstance.opened()).toBe(true);

        getContentPanelContainerElement(debugElement).dispatchEvent(ESCAPE_KEY_EVENT);
        expect(componentInstance.opened()).toBe(true);
    });

    it('should setup width/minWidth/maxWidth', async () => {
        const fixture = createComponent(TestContentPanel);
        const { componentInstance, debugElement } = fixture;

        componentInstance.minWidth.set(222);
        componentInstance.width.set(333);
        componentInstance.maxWidth.set(444);
        componentInstance.container().open();
        await fixture.whenStable();

        const { style } = getContentPanelContainerPanelElement(debugElement);

        expect(style.minWidth).toBe('222px');
        expect(style.width).toBe('333px');
        expect(style.maxWidth).toBe('444px');
    });
});
