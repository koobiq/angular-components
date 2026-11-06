import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqScrollbar, KbqScrollbarViewport } from '@koobiq/components/scrollbar';

@Component({
    selector: 'test-nan-hide-delay',
    imports: [KbqScrollbar],
    template: `
        <kbq-scrollbar
            kbqScrollbarMode="hover"
            style="overflow-x: auto; overflow-y: auto"
            [kbqScrollbarHideDelay]="hideDelay"
        >
            content
        </kbq-scrollbar>
    `
})
class TestApp {
    hideDelay: unknown = 1000;
    readonly host = viewChild.required(KbqScrollbar, { read: ElementRef<HTMLElement> });
}

describe('triage: a non-numeric kbqScrollbarHideDelay', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const render = (hideDelay: unknown): ComponentFixture<TestApp> => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        const fixture = TestBed.createComponent(TestApp);

        fixture.componentInstance.hideDelay = hideDelay;
        fixture.autoDetectChanges();

        return fixture;
    };

    const scrollAndWait = async (fixture: ComponentFixture<TestApp>, ms: number): Promise<HTMLElement> => {
        const track: HTMLElement = fixture.nativeElement.querySelector('kbq-scrollbar-track');

        fixture.componentInstance.host().nativeElement.dispatchEvent(new Event('scroll'));
        fixture.detectChanges();
        expect(track.classList).toContain('kbq-scrollbar-track_revealed');

        await vi.advanceTimersByTimeAsync(ms);
        fixture.detectChanges();

        return track;
    };

    it('control: with the numeric default the track is still revealed 1 ms after a scroll', async () => {
        const track = await scrollAndWait(render(1000), 1);

        expect(track.classList).toContain('kbq-scrollbar-track_revealed');
    });

    it.each(['abc', '', undefined, null])(
        'DEFECT: kbqScrollbarHideDelay=%j becomes NaN and the track hides on the next task after a scroll',
        async (value) => {
            const fixture = render(value);
            const viewport = fixture.debugElement.query(By.directive(KbqScrollbar)).injector.get(KbqScrollbarViewport);

            expect(viewport.hideDelay()).toBeNaN();

            const track = await scrollAndWait(fixture, 1);

            expect(track.classList).not.toContain('kbq-scrollbar-track_revealed');
        }
    );
});
