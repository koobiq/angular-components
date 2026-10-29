import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { KbqCodeBlockModule } from '@koobiq/components/code-block';
import { DocsNextComponent } from '../data/components';
import { DocsNextSiteState } from '../services/site-state';

const pascal = (value: string): string =>
    value
        .split('-')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join('');

/**
 * Look of the API subsection (spec/components/api.md): the import, then a table of "Name" and "Description" per
 * class, on a wide layout without a table of contents. The rows are samples: the real data comes from api-gen for
 * Angular and react-docgen-typescript for React in stage 4.
 */
@Component({
    selector: 'docs-next-api-preview',
    imports: [KbqCodeBlockModule],
    template: `
        <p class="docs-next-api__note">{{ state.t('apiPlaceholder') }}</p>

        <kbq-code-block filled hideTabs [files]="[{ content: importLine(), language: 'typescript' }]" />

        <h2 class="docs-next-api__class" [id]="className()">{{ className() }}</h2>
        @if (selector(); as selector) {
            <p class="docs-next-api__selector">
                Selector:
                <code>{{ selector }}</code>
            </p>
        }

        <table class="kbq-markdown__table docs-next-api__table">
            <thead class="kbq-markdown__thead">
                <tr class="kbq-markdown__tr">
                    <th class="kbq-markdown__th">Name</th>
                    <th class="kbq-markdown__th">Description</th>
                </tr>
            </thead>
            <tbody class="kbq-markdown__tbody">
                @for (row of rows(); track row.name) {
                    <tr class="kbq-markdown__tr">
                        <td class="kbq-markdown__td">
                            <code>{{ row.name }}</code>
                        </td>
                        <td class="kbq-markdown__td">{{ row.description }}</td>
                    </tr>
                }
            </tbody>
        </table>
    `,
    styles: `
        :host {
            display: block;
        }

        .docs-next-api__note,
        .docs-next-api__selector {
            margin: 0 0 var(--kbq-size-l);
            color: var(--kbq-foreground-contrast-secondary);
            font-size: var(--kbq-typography-text-normal-font-size);
            line-height: var(--kbq-typography-text-normal-line-height);
        }

        .docs-next-api__class {
            margin: var(--kbq-size-xxl) 0 var(--kbq-size-xs);
            font-family: var(--kbq-typography-title-font-family);
            font-size: var(--kbq-typography-title-font-size);
            font-weight: var(--kbq-typography-title-font-weight);
            line-height: var(--kbq-typography-title-line-height);
        }

        .docs-next-api__table {
            width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'kbq-markdown' }
})
export class DocsNextApiPreview {
    protected readonly state = inject(DocsNextSiteState);

    readonly component = input.required<DocsNextComponent>();

    private readonly isAngular = computed(() => this.state.framework() === 'angular');

    protected readonly className = computed(() =>
        this.isAngular() ? `Kbq${pascal(this.component().angular ?? '')}` : (this.component().react ?? '')
    );

    protected readonly selector = computed(() => (this.isAngular() ? `kbq-${this.component().angular}` : null));

    protected readonly importLine = computed(() =>
        this.isAngular()
            ? `import { ${this.className()}Module } from '@koobiq/components/${this.component().angular}';`
            : `import { ${this.className()} } from '@koobiq/react-components';`
    );

    protected readonly rows = computed(() =>
        this.isAngular()
            ? [
                  { name: '@Input() disabled: boolean', description: 'Whether the component is disabled.' },
                  { name: '@Input() color: KbqComponentColors', description: 'Color of the component.' },
                  { name: '@Input() tabIndex: number', description: '' },
                  { name: '@Output() focusChange: EventEmitter<boolean>', description: 'Emits on focus and blur.' }
              ]
            : [
                  { name: 'isDisabled?: boolean', description: 'Whether the component is disabled.' },
                  { name: 'color?: "contrast" | "theme" | "error"', description: 'Color of the component.' },
                  { name: 'className?: string', description: '' },
                  { name: 'onFocusChange?: (isFocused: boolean) => void', description: 'Called on focus and blur.' }
              ]
    );
}
