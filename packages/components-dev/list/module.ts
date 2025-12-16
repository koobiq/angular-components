import { Clipboard } from '@angular/cdk/clipboard';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule, UntypedFormControl } from '@angular/forms';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqListModule, KbqListSelectionChange } from '@koobiq/components/list';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { ListExamplesModule } from 'packages/docs-examples/components/list';
import { of } from 'rxjs';
import { debounceTime, startWith, switchMap } from 'rxjs/operators';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [ListExamplesModule],
    template: `
        <list-intermediate-state-example />
        <br />
        <br />
        <list-action-button-example />
        <br />
        <br />
        <list-multiple-checkbox-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        FormsModule,
        KbqListModule,
        KbqToolTipModule,
        KbqDropdownModule,
        KbqIconModule,
        KbqTitleModule,
        DevDocsExamples,
        JsonPipe,
        AsyncPipe,
        DevThemeToggle
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    list = signal(Array.from({ length: 5 }, (_, i) => `Item ${i}`));
    popUpPlacements = PopUpPlacements;

    typesOfShoes = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
    multipleSelected = ['Boots', 'Clogs'];
    multipleSelectedCheckbox: string[] = [];
    selected = [];
    singleSelected = [];

    asyncUpdate = new UntypedFormControl();

    asyncUpdate$ = this.asyncUpdate.valueChanges.pipe(
        startWith(null),
        debounceTime(3000),
        switchMap(() => {
            return of(this.typesOfShoes);
        })
    );

    constructor(private clipboard: Clipboard) {}

    onSelectionChange($event: KbqListSelectionChange) {
        console.log(`onSelectionChange: ${$event.option.value}`);
    }

    onSelectAll($event) {
        console.log('onSelectAll', $event);
    }

    onCopy($event) {
        console.log('onCopy', $event);
        this.clipboard.copy($event.option.value);
    }

    onRemove(item: string) {
        this.list.update((list) => list.filter((listItem) => listItem !== item));
    }
}
