import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';

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

@Component({
    selector: 'e2e-accordion-content-panel',
    imports: [KbqAccordionModule, KbqContentPanelModule],
    template: `
        <kbq-content-panel-container #panel="kbqContentPanelContainer" minWidth="200" [width]="panelWidth()">
            <button data-testid="e2eTogglePanel" type="button" (click)="panel.toggle()">Toggle panel</button>
            <button data-testid="e2eNarrowPanel" type="button" (click)="panelWidth.set(240)">Narrow panel</button>

            <kbq-content-panel>
                <kbq-content-panel-body>
                    <kbq-accordion [type]="'multiple'" [defaultValue]="['item-1']">
                        <kbq-accordion-item [value]="'item-1'">
                            <kbq-accordion-header>
                                <button kbq-accordion-trigger type="button">Expanded while the panel is closed</button>
                            </kbq-accordion-header>
                            <kbq-accordion-content>{{ text }}</kbq-accordion-content>
                        </kbq-accordion-item>

                        <kbq-accordion-item [value]="'item-2'">
                            <kbq-accordion-header>
                                <button kbq-accordion-trigger type="button">Expanded in the open panel</button>
                            </kbq-accordion-header>
                            <kbq-accordion-content>{{ text }}</kbq-accordion-content>
                        </kbq-accordion-item>
                    </kbq-accordion>
                </kbq-content-panel-body>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `,
    styles: `
        .kbq-content-panel-container {
            width: 800px;
            height: 600px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAccordionContentPanel'
    }
})
export class E2eAccordionContentPanel {
    protected readonly panelWidth = signal(480);
    protected readonly text =
        'The content panel projects its content inside a conditional block, so the accordion is created and ' +
        'initialized before the panel is ever opened. Its content has no box until then, and whatever height it ' +
        'is measured at must not stick: the panel can also be resized, which wraps this text onto more lines.';
}
