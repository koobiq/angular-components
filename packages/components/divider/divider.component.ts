import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'kbq-divider',
    template: '',
    styleUrls: ['divider.scss', 'divider-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-divider',
        '[class.kbq-divider_vertical]': 'vertical',
        '[class.kbq-divider_horizontal]': '!vertical',
        '[class.kbq-divider_inset]': 'inset',
        '[class.kbq-divider_paddings]': 'paddings'
    }
})
export class KbqDivider {
    // Whether the divider is vertically aligned.
    @Input()
    get vertical(): boolean {
        return this._vertical;
    }

    set vertical(value: boolean) {
        this._vertical = coerceBooleanProperty(value);
    }

    private _vertical: boolean = false;

    /**
     *  Whether the divider is an inset divider.
     *  @deprecated Will be removed in the next major release
     */
    @Input()
    get inset(): boolean {
        return this._inset;
    }

    set inset(value: boolean) {
        this._inset = coerceBooleanProperty(value);
    }

    private _inset: boolean = false;

    @Input()
    get paddings(): boolean {
        return this._paddings;
    }

    set paddings(value: boolean) {
        this._paddings = coerceBooleanProperty(value);
    }

    private _paddings: boolean = true;
}
