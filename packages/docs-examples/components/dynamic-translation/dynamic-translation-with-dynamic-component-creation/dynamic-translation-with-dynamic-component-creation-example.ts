import {
    ApplicationRef,
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    createComponent,
    effect,
    ElementRef,
    inject,
    Renderer2,
    viewChild
} from '@angular/core';
import { KbqDynamicTranslationHelper, KbqDynamicTranslationHelperSlot } from '@koobiq/components/dynamic-translation';
import { injectExampleText } from '../l10n';

/**
 * @title Dynamic-translation with dynamic component creation
 */
@Component({
    selector: 'dynamic-translation-with-dynamic-component-creation-example',
    template: `
        <div #container></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicTranslationWithDynamicComponentCreationExample {
    private readonly applicationRef = inject(ApplicationRef);
    private readonly renderer = inject(Renderer2);
    private readonly container = viewChild.required('container', { read: ElementRef });

    protected readonly text = injectExampleText();

    constructor() {
        effect((onCleanup) => {
            const componentRef = this.createElement(this.text().registered, [{ name: 'bold', tag: 'b' }]);

            this.renderer.appendChild(this.container().nativeElement, componentRef.location.nativeElement);
            onCleanup(() => componentRef.destroy());
        });
    }

    private createElement(
        text: string,
        slots: KbqDynamicTranslationHelperSlot[]
    ): ComponentRef<KbqDynamicTranslationHelper> {
        const componentRef = createComponent(KbqDynamicTranslationHelper, {
            environmentInjector: this.applicationRef.injector
        });

        componentRef.setInput('text', text);
        componentRef.setInput('slots', slots);
        this.applicationRef.attachView(componentRef.hostView);
        componentRef.changeDetectorRef.detectChanges();

        return componentRef;
    }
}
