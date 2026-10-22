import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BACKSPACE, DELETE, dispatchKeyboardEvent, END, HOME, LEFT_ARROW, RIGHT_ARROW } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqNavbarModule } from '@koobiq/components/navbar';

const EDITING_KEYS = [BACKSPACE, DELETE, LEFT_ARROW, RIGHT_ARROW, HOME, END];

@Component({
    selector: 'test-plain-input-app',
    imports: [KbqNavbarModule, KbqFormFieldModule, KbqInputModule],
    template: `
        <kbq-navbar>
            <kbq-navbar-container>
                <kbq-navbar-item>
                    <kbq-navbar-title>First</kbq-navbar-title>
                </kbq-navbar-item>
                <kbq-navbar-item>
                    <input aria-label="Plain" id="plain-horizontal" value="abc" />
                </kbq-navbar-item>
                <kbq-navbar-item>
                    <kbq-form-field>
                        <input aria-label="Koobiq" id="kbq-horizontal" kbqInput value="abc" />
                    </kbq-form-field>
                </kbq-navbar-item>
            </kbq-navbar-container>
        </kbq-navbar>

        <kbq-vertical-navbar>
            <kbq-navbar-container>
                <kbq-navbar-item>
                    <kbq-navbar-title>First</kbq-navbar-title>
                </kbq-navbar-item>
                <kbq-navbar-item>
                    <input aria-label="Plain" id="plain-vertical" value="abc" />
                </kbq-navbar-item>
            </kbq-navbar-container>
        </kbq-vertical-navbar>
    `
})
class TestPlainInputApp {}

describe('triage: navigation keys in a plain input', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [TestPlainInputApp] });
    });

    afterEach(() => vi.useRealTimers());

    const setup = async () => {
        const fixture = TestBed.createComponent(TestPlainInputApp);

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        const byId = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;

        return { fixture, byId };
    };

    const preventedKeys = (input: HTMLInputElement): boolean[] =>
        EDITING_KEYS.map((keyCode) => {
            input.focus();

            // Cursor in the middle of the text, so no edge handling applies.
            input.setSelectionRange(1, 1);

            return dispatchKeyboardEvent(input, 'keydown', keyCode).defaultPrevented;
        });

    it('DEFECT: a horizontal navbar prevents Backspace, Delete, arrows, Home and End typed into a plain input', async () => {
        const { byId } = await setup();

        // Control: the same keys in a kbqInput field keep their default action.
        expect(preventedKeys(byId('kbq-horizontal'))).toEqual(EDITING_KEYS.map(() => false));

        expect(preventedKeys(byId('plain-horizontal'))).toEqual(EDITING_KEYS.map(() => true));
    });

    it('DEFECT: a vertical navbar prevents Backspace, Delete, arrows, Home and End typed into a plain input', async () => {
        const { byId } = await setup();

        expect(preventedKeys(byId('plain-vertical'))).toEqual(EDITING_KEYS.map(() => true));
    });
});
