import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    Directive,
    input,
    isDevMode,
    ViewEncapsulation
} from '@angular/core';
import { kbqInjectNativeElement } from '../utils';

// Imported for the query locator below, although `./option` imports this file back: that cycle only
// stays loadable because `index.ts` imports `./optgroup` before `./option`, so `KbqOption` is defined
// by the time its decorator argument is evaluated here. Keep that order.
import { KbqOption } from './option';

let uniqueOptgroupIdCounter = 0;

/**
 * Marker for custom content of the group heading: the element it sits on is projected into the label
 * of the enclosing `kbq-optgroup` in place of its `label` input. A `kbq-badge` counter, icons or any
 * other content can go there.
 */
@Directive({
    selector: 'kbq-optgroup-label, [kbq-optgroup-label]',
    host: {
        class: 'kbq-optgroup-label-content'
    }
})
export class KbqOptgroupLabel {}

/**
 * Component that is used to group instances of `kbq-option`.
 * When options aren't provided as `ng-content`, used as a Group Header with styling.
 */
@Component({
    selector: 'kbq-optgroup',
    templateUrl: './optgroup.html',
    styleUrl: './optgroup.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-optgroup',
        role: 'group',
        '[attr.aria-labelledby]': 'labelId',
        '[class.kbq-disabled]': 'disabled()'
    },
    exportAs: 'kbqOptgroup'
})
export class KbqOptgroup implements AfterContentInit {
    /** Plain-text heading of the group; content projected with `kbq-optgroup-label` takes precedence. */
    readonly label = input<string>(undefined!);

    /** Whether the group, and every option in it, is disabled. */
    readonly disabled = input<boolean, boolean | string | null | undefined>(false, { transform: booleanAttribute });

    /** Unique id for the underlying label. */
    labelId: string = `kbq-optgroup-label-${uniqueOptgroupIdCounter++}`;

    private readonly projectedLabels = contentChildren(KbqOptgroupLabel);

    private readonly projectedOptions = contentChildren(KbqOption, { descendants: true });

    private readonly selectedCountState = computed(() => this.projectedOptions().filter((o) => o.selected).length);

    /** @docs-private */
    protected readonly hasProjectedLabel = computed(() => this.projectedLabels().length > 0);

    /**
     * The number of options in this group that are currently selected. A `kbq-list-option` is not
     * counted: `core/option` cannot depend on the `list` entry point.
     */
    get selectedCount(): number {
        return this.selectedCountState();
    }

    ngAfterContentInit(): void {
        this.warnAboutExtraLabels();
        this.warnAboutLabelWithoutDirective();
    }

    // An ng-content selector matches the projected element even without the directive in scope, so the
    // content would then render next to the `label` input rather than replace it.
    private warnAboutLabelWithoutDirective(): void {
        if (!isDevMode() || this.warnedAboutLabelWithoutDirective || !this.label()) return;

        const label = this.nativeElement.querySelector('.kbq-optgroup-label');

        if (!label?.childElementCount || this.projectedLabels().length > 0) return;

        this.warnedAboutLabelWithoutDirective = true;

        // eslint-disable-next-line no-console
        console.warn(
            'KbqOptgroup: kbq-optgroup-label content renders together with the label input. ' +
                'Import KbqOptgroupLabel for it to take over the label.'
        );
    }

    private warnAboutExtraLabels(): void {
        if (!isDevMode() || this.warnedAboutExtraLabels || this.projectedLabels().length <= 1) return;

        this.warnedAboutExtraLabels = true;

        // eslint-disable-next-line no-console
        console.warn('KbqOptgroup: at most one kbq-optgroup-label is supported; every extra one also renders.');
    }

    private readonly nativeElement = kbqInjectNativeElement();

    private warnedAboutExtraLabels = false;

    private warnedAboutLabelWithoutDirective = false;
}
