import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, ThemeService } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @title Empty-state content
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'empty-state-content-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <div class="layout-row layout-wrap">
            <kbq-empty-state class="flex" size="big" style="min-height: 216px">
                <div kbq-empty-state-icon>
                    <img
                        alt="Empty state"
                        height="192"
                        width="192"
                        [srcset]="srcSet()"
                        src="assets/images/{{ currentTheme() }}/empty_192.png"
                    />
                </div>
                <div kbq-empty-state-title>Нет групп</div>
                <div kbq-empty-state-text>{{ emptyStateText }}</div>
                <div kbq-empty-state-actions>
                    <button kbq-button [color]="colors.Theme" [kbqStyle]="styles.Transparent">
                        <i kbq-icon="kbq-plus_16" [color]="'theme'"></i>
                        {{ buttonText }}
                    </button>
                </div>
            </kbq-empty-state>

            <kbq-empty-state class="flex" style="min-height: 216px">
                <div kbq-empty-state-icon>
                    <img
                        alt="Empty state"
                        width="80"
                        height="80"
                        [srcset]="srcSet()"
                        src="assets/images/{{ currentTheme() }}/empty_192.png"
                    />
                </div>
                <div kbq-empty-state-title>Нет групп</div>
                <div kbq-empty-state-text>{{ emptyStateText }}</div>
                <div kbq-empty-state-actions>
                    <button kbq-button [color]="colors.Theme" [kbqStyle]="styles.Transparent">
                        <i kbq-icon="kbq-plus_16" [color]="'theme'"></i>
                        {{ buttonText }}
                    </button>
                </div>
            </kbq-empty-state>
        </div>
    `
})
export class EmptyStateContentExample {
    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;
    protected readonly currentTheme = toSignal(
        inject(ThemeService, { optional: true })?.current.pipe(
            map((theme) => theme && theme.className.replace('kbq-', ''))
        ) || of('light'),
        { initialValue: 'light' }
    );

    protected readonly srcSet = computed(() => {
        const currentTheme = this.currentTheme();

        return `assets/images/${currentTheme}/empty_192.png 1x, assets/images/${currentTheme}/empty_192@2x.png 2x`;
    });

    buttonText = 'Создать группу';
    emptyStateText = 'Агенты можно объединить в группу и назначить им одни и те же политики';
}
