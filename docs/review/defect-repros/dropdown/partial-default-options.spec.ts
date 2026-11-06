import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    KBQ_DROPDOWN_DEFAULT_OPTIONS,
    KBQ_DROPDOWN_DEFAULT_OPTIONS_FACTORY,
    KbqDropdown,
    KbqDropdownModule,
    KbqDropdownTrigger
} from '@koobiq/components/dropdown';

@Component({
    imports: [KbqDropdownModule],
    template: `
        <button [kbqDropdownTriggerFor]="dropdown">Open</button>
        <kbq-dropdown #dropdown="kbqDropdown">
            <button kbq-dropdown-item>Item</button>
        </kbq-dropdown>
    `
})
class TestApp {
    readonly trigger = viewChild.required(KbqDropdownTrigger);
    readonly dropdown = viewChild.required(KbqDropdown);
}

function create(defaults: unknown) {
    TestBed.configureTestingModule({
        imports: [TestApp],
        providers: [{ provide: KBQ_DROPDOWN_DEFAULT_OPTIONS, useValue: defaults }]
    });

    const fixture = TestBed.createComponent(TestApp);

    fixture.detectChanges();

    return fixture;
}

describe('triage: partial KBQ_DROPDOWN_DEFAULT_OPTIONS', () => {
    it('control: a full default object with safeArea off opens', () => {
        const fixture = create({ ...KBQ_DROPDOWN_DEFAULT_OPTIONS_FACTORY(), safeArea: false });
        const trigger = fixture.componentInstance.trigger();

        trigger.open();
        fixture.detectChanges();

        expect(trigger.opened).toBe(true);
    });

    it('DEFECT: a partial default ({ safeArea: false }) leaves xPosition undefined and open() throws a TypeError', () => {
        const fixture = create({ safeArea: false });
        const { trigger, dropdown } = fixture.componentInstance;

        expect(dropdown().safeArea()).toBe(false);
        // Not validated: the position validation effect skips the default value.
        expect(dropdown().xPosition()).toBeUndefined();

        expect(() => trigger().open()).toThrow(TypeError);
        expect(trigger().opened).toBe(false);
    });
});
