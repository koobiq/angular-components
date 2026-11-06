import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqDynamicTranslationHelper, KbqDynamicTranslationHelperSlot } from '@koobiq/components/dynamic-translation';

@Component({
    selector: 'test-helper-null-content',
    imports: [KbqDynamicTranslationHelper],
    template: `
        <kbq-dynamic-translation-with-dynamic-component-creation [text]="text" [slots]="slots" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly text = 'Status [[icon]] ok';
    readonly slots: KbqDynamicTranslationHelperSlot[] = [
        { name: 'icon', tag: 'i', attributes: [{ key: 'class', value: 'test-icon' }] }
    ];
}

describe('KbqDynamicTranslationHelper triage: slot without content', () => {
    it('DEFECT: a slot without content in a marker without context renders the text "null"', () => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement.querySelector(
            'kbq-dynamic-translation-with-dynamic-component-creation'
        );
        const icon = host.querySelector('i.test-icon');

        expect(icon).not.toBeNull();
        expect(icon?.textContent).toBe('null');
        expect(host.textContent?.replace(/\s+/g, ' ').trim()).toBe('Status null ok');
    });
});
