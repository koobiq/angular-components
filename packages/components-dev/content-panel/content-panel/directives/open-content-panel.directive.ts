import { ComponentType } from '@angular/cdk/overlay';
import { Directive, HostListener, inject, Input, TemplateRef } from '@angular/core';
import { take } from 'rxjs';
import { IcContentPanelService } from '../services';
import { IcContentPanelConfig } from '../types';

// eslint-disable-next-line @angular-eslint/prefer-standalone
@Directive({
    selector: '[icOpenContentPanel]'
})
/**
 * @class OpenContentPanelDirective - Директива открытия content-panel
 */
export class OpenContentPanelDirective {
    readonly #icContentPanelService = inject(IcContentPanelService);
    #isOpenedContentPanel = false;

    @Input()
    contentPanelTpl!: TemplateRef<unknown> | ComponentType<unknown>;

    @Input()
    config?: IcContentPanelConfig;

    @HostListener('click') openContentPanel(): void {
        if (this.#isOpenedContentPanel) {
            return;
        }

        const contentPanel = this.#icContentPanelService.open(this.contentPanelTpl, this.config);

        this.#isOpenedContentPanel = true;

        contentPanel
            .afterClosed()
            .pipe(take(1))
            .subscribe(() => {
                this.#isOpenedContentPanel = false;
            });
    }
}
