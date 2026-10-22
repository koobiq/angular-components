import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchKeyboardEvent, ENTER } from '@koobiq/components/core';
import { KbqNavbarModule } from '@koobiq/components/navbar';

@Component({
    selector: 'test-disabled-item-app',
    imports: [KbqNavbarModule],
    template: `
        <kbq-navbar>
            <kbq-navbar-container>
                <kbq-navbar-item id="disabled-item" [disabled]="true" (click)="clicks = clicks + 1">
                    <kbq-navbar-title>Disabled</kbq-navbar-title>
                </kbq-navbar-item>
                <a href="#followed" id="disabled-link" kbq-navbar-item [disabled]="true">
                    <kbq-navbar-title>Disabled link</kbq-navbar-title>
                </a>
                <a href="#followed" id="disabled-brand" kbq-navbar-brand [disabled]="true">
                    <kbq-navbar-title>Disabled brand</kbq-navbar-title>
                </a>
            </kbq-navbar-container>
        </kbq-navbar>
    `
})
class TestDisabledItemApp {
    clicks = 0;
}

describe('triage: activation of a disabled item', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [TestDisabledItemApp] }));

    const setup = () => {
        const fixture = TestBed.createComponent(TestDisabledItemApp);

        fixture.detectChanges();

        const byId = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;

        return { fixture, byId };
    };

    it('DEFECT: a click dispatched on a disabled item runs its click handler', () => {
        const { fixture, byId } = setup();
        const item = byId('disabled-item');

        expect(item.getAttribute('aria-disabled')).toBe('true');

        item.click();

        expect(fixture.componentInstance.clicks).toBe(1);
    });

    it('DEFECT: a click dispatched on a disabled link item is not cancelled, while a disabled brand cancels it', () => {
        const { byId } = setup();
        const prevented = new Map<string, boolean>();

        // Records what the navbar left of the event, then stops jsdom from following the link.
        const record = (event: MouseEvent) => {
            prevented.set((event.currentTarget as HTMLElement).id, event.defaultPrevented);
            event.preventDefault();
        };

        const link = byId('disabled-link');
        const brand = byId('disabled-brand');

        link.addEventListener('click', record);
        brand.addEventListener('click', record);

        link.click();
        brand.click();

        expect(prevented.get('disabled-link')).toBe(false);
        // The brand's capturing listener stops the event before any bubbling listener of its own.
        expect(prevented.has('disabled-brand')).toBe(false);
    });

    it('DEFECT: Enter on a focused disabled item clicks it', () => {
        const { fixture, byId } = setup();
        const item = byId('disabled-item');

        item.focus();

        const event = dispatchKeyboardEvent(item, 'keydown', ENTER);

        expect(fixture.componentInstance.clicks).toBe(1);
        expect(event.defaultPrevented).toBe(true);
    });
});
