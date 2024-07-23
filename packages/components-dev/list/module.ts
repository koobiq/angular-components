import { Clipboard } from '@angular/cdk/clipboard';
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule, UntypedFormControl } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqListModule, KbqListSelectionChange } from '@koobiq/components/list';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { of } from 'rxjs';
import { debounceTime, startWith, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
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
        console.info(`onSelectionChange: ${$event.option.value}`);
    }

    onSelectAll($event) {
        console.info('onSelectAll', $event);
    }

    onCopy($event) {
        console.info('onCopy', $event);
        this.clipboard.copy($event.option.value);
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        KbqCheckboxModule,
        KbqListModule,
        KbqToolTipModule,
        KbqDropdownModule,
        KbqIconModule,
        KbqTitleModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
