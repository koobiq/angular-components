import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';

@Component({
    selector: 'e2e-accordion-states',
    imports: [KbqAccordionModule],
    template: `
        <div data-testid="e2eScreenshotTarget">
            <kbq-accordion [defaultValue]="'item-1'">
                <kbq-accordion-item [value]="'item-1'">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">Is it accessible?</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
                </kbq-accordion-item>

                <kbq-accordion-item [disabled]="true" [value]="'item-2'">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">Is it unstyled?</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </kbq-accordion-content>
                </kbq-accordion-item>

                <kbq-accordion-item [value]="'item-3'">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">Can it be animated?</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>
                        Yes! You can animate the Accordion with CSS or JavaScript.
                    </kbq-accordion-content>
                </kbq-accordion-item>
            </kbq-accordion>

            <br />

            <kbq-accordion [variant]="'hug'" [defaultValue]="'item-1'">
                <kbq-accordion-item [value]="'item-1'">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">Is it accessible?</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
                </kbq-accordion-item>

                <kbq-accordion-item [disabled]="true" [value]="'item-2'">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">Is it unstyled?</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </kbq-accordion-content>
                </kbq-accordion-item>

                <kbq-accordion-item [value]="'item-3'">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">Can it be animated?</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>
                        Yes! You can animate the Accordion with CSS or JavaScript.
                    </kbq-accordion-content>
                </kbq-accordion-item>
            </kbq-accordion>

            <br />

            <kbq-accordion [variant]="'hugSpaceBetween'" [defaultValue]="'item-1'">
                <kbq-accordion-item [value]="'item-1'">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">Is it accessible?</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
                </kbq-accordion-item>

                <kbq-accordion-item [disabled]="true" [value]="'item-2'">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">Is it unstyled?</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </kbq-accordion-content>
                </kbq-accordion-item>

                <kbq-accordion-item [value]="'item-3'">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">Can it be animated?</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>
                        Yes! You can animate the Accordion with CSS or JavaScript.
                    </kbq-accordion-content>
                </kbq-accordion-item>
            </kbq-accordion>

            <br />

            <kbq-accordion [type]="'multiple'" [defaultValue]="['item-1', 'item-2', 'item-3']">
                <kbq-accordion-item [value]="'item-1'">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">Is it accessible?</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
                </kbq-accordion-item>

                <kbq-accordion-item [disabled]="true" [value]="'item-2'">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">Is it unstyled?</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </kbq-accordion-content>
                </kbq-accordion-item>

                <kbq-accordion-item [value]="'item-3'">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">Can it be animated?</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>
                        Yes! You can animate the Accordion with CSS or JavaScript.
                    </kbq-accordion-content>
                </kbq-accordion-item>
            </kbq-accordion>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAccordionStates'
    }
})
export class E2eAccordionStates {}
