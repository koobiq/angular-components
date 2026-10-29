import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqDynamicTranslationHelper, KbqDynamicTranslationHelperSlot } from '@koobiq/components/dynamic-translation';

@Component({
    selector: 'test-helper-unsanitized',
    imports: [KbqDynamicTranslationHelper],
    template: `
        <kbq-dynamic-translation-with-dynamic-component-creation [text]="text" [slots]="slots" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly text = 'Open [[link:profile]] then [[code:globalThis.kbqTriageInjected = true]]';
    readonly slots: KbqDynamicTranslationHelperSlot[] = [
        { name: 'link', tag: 'a', attributes: [{ key: 'href', value: 'javascript:void(0)' }] },
        { name: 'code', tag: 'script' }
    ];
}

describe('KbqDynamicTranslationHelper triage: sanitization', () => {
    it('DEFECT: a javascript: href and a script tag with text from the translation reach the DOM unsanitized', () => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement.querySelector(
            'kbq-dynamic-translation-with-dynamic-component-creation'
        );
        const link = host.querySelector('a');
        const script = host.querySelector('script');

        // Angular's own [attr.href] binding would prefix the value with "unsafe:".
        expect(link?.getAttribute('href')).toBe('javascript:void(0)');
        expect(script).not.toBeNull();
        expect(script?.isConnected).toBe(true);
        expect(script?.textContent).toBe('globalThis.kbqTriageInjected = true');
    });
});
