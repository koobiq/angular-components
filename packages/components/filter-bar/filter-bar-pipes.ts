import { InjectionToken, Provider, Type } from '@angular/core';
import { KbqPipeType, KbqPipeTypes } from './filter-bar.types';
import type { KbqBasePipe } from './pipes/base-pipe';
import { KbqPipeDateComponent } from './pipes/pipe-date';
import { KbqPipeDatetimeComponent } from './pipes/pipe-datetime';
import { KbqPipeInputComponent } from './pipes/pipe-input';
import { KbqPipeMultiSelectComponent } from './pipes/pipe-multi-select';
import { KbqPipeMultiTreeSelectComponent } from './pipes/pipe-multi-tree-select';
import { KbqPipeReadonlyComponent } from './pipes/pipe-readonly';
import { KbqPipeSelectComponent } from './pipes/pipe-select';
import { KbqPipeTextComponent } from './pipes/pipe-text';
import { KbqPipeTreeSelectComponent } from './pipes/pipe-tree-select';

/** list of pipes available out of the box. */
export const defaultFilterBarPipes: [KbqPipeType, Type<KbqBasePipe<unknown>>][] = [
    [KbqPipeTypes.ReadOnly, KbqPipeReadonlyComponent],
    [KbqPipeTypes.Text, KbqPipeTextComponent],
    [KbqPipeTypes.Input, KbqPipeInputComponent],
    [KbqPipeTypes.Select, KbqPipeSelectComponent],
    [KbqPipeTypes.TreeSelect, KbqPipeTreeSelectComponent],
    [KbqPipeTypes.MultiSelect, KbqPipeMultiSelectComponent],
    [KbqPipeTypes.MultiTreeSelect, KbqPipeMultiTreeSelectComponent],
    [KbqPipeTypes.Date, KbqPipeDateComponent],
    [KbqPipeTypes.Datetime, KbqPipeDatetimeComponent]
];

/** Injection Token for providing pipes in filter-bar */
export const KBQ_FILTER_BAR_PIPES = new InjectionToken<Map<KbqPipeType, Type<KbqBasePipe<unknown>>>>(
    'kbq-filter-bar-pipes'
);

/** Utility provider for `KBQ_FILTER_BAR_PIPES`. */
export const kbqFilterBarPipesProvider = (): Provider => {
    return {
        provide: KBQ_FILTER_BAR_PIPES,
        useValue: new Map<KbqPipeType, Type<KbqBasePipe<unknown>>>(defaultFilterBarPipes)
    };
};
