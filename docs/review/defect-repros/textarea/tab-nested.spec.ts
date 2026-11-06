import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqTabGroup, KbqTabsModule } from '@koobiq/components/tabs';
import { KbqTextarea, KbqTextareaModule } from '@koobiq/components/textarea';

@Component({
    selector: 'test-textarea-holder',
    imports: [KbqTextareaModule],
    template: `
        <textarea id="nested" kbqTextarea></textarea>
    `
})
class TextareaHolder {}

@Component({
    imports: [KbqTabsModule, KbqTextareaModule, TextareaHolder],
    template: `
        <kbq-tab-group>
            <kbq-tab label="Tab">
                <textarea id="direct" kbqTextarea></textarea>
                <test-textarea-holder />
            </kbq-tab>
        </kbq-tab-group>
    `
})
class TestApp {}

describe('KbqTextarea triage: tab group lookup', () => {
    afterEach(() => vi.useRealTimers());

    it('DEFECT: a textarea declared in a component placed in a tab does not re-measure when the tab animation ends', () => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [TestApp] });

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const textareas = fixture.debugElement.queryAll(By.directive(KbqTextarea));
        const byId = (id: string) =>
            textareas.find((debugElement) => debugElement.nativeElement.id === id)!.injector.get(KbqTextarea);

        const direct = byId('direct');
        const nested = byId('nested');

        const directSpy = vi.spyOn(direct, 'ngOnInit');
        const nestedSpy = vi.spyOn(nested, 'ngOnInit');

        fixture.debugElement.query(By.directive(KbqTabGroup)).injector.get(KbqTabGroup).removeTabBodyWrapperHeight();

        expect(directSpy).toHaveBeenCalledTimes(1);
        expect(nestedSpy).not.toHaveBeenCalled();
    });
});
