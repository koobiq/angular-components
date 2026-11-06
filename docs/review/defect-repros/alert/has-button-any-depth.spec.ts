import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqAlert, KbqAlertCloseButton, KbqAlertControl } from '@koobiq/components/alert';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';

const createComponent = <T>(component: new () => T): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });
    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

const getStack = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.debugElement.query(By.css('.kbq-alert__button-stack')).nativeElement;

describe('triage: alert has-button modifier', () => {
    it('DEFECT: a kbq-button used as the close control marks a link-only button stack as has-button', () => {
        const fixture = createComponent(CloseButtonIsKbqButton);

        expect(getStack(fixture).classList).toContain('kbq-alert__button-stack_has-button');
    });

    it('DEFECT: a kbq-button inside the text marks a link-only button stack as has-button', () => {
        const fixture = createComponent(KbqButtonInText);

        expect(getStack(fixture).classList).toContain('kbq-alert__button-stack_has-button');
    });

    it('control: a link-only button stack without any kbq-button has no has-button modifier', () => {
        const fixture = createComponent(LinkOnly);

        expect(getStack(fixture).classList).not.toContain('kbq-alert__button-stack_has-button');
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqAlert, KbqAlertControl, KbqAlertCloseButton, KbqButton, KbqButtonCssStyler],
    template: `
        <kbq-alert>
            Alert text
            <a href="#" kbq-alert-control>Link</a>
            <button kbq-alert-close-button kbq-button>Close</button>
        </kbq-alert>
    `
})
class CloseButtonIsKbqButton {}

@Component({
    selector: 'test-app',
    imports: [KbqAlert, KbqAlertControl, KbqButton, KbqButtonCssStyler],
    template: `
        <kbq-alert>
            <span>
                Alert text
                <button kbq-button>Inline</button>
            </span>
            <a href="#" kbq-alert-control>Link</a>
        </kbq-alert>
    `
})
class KbqButtonInText {}

@Component({
    selector: 'test-app',
    imports: [KbqAlert, KbqAlertControl],
    template: `
        <kbq-alert>
            Alert text
            <a href="#" kbq-alert-control>Link</a>
        </kbq-alert>
    `
})
class LinkOnly {}
