import { CdkScrollable } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTopBarModule } from '@koobiq/components/top-bar';

@Component({
    selector: 'docs-select-example',
    imports: [KbqTopBarModule, CdkScrollable, KbqSelectModule],
    template: `
        <kbq-top-bar>
            <div
                class="layout-row layout-align-center-center layout-padding-top-3xs layout-padding-bottom-3xs kbq-title kbq-truncate-line"
                kbqTopBarContainer
                placement="start"
            >
                <span class="kbq-truncate-line">Page Title</span>
            </div>

            <div kbqTopBarSpacer></div>
        </kbq-top-bar>

        <div class="docs-text-container layout-padding-left-xxl" cdk-scrollable>
            <p>
                The &lt;select> HTML element represents a control that provides a menu of options. The above example
                shows typical &lt;select> usage. It is given an id attribute to enable it to be associated with a
                &lt;label> for accessibility purposes, as well as a name attribute to represent the name of the
                associated data point submitted to the server. Each menu option is defined by an &lt;option> element
                nested inside the &lt;select>.
            </p>

            <kbq-form-field>
                <kbq-select [value]="'Network Watcher'">
                    <kbq-option [value]="'Network Watcher'">Network Watcher</kbq-option>
                    <kbq-option [value]="'Firewall Sentinel'">Firewall Sentinel</kbq-option>
                    <kbq-option [value]="'Threat Hunter'">Threat Hunter</kbq-option>
                    <kbq-option [value]="'Malware Sentry'">Malware Sentry</kbq-option>
                    <kbq-option [value]="'Ransomware Shield'">Ransomware Shield</kbq-option>
                    <kbq-option [value]="'Network Watcher'">Network Watcher</kbq-option>
                    <kbq-option [value]="'Data Breach Guard'">Data Breach Guard</kbq-option>
                    <kbq-option [value]="'Endpoint Defender'">Endpoint Defender</kbq-option>
                </kbq-select>
            </kbq-form-field>

            <p>
                The &lt;select> element has some unique attributes you can use to control it, such as multiple to
                specify whether multiple options can be selected, and size to specify how many options should be shown
                at once. It also accepts most of the general form input attributes such as required, disabled,
                autofocus, etc.
            </p>
            <p>
                You can further nest &lt;option> elements inside &lt;optgroup> elements to create separate groups of
                options inside the dropdown. You can also include &lt;hr> elements to create separators that add visual
                breaks between options.
            </p>
            <p>
                In browsers that don't support the modern customization features (or legacy codebases where they can't
                be used), you are limited to manipulating the box model, the displayed font, etc. You can also use the
                appearance property to remove the default system appearance.
            </p>
            <p>
                You can use the :open pseudo-class to style &lt;select> elements in the open state, that is, when the
                drop-down options list is displayed. This doesn't apply to multi-line &lt;select> elements (those with
                the multiple attribute set) — they tend to render as a scrolling list box rather than a drop-down, so
                don't have an open state.
            </p>
            <p>
                A &lt;select> element is represented in JavaScript by an HTMLSelectElement object, and this object has a
                value property which contains the value of the selected &lt;option>.
            </p>
            <p>
                The &lt;select> element has some unique attributes you can use to control it, such as multiple to
                specify whether multiple options can be selected, and size to specify how many options should be shown
                at once. It also accepts most of the general form input attributes such as required, disabled,
                autofocus, etc.
            </p>
            <p>
                Each &lt;option> element should have a value attribute containing the data value to submit to the server
                when that option is selected. If no value attribute is included, the value defaults to the text
                contained inside the element. You can include a selected attribute on an &lt;option> element to make it
                selected by default when the page first loads. If no selected attribute is specified, the first
                &lt;option> element will be selected by default.
            </p>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;

            margin: 0 auto;
        }

        .docs-text-container {
            display: flex;
            flex-direction: column;

            overflow-y: scroll;

            height: 344px;
            padding-left: var(--kbq-size-xl);
        }

        .kbq-form-field {
            width: 320px;
            align-self: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsSelectExample {
    readonly popoverContent =
        'Think of a popover as a lightweight, floating window that is directly tethered to the element that summoned it. Unlike a modal dialog, it doesn\'t usually block interaction with the rest of the page entirely, allowing for a faster, more "in-context" workflow. It\'s often activated by clicking a button, icon, or link, and it disappears when the user moves their focus away.';
}
