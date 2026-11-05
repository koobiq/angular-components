import {
    booleanAttribute,
    Component,
    Directive,
    ElementRef,
    Input,
    OnChanges,
    Optional,
    SimpleChanges
} from '@angular/core';
import { KbqSidepanelRef } from './sidepanel-ref';
import { KbqSidepanelService } from './sidepanel.service';

/**
 * Button that will close the current sidepanel.
 */
@Directive({
    selector: 'button[kbq-sidepanel-close], button[kbqSidepanelClose]',
    host: {
        '(click)': 'sidepanelRef.close(sidepanelResult)',
        class: 'kbq-sidepanel-close'
    }
})
export class KbqSidepanelClose implements OnChanges {
    @Input('kbq-sidepanel-close') sidepanelResult: any;

    @Input() kbqSidepanelClose: any;

    /**
     * Sidepanel the button closes: the one it is rendered in. A button rendered outside any sidepanel, such as
     * an item of a dropdown opened from one, closes the sidepanel its template is declared in.
     */
    get sidepanelRef(): KbqSidepanelRef {
        const container = this.elementRef.nativeElement.closest('.kbq-sidepanel-container');
        const renderedIn = container && this.sidepanelService.openedSidepanels.find(({ id }) => id === container.id);
        const sidepanelRef = renderedIn ?? this.declaredSidepanelRef;

        if (!sidepanelRef) {
            throw Error('kbqSidepanelClose: the button is neither rendered nor declared inside a sidepanel.');
        }

        return sidepanelRef;
    }

    constructor(
        // Dependency injection follows where a template is declared, not where it is rendered: a template declared
        // outside the sidepanel and shown in it through `ngTemplateOutlet` has no ref here, or the ref of another
        // sidepanel when it was declared in that one.
        @Optional() private declaredSidepanelRef: KbqSidepanelRef | null,
        private elementRef: ElementRef<HTMLElement>,
        private sidepanelService: KbqSidepanelService
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        const proxiedChange = changes.kbqSidepanelClose || changes.sidepanelResult;

        if (proxiedChange) {
            this.sidepanelResult = proxiedChange.currentValue;
        }
    }
}

/**
 * Header of a sidepanel.
 */
@Component({
    selector: 'kbq-sidepanel-header',
    template: `
        <div class="kbq-sidepanel-title" kbq-title>
            <ng-content />
        </div>

        @if (closeable) {
            <button kbq-button kbq-sidepanel-close type="button" [color]="'contrast'" [kbqStyle]="'transparent'">
                <i kbq-icon="kbq-xmark_16" [color]="'contrast'"></i>
            </button>
        }
    `,
    host: {
        class: 'kbq-sidepanel-header',
        '[class.kbq-sidepanel-header_truncate-text]': 'truncateText'
    }
})
export class KbqSidepanelHeader {
    /** Add button for close sidepanel. Default false */
    @Input({ transform: booleanAttribute }) closeable: boolean = false;

    /** Enables text truncation. Default true */
    @Input({ transform: booleanAttribute }) truncateText: boolean = true;
}

/**
 * Scrollable content container of a sidepanel.
 */
@Directive({
    selector: 'kbq-sidepanel-body, [kbq-sidepanel-body], kbqSidepanelBody',
    host: {
        class: 'kbq-sidepanel-body kbq-scrollbar'
    }
})
export class KbqSidepanelBody {}

/**
 * Footer of a sidepanel.
 */
@Directive({
    selector: 'kbq-sidepanel-footer, [kbq-sidepanel-footer], kbqSidepanelFooter',
    host: {
        class: 'kbq-sidepanel-footer'
    }
})
export class KbqSidepanelFooter {}

/**
 * Actions block of a sidepanel footer.
 */
@Directive({
    selector: 'kbq-sidepanel-actions, [kbq-sidepanel-actions], kbqSidepanelActions',
    host: {
        class: 'kbq-sidepanel-actions'
    }
})
export class KbqSidepanelActions {}
