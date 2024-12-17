import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    forwardRef,
    inject,
    Input,
    QueryList,
    TemplateRef,
    ViewEncapsulation
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { RdxRovingFocusGroupDirective, RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';

export type KbqDefaultSizes = 'compact' | 'normal' | 'big';

@Directive({
    selector: '[kbqBreadcrumbItem]',
    standalone: true
})
export class KbqBreadcrumbItem implements AfterViewInit {
    readonly templateRef = inject(TemplateRef);
    readonly routerLink = inject(RouterLink, { optional: true, host: true });

    ngAfterViewInit() {
        console.log(this.routerLink);
    }
}

@Directive({
    selector: '[kbqBreadcrumbsSeparator]',
    standalone: true
})
export class KbqBreadcrumbsSeparator {
    readonly templateRef = inject(TemplateRef);
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
    selector: 'kbq-breadcrumb,[kbq-breadcrumb]',
    imports: [
        KbqButtonModule,
        KbqBreadcrumb
    ],
    encapsulation: ViewEncapsulation.None,
    template: `
        <button [color]="KbqComponentColors.Contrast" [kbqStyle]="KbqButtonStyles.Transparent" kbqBreadcrumb kbq-button>
            <ng-content />
        </button>
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
        KbqBreadcrumbItem,
        KbqButtonModule,
        KbqDefaultBreadcrumb,
        KbqBreadcrumb,
        KbqDropdownModule,
        RouterLink
    ],
    hostDirectives: [RdxRovingFocusGroupDirective]
})
export class KbqBreadcrumbs {
    @ContentChildren(forwardRef(() => KbqBreadcrumbItem), { read: TemplateRef })
    items: QueryList<TemplateRef<any>>;

    @ContentChildren(forwardRef(() => KbqBreadcrumbItem))
    itemsWithLinks: QueryList<KbqBreadcrumbItem>;

    @ContentChild(KbqBreadcrumbsSeparator, { read: TemplateRef })
    separator?: TemplateRef<any>;

    @Input()
    size: number;

    @Input()
    max: number = 4;

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
}
