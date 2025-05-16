import { NgClass } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { KBQ_FORM_FIELD_REF, KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqFormField } from './form-field';

let nextUniqueId = 0;

/** Hint text to be shown below the form field control. */
@Component({
    standalone: true,
    selector: 'kbq-hint',
    exportAs: 'kbqHint',
    templateUrl: './hint.html',
    styleUrls: [
        './hint.scss',
        './hint-tokens.scss'
    ],
    host: {
        class: 'kbq-hint___EXPERIMENTAL',
        '[attr.id]': 'id',
        '[class.kbq-error]': 'color === colors.Error',
        '[class.kbq-contrast-fade]': 'color === colors.ContrastFade',
        '[class.kbq-success]': 'color === colors.Success',
        '[class.kbq-warning]': 'color === colors.Warning',
        '[class.kbq-hint_fill-text-off]': 'fillTextOff',
        '[class.kbq-hint_compact]': 'compact'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHint {
    /** Unique ID for the hint. */
    @Input() id: string = `kbq-hint-${nextUniqueId++}`;

    /** Component colors */
    protected colors = KbqComponentColors;

    /** Hint color */
    @Input()
    get color(): KbqComponentColors | undefined {
        return this._color;
    }

    set color(color: KbqComponentColors) {
        this._color = color;
    }

    private _color: KbqComponentColors | undefined;

    /** Disables `color` for the hint text. */
    @Input({ transform: booleanAttribute })
    get fillTextOff(): boolean {
        return this._fillTextOff;
    }

    set fillTextOff(fillTextOff: boolean) {
        this._fillTextOff = fillTextOff;
    }

    private _fillTextOff: boolean = false;

    /** Makes the hint size smaller. */
    @Input({ transform: booleanAttribute }) compact: boolean = false;
}

/** Error text to be shown below the form field control. */
@Component({
    standalone: true,
    selector: 'kbq-error',
    exportAs: 'kbqError',
    templateUrl: './hint.html',
    styleUrls: [
        './hint.scss',
        './hint-tokens.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqError extends KbqHint {
    /** @docs-private */
    /** Overrides the hint `color` property. */
    @Input()
    get color(): KbqComponentColors.Error {
        return KbqComponentColors.Error;
    }

    set color(_color: null) {}

    /** @docs-private */
    /** Overrides the hint `fillTextOff` property. */
    @Input()
    get fillTextOff(): boolean {
        return false;
    }

    set fillTextOff(_fillTextOff: null) {}
}

/** Password hint to be shown below the password form field control. */
@Component({
    standalone: true,
    imports: [NgClass, KbqIconModule],
    selector: 'kbq-password-hint',
    template: `
        <i [ngClass]="icon" kbq-icon=""></i>

        <span class="kbq-hint__text">
            <ng-content />
        </span>
    `,
    host: {
        class: 'kbq-password-hint___EXPERIMENTAL'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPasswordHint extends KbqHint {
    /** Whether the form field control has an error. */
    @Input({ transform: booleanAttribute }) hasError: boolean = false;

    /** @docs-private */
    /** Overrides the hint `fillTextOff` property. */
    @Input()
    get fillTextOff(): boolean {
        return true;
    }

    set fillTextOff(_fillTextOff: null) {}

    // @TODO fix types (#DS-2915)
    private readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true }) as unknown as KbqFormField | undefined;

    /** @docs-private */
    /** Overrides the hint `color` property. */
    @Input()
    get color(): KbqComponentColors {
        if (this.formField?.invalid && this.hasError) {
            return KbqComponentColors.Error;
        }

        if ((!this.formField?.invalid && !this.hasError) || !this.hasError) {
            return KbqComponentColors.Success;
        }

        return KbqComponentColors.ContrastFade;
    }

    set color(_color: null) {}

    /** The form field hint icon. */
    protected get icon(): string {
        return this.hasError ? 'kbq-xmark-s_16' : 'kbq-check-s_16';
    }
}
