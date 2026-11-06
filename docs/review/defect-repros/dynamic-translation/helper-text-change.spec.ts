import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqDynamicTranslationHelper, KbqDynamicTranslationHelperSlot } from '@koobiq/components/dynamic-translation';

@Component({
    selector: 'test-helper-text-change',
    imports: [KbqDynamicTranslationHelper],
    template: `
        <kbq-dynamic-translation-with-dynamic-component-creation [text]="text()" [slots]="slots" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly text = signal('[[bold:first]] tail');
    readonly slots: KbqDynamicTranslationHelperSlot[] = [
        { name: 'bold', tag: 'b' },
        { name: 'italic', tag: 'i' }
    ];
}

const setup = () => {
    TestBed.configureTestingModule({ imports: [TestApp] });
    const fixture = TestBed.createComponent(TestApp);

    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement.querySelector(
        'kbq-dynamic-translation-with-dynamic-component-creation'
    );

    return { fixture, host };
};

describe('KbqDynamicTranslationHelper triage: text change', () => {
    it('replaces the placeholder on the first render', () => {
        const { host } = setup();

        expect(host.querySelector('b')?.textContent).toBe('first');
        expect(host.querySelector('span[data-slot-name]')).toBeNull();
    });

    it('DEFECT: after a text change the created element keeps its first text and a new marker stays an empty placeholder span', async () => {
        const { fixture, host } = setup();

        fixture.componentInstance.text.set('[[bold:second]] and [[italic:new]]');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(host.querySelectorAll('b').length).toBe(1);
        expect(host.querySelector('b')?.textContent).toBe('first');
        expect(host.querySelector('i')).toBeNull();

        const placeholder = host.querySelector('span[data-slot-name="italic"]');

        expect(placeholder).not.toBeNull();
        expect(placeholder?.getAttribute('data-slot-content')).toBe('new');
        expect(placeholder?.textContent).toBe('');
    });

    it('DEFECT: the element of a removed marker stays in the DOM', async () => {
        const { fixture, host } = setup();

        fixture.componentInstance.text.set('plain text');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(host.querySelector('b')?.textContent).toBe('first');
        expect(host.textContent).toContain('first');
        expect(host.textContent).toContain('plain text');
    });
});
