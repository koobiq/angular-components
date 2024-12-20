import { AfterContentInit, Component, inject, Input } from '@angular/core';
import { KbqButtonModule } from '../button';
import { KbqDropdownModule } from '../dropdown';
import { KbqIcon } from '../icon';
import { KbqFilterBar } from './filter-bar.component';
import { KbqPipeTemplate } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-filter-add',
    template: `
        <button [color]="'contrast-fade'" [kbqStyle]="'outline'" [kbqDropdownTriggerFor]="newPipes" kbq-button>
            <i kbq-icon="kbq-plus_16"></i>
            <ng-content />
        </button>

        <kbq-dropdown #newPipes="kbqDropdown">
            @for (pipe of templates; track pipe) {
                <button (click)="add(pipe)" kbq-dropdown-item>{{ pipe.name }}</button>
            }
        </kbq-dropdown>
    `,
    host: {
        class: 'kbq-filter-add'
    },
    imports: [
        KbqDropdownModule,
        KbqButtonModule,
        KbqIcon
    ]
})
export class KbqFilterAdd implements AfterContentInit {
    protected readonly filterBar = inject(KbqFilterBar);

    @Input()
    set templates(value: KbqPipeTemplate[]) {
        this._templates = value;
    }

    get templates(): KbqPipeTemplate[] {
        return this._templates;
    }

    private _templates: KbqPipeTemplate[];

    ngAfterContentInit(): void {
        this.filterBar.templates = this.templates;
    }

    add(pipe: KbqPipeTemplate) {
        this.filterBar.onAddPipe.next(pipe);
    }
}
