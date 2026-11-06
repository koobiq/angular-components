import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqDynamicTranslationModule } from '@koobiq/components/dynamic-translation';

@Component({
    selector: 'test-empty-context',
    imports: [KbqDynamicTranslationModule],
    template: `
        <kbq-dynamic-translation [text]="text()">
            <strong *kbqDynamicTranslationSlot="'a'; let context">{{ context }}</strong>
            <em *kbqDynamicTranslationSlot="'b'; let context">{{ context }}</em>
        </kbq-dynamic-translation>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly text = signal('[[a:]] x [[b:y]]');
}

describe('KbqDynamicTranslation triage: empty context', () => {
    it('DEFECT: [[a:]] runs its context on to a later ]] and swallows the text and markers in between', () => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-dynamic-translation');
        const strong = host.querySelectorAll('strong');

        expect(strong.length).toBe(1);
        expect(strong[0].textContent).toBe(']] x [[b:y');
        expect(host.querySelectorAll('em').length).toBe(0);
        expect(host.textContent).toBe(']] x [[b:y');
    });
});
