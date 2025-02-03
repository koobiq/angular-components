import { inject, NgModule, Provider, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KbqLocaleService } from '@koobiq/components/core';
import { map } from 'rxjs';
import { SelectCleanerExample } from './select-cleaner/select-cleaner-example';

const localizedSelectOptionsExampleProvider = (): Provider => {
    return {
        provide: 'LOCALIZED_SELECT_OPTIONS_EXAMPLE',
        useFactory: (): Signal<string[]> => {
            const options = new Array(50);
            const en = options.fill(0).map((_, i) => `Value${i}`);
            const locale = inject(KbqLocaleService, { optional: true });

            if (!locale) {
                return signal(en);
            }

            return toSignal(
                locale.changes.pipe(
                    map((locale) => {
                        switch (locale) {
                            case 'zh-CN': {
                                return options.fill(0).map((_, i) => `值${i}`);
                            }
                            case 'es-LA': {
                                return options.fill(0).map((_, i) => `Valor${i}`);
                            }
                            case 'pt-BR': {
                                return options.fill(0).map((_, i) => `Valor${i}`);
                            }
                            case 'ru-RU': {
                                return options.fill(0).map((_, i) => `Значение${i}`);
                            }
                            case 'fa-IR': {
                                return options.fill(0).map((_, i) => `${i}القيمة`);
                            }
                            default: {
                                return en;
                            }
                        }
                    })
                ),
                { initialValue: en }
            );
        }
    };
};

export { SelectCleanerExample };

const EXAMPLES = [
    SelectCleanerExample
    // SelectDisabledExample,
    // SelectOverviewExample,
    // SelectMultipleExample,
    // SelectSearchExample,
    // SelectPrioritizedSelectedExample,
    // SelectGroupsExample,
    // SelectHeightExample,
    // SelectIconExample,
    // SelectFooterExample,
    // SelectValidationExample,
    // SelectVirtualScrollExample,
    // SelectWithPanelWidthAttributeExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES,
    providers: [localizedSelectOptionsExampleProvider()]
})
export class SelectExamplesModule {}
