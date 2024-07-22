import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    Directive,
    Input,
    Optional,
    ViewEncapsulation
} from '@angular/core';
import { KbqIconItem } from '@koobiq/components/icon';

@Directive({
    selector: '[kbq-empty-state-icon]',
    host: {
        class: 'kbq-empty-state-icon'
    }
})
export class KbqEmptyStateIcon {
    constructor(@Optional() private icon: KbqIconItem) {}

    setErrorColor() {
        if (!this.icon) {
            return;
        }

        this.icon.color = 'error';
    }
}

@Directive({
    selector: '[kbq-empty-state-text]',
    host: {
        class: 'kbq-empty-state-text'
    }
})
export class KbqEmptyStateText {}

@Directive({
    selector: '[kbq-empty-state-title]',
    host: {
        class: 'kbq-empty-state-title'
    }
})
export class KbqEmptyStateTitle {}

@Directive({
    selector: '[kbq-empty-state-actions]',
    host: {
        class: 'kbq-empty-state-actions'
    }
})
export class KbqEmptyStateActions {}

@Component({
    selector: 'kbq-empty-state',
    templateUrl: './empty-state.component.html',
    styleUrls: ['./empty-state.scss'],
    host: {
        class: 'kbq-empty-state',
        '[class.kbq-empty-state_big]': 'big',
        '[class.kbq-empty-state_normal]': '!big',
        '[class.kbq-empty-state_align-center]': '!alignTop',
        '[class.kbq-empty-state_align-top]': 'alignTop',
        '[class.kbq-empty-state_normal-color]': '!errorColor',
        '[class.kbq-empty-state_error-color]': 'errorColor',
        '[class.kbq-empty-state_has-icon]': '!!icon'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqEmptyState implements AfterContentInit {
    @Input() errorColor: boolean = false;
    @Input() big: boolean = false;
    @Input() alignTop: boolean = false;

    @ContentChild(KbqEmptyStateIcon) icon: KbqEmptyStateIcon | null;

    ngAfterContentInit(): void {
        if (this.errorColor && this.icon) {
            this.icon.setErrorColor();
        }
    }
}
