import { Directionality } from '@angular/cdk/bidi';
import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqScrollbar } from '@koobiq/components/scrollbar';

@Component({
    selector: 'test-rtl-bare-dir',
    imports: [KbqScrollbar],
    template: `
        <div dir="rtl">
            <kbq-scrollbar kbqScrollbarMode="always" style="overflow-x: auto; overflow-y: auto">content</kbq-scrollbar>
        </div>
    `
})
class TestApp {
    readonly scrollbar = viewChild.required(KbqScrollbar);
    readonly host = viewChild.required(KbqScrollbar, { read: ElementRef<HTMLElement> });
}

// Records the horizontal offset CdkScrollable asks for, whichever of its two write paths it takes.
const recordRequestedLeft = (host: HTMLElement): (() => number | undefined) => {
    let requested: number | undefined;

    Object.defineProperty(host, 'scrollTo', {
        configurable: true,
        value: (options: ScrollToOptions) => (requested = options.left)
    });
    Object.defineProperty(host, 'scrollLeft', {
        configurable: true,
        get: () => 0,
        set: (value: number) => (requested = value)
    });

    return () => requested;
};

describe('triage: scrollTo/scrollEnd under a bare dir="rtl" ancestor', () => {
    const setup = (): { fixture: ComponentFixture<TestApp>; host: HTMLElement } => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const host = fixture.componentInstance.host().nativeElement;

        for (const [key, value] of Object.entries({
            clientHeight: 100,
            scrollHeight: 100,
            clientWidth: 100,
            scrollWidth: 300
        })) {
            Object.defineProperty(host, key, { configurable: true, value });
        }

        return { fixture, host };
    };

    it('DEFECT: scrollEnd() requests a positive scrollLeft, which an RTL scroller clamps to its start', () => {
        const { fixture, host } = setup();
        const requestedLeft = recordRequestedLeft(host);

        expect(host.closest('[dir="rtl"]')).not.toBeNull();
        expect(TestBed.inject(Directionality).value).toBe('ltr');

        fixture.componentInstance.scrollbar().scrollEnd();

        expect(requestedLeft()).toBe(200);
    });

    it('DEFECT: scrollTo({ start: 50 }) requests scrollLeft +50 instead of the RTL -50', () => {
        const { fixture, host } = setup();
        const requestedLeft = recordRequestedLeft(host);

        fixture.componentInstance.scrollbar().scrollTo({ start: 50 });

        expect(requestedLeft()).toBe(50);
    });
});
