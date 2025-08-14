import { ChangeDetectionStrategy, Component, DebugElement, model, Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLinkModule } from '../link';
import { KbqDynamicTranslation } from './dynamic-translation';
import { KbqDynamicTranslationModule } from './module';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getDynamicTranslationDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqDynamicTranslation));
};

@Component({
    standalone: true,
    imports: [KbqDynamicTranslationModule, KbqLinkModule],
    selector: 'test-dynamic-translation',
    template: `
        <kbq-dynamic-translation [text]="text()">
            <a *kbqDynamicTranslationSlot="'testSlot1'; let context" kbq-link href="#">{{ context }}</a>
            <strong *kbqDynamicTranslationSlot="'testSlot2'; let context">{{ context }}</strong>
            <ul *kbqDynamicTranslationSlot="'testListSlot'; let list">
                @for (item of list; track $index) {
                    <li>{{ item }}</li>
                }
            </ul>
        </kbq-dynamic-translation>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestDynamicTranslation {
    readonly text = model(
        'text before slot1 [[testSlot1:slot1 context]] text between slots [[testSlot2:slot2 context]] text after slot2'
    );
}

describe(KbqDynamicTranslationModule.name, () => {
    it('should render component with 2 slots', () => {
        const { debugElement } = createComponent(TestDynamicTranslation);

        expect(getDynamicTranslationDebugElement(debugElement).nativeNode).toMatchSnapshot();
    });

    it('should change text dynamically', () => {
        const fixture = createComponent(TestDynamicTranslation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.text.set('NEW text before slot [[testSlot1:NEW slot context]] NEW text after slot');
        fixture.detectChanges();

        expect(getDynamicTranslationDebugElement(debugElement).nativeNode).toMatchSnapshot();
    });

    it('should render text without slots', () => {
        const fixture = createComponent(TestDynamicTranslation);
        const { debugElement, componentInstance } = fixture;
        const text = 'text without any slot';

        componentInstance.text.set(text);
        fixture.detectChanges();

        expect(getDynamicTranslationDebugElement(debugElement).nativeElement.textContent).toBe(text);
    });

    it('should handle empty text input', () => {
        const fixture = createComponent(TestDynamicTranslation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.text.set('');
        fixture.detectChanges();

        expect(getDynamicTranslationDebugElement(debugElement).nativeElement.textContent).toBe('');
    });

    it('should handle slots without context', () => {
        const fixture = createComponent(TestDynamicTranslation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.text.set('with empty slots [[testSlot1]]');
        fixture.detectChanges();

        expect(getDynamicTranslationDebugElement(debugElement).nativeNode).toMatchSnapshot();
    });

    it('should handle multiple same slots', () => {
        const fixture = createComponent(TestDynamicTranslation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.text.set(
            'first slot [[testSlot2:first context]] and second slot [[testSlot2:second context]]'
        );
        fixture.detectChanges();

        expect(getDynamicTranslationDebugElement(debugElement).nativeNode).toMatchSnapshot();
    });

    it('should handle list-like slot context (parentheses)', () => {
        const fixture = createComponent(TestDynamicTranslation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.text.set('with list [[testListSlot:(item1,item2,item3)]]');
        fixture.detectChanges();

        expect(getDynamicTranslationDebugElement(debugElement).nativeNode).toMatchSnapshot();
    });

    it('should handle special characters', () => {
        const fixture = createComponent(TestDynamicTranslation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.text.set(
            'with special chars [[testSlot2:0123456789!@#$%^&*()_+-=[]{}]] and 0123456789!@#$%^&*()_+-=[]{}'
        );
        fixture.detectChanges();

        expect(getDynamicTranslationDebugElement(debugElement).nativeNode).toMatchSnapshot();
    });

    it('should handle malformed slot syntax', () => {
        const fixture = createComponent(TestDynamicTranslation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.text.set('with [[incomplete and [invalid] and [[testSlot2:valid]] syntax');
        fixture.detectChanges();

        expect(getDynamicTranslationDebugElement(debugElement).nativeNode).toMatchSnapshot();
    });

    it('should handle unicode characters', () => {
        const fixture = createComponent(TestDynamicTranslation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.text.set('with unicode [[testSlot2:тест 测试 🎉]]');
        fixture.detectChanges();

        expect(getDynamicTranslationDebugElement(debugElement).nativeNode).toMatchSnapshot();
    });

    it('should handle undefined slot', () => {
        const fixture = createComponent(TestDynamicTranslation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.text.set('with undefined slot [[undefinedSlot:undefined slot context]]');
        fixture.detectChanges();

        expect(getDynamicTranslationDebugElement(debugElement).nativeNode).toMatchSnapshot();
    });
});
