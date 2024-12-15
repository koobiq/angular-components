import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    Directive,
    forwardRef,
    inject,
    Input,
    QueryList,
    TemplateRef,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { RdxRovingFocusGroupDirective, RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';

export type KbqDefaultSizes = 'compact' | 'normal' | 'big';

@Directive({
    selector: '[kbqBreadcrumbItem]',
    standalone: true
})
export class KbqBreadcrumbsItem {
    protected readonly templateRef = inject(TemplateRef);
}

@Directive({
    standalone: true,
    selector: '[kbqBreadcrumb]',
    host: {
        class: 'kbq-breadcrumb'
    },
    hostDirectives: [
        RdxRovingFocusItemDirective
    ]
})
export class KbqBreadcrumb {}

@Component({
    standalone: true,
    selector: 'kbq-breadcrumb',
    imports: [
        KbqButtonModule,
        KbqBreadcrumb
    ],
    encapsulation: ViewEncapsulation.None,
    template: `
        <a href="#">
            <button
                [color]="KbqComponentColors.Contrast"
                [kbqStyle]="KbqButtonStyles.Transparent"
                kbqBreadcrumb
                kbq-button
            >
                <ng-content />
            </button>
        </a>
    `
})
export class KbqDefaultBreadcrumb {
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
}

@Component({
    standalone: true,
    selector: 'kbq-breadcrumbs',
    templateUrl: './breadcrumbs.html',
    styleUrls: ['./breadcrumbs.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        KbqIconModule,
        KbqBreadcrumbsItem,
        KbqButtonModule,
        KbqDefaultBreadcrumb
    ],
    hostDirectives: [RdxRovingFocusGroupDirective]
})
export class KbqBreadcrumbs {
    @ContentChildren(forwardRef(() => KbqBreadcrumbsItem), { read: TemplateRef })
    items: QueryList<TemplateRef<any>>;

    @Input()
    size: number;

    @Input()
    max: number;

    @Input() icon: string;

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
}
