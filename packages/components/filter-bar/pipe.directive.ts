import { AfterContentInit, Directive, inject, Injector, Input, ViewContainerRef } from '@angular/core';
import { KbqPipe, KbqPipeData, KbqPipeTemplate, KbqPipeTypes } from './filter-bar.types';
import { KbqPipeDateComponent } from './pipes/pipe-date';
import { KbqPipeDatetimeComponent } from './pipes/pipe-datetime';
import { KbqPipeMultiSelectComponent } from './pipes/pipe-multi-select';
import { KbqPipeSelectComponent } from './pipes/pipe-select';
import { KbqPipeTextComponent } from './pipes/pipe-text';

@Directive({
    standalone: true,
    selector: '[kbq-pipe]'
})
export class KbqPipeDirective<T> implements AfterContentInit {
    private injector = inject(Injector);
    protected readonly viewContainerRef = inject(ViewContainerRef);

    values: KbqPipeTemplate[];

    @Input({ alias: 'kbq-pipe' })
    get data(): KbqPipe {
        return this._data;
    }

    set data(value: KbqPipe) {
        this._data = value;
    }

    private _data!: KbqPipe;

    ngAfterContentInit(): void {
        const options = {
            injector: this.getInjector(this.data)
        };

        // this for extend and configure
        if (this.data.type === KbqPipeTypes.Text) {
            this.viewContainerRef.createComponent(KbqPipeTextComponent, options);
        } else if (this.data.type === KbqPipeTypes.Select) {
            this.viewContainerRef.createComponent(KbqPipeSelectComponent, options);
        } else if (this.data.type === KbqPipeTypes.MultiSelect) {
            this.viewContainerRef.createComponent(KbqPipeMultiSelectComponent, options);
        } else if (this.data.type === KbqPipeTypes.Date) {
            this.viewContainerRef.createComponent(KbqPipeDateComponent, options);
        } else if (this.data.type === KbqPipeTypes.Datetime) {
            this.viewContainerRef.createComponent(KbqPipeDatetimeComponent, options);
        }
    }

    getInjector(data: KbqPipeData<T>): Injector {
        return Injector.create({
            providers: [{ provide: KbqPipeData, useValue: data }],
            parent: this.injector
        });
    }
}
