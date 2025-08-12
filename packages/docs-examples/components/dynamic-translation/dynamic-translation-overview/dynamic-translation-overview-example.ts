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
import {
    KbqDynamicTranslationHelper,
    KbqDynamicTranslationHelperSlot,
    KbqDynamicTranslationModule
} from '@koobiq/components/dynamic-translation';
import { KbqLinkModule } from '@koobiq/components/link';

@Component({
    standalone: true,
    selector: 'ic-dynamic-translation-helper-wrapper',
    template: `
        <div #container></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicTranslationHelperWrapperComponent {
    private readonly appRef = inject(ApplicationRef);
    private readonly renderer = inject(Renderer2);
    protected readonly container = viewChild.required('container', { read: ElementRef });

    constructor() {
        effect(() => {
            this.renderer.appendChild(
                this.container().nativeElement,
                this.createElement(
                    'Отметка о ложном срабатывании правила [[strongTextElement:Unknown connection by SSH]] снята',
                    [
                        {
                            name: 'strongTextElement',
                            tag: 'strong'
                            // attributes: [{ key: 'style', value: 'color: cyan' }]
                        }
                    ]
                )
            );
        });
    }

    private createElement(translation: string, slots: KbqDynamicTranslationHelperSlot[]): HTMLElement {
        const componentRef = createComponent(KbqDynamicTranslationHelper, {
            environmentInjector: this.appRef.injector
        });

        componentRef.setInput('text', translation);
        componentRef.setInput('slots', slots);
        this.appRef.attachView(componentRef.hostView);
        componentRef.changeDetectorRef.detectChanges();

        return componentRef.location.nativeElement as HTMLElement;
    }
}

@Component({
    standalone: true,
    imports: [KbqDynamicTranslationModule, KbqLinkModule, DynamicTranslationHelperWrapperComponent],
    selector: 'dynamic-translation-overview-example',
    template: `
        <kbq-dynamic-translation
            style="display: block"
            [text]="'Инцидент создан. [[link:Откройте в новой вкладке]] чтобы продолжить работу с инцидентом'"
        >
            <a
                *kbqDynamicTranslationSlot="'link'; let content"
                kbq-link
                href="https://koobiq.io/en/dynamic-translation"
                target="_blank"
            >
                {{ content }}
            </a>
        </kbq-dynamic-translation>
        <br />
        <ic-dynamic-translation-helper-wrapper />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicTranslationOverviewExample {}
