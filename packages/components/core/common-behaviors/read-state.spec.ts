import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { KbqReadStateDirective } from './read-state';

@Component({
    selector: 'read-state-host',
    template: `
        <button type="button">first</button>
        <button type="button">second</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [KbqReadStateDirective]
})
class ReadStateHost {
    readonly readState = inject(KbqReadStateDirective, { host: true });
}

describe(KbqReadStateDirective.name, () => {
    let fixture: ComponentFixture<ReadStateHost>;
    let host: HTMLElement;
    let readState: KbqReadStateDirective;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ReadStateHost] });

        fixture = TestBed.createComponent(ReadStateHost);
        fixture.detectChanges();

        host = fixture.debugElement.nativeElement as HTMLElement;
        readState = fixture.componentInstance.readState;
    });

    const buttons = () => Array.from(host.querySelectorAll('button'));

    const focusIn = (target: HTMLElement) => target.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    const focusOut = (target: HTMLElement, relatedTarget: HTMLElement | null) =>
        target.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget }));

    it('marks the host read after dwelling on it with the pointer', fakeAsync(() => {
        host.dispatchEvent(new MouseEvent('mouseenter'));
        tick(600);
        host.dispatchEvent(new MouseEvent('mouseleave'));

        expect(readState.read.value).toBe(true);
    }));

    it('leaves the host unread after a dwell shorter than timeToRead', fakeAsync(() => {
        host.dispatchEvent(new MouseEvent('mouseenter'));
        tick(100);
        host.dispatchEvent(new MouseEvent('mouseleave'));

        expect(readState.read.value).toBe(false);
    }));

    it('keeps a focus dwell running when the pointer passes over the host and leaves', fakeAsync(() => {
        focusIn(host);

        tick(100);
        host.dispatchEvent(new MouseEvent('mouseenter'));
        tick(100);
        host.dispatchEvent(new MouseEvent('mouseleave'));

        // The pointer was only there for 100ms. A single shared timestamp used to be cleared here, so
        // the keyboard dwell still in progress could never be reported afterwards.
        expect(readState.read.value).toBe(false);

        tick(10000);
        focusOut(host, null);

        expect(readState.read.value).toBe(true);
    }));

    it('does not restart the dwell when focus moves between controls inside the host', fakeAsync(() => {
        const [first, second] = buttons();

        focusIn(first);
        tick(400);

        // Both events bubble, so a hop between the host's own controls reaches the host as a
        // focusout/focusin pair — `relatedTarget` is what tells it apart from the user leaving.
        focusOut(first, second);
        focusIn(second);

        tick(200);
        focusOut(second, null);

        // One continuous 600ms dwell, not a 400ms one followed by a 200ms one.
        expect(readState.read.value).toBe(true);
    }));
});
