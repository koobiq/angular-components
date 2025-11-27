import {
    ApplicationRef,
    ChangeDetectionStrategy,
    Component,
    createComponent,
    effect,
    ElementRef,
    inject,
    Renderer2,
    viewChild
} from '@angular/core';
import { KbqDynamicTranslationHelper, KbqDynamicTranslationHelperSlot } from '@koobiq/components/dynamic-translation';

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

    constructor() {
        effect(() => {
            this.renderer.appendChild(
                this.container().nativeElement,
                this.createElement('[[bold:1000]] incidents have been registered.', [{ name: 'bold', tag: 'b' }])
            );
        });
    }

    private createElement(text: string, slots: KbqDynamicTranslationHelperSlot[]): HTMLElement {
        const componentRef = createComponent(KbqDynamicTranslationHelper, {
            environmentInjector: this.applicationRef.injector
        });

        componentRef.setInput('text', text);
        componentRef.setInput('slots', slots);
        this.applicationRef.attachView(componentRef.hostView);
        componentRef.changeDetectorRef.detectChanges();

        return componentRef.location.nativeElement as HTMLElement;
    }
}
