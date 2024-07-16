/* tslint:disable:no-console */
import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { Component, NgModule, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectChange, KbqSelectModule } from '@koobiq/components/select';
import { KbqTagsModule } from '@koobiq/components/tags';
import { Observable, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { OPTIONS } from './options';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements OnInit {
    singleSelected = '';
    multipleSelected = ['Disabled', 'Normal', 'Hovered', 'Selected', 'Selected1'];
    multipleSelectedForCustomTagText = ['Normal', 'Hovered'];

    singleSelectedWithSearch = 'Moscow';
    multipleSelectedWithSearch = ['Dzerzhinsk', 'Pskov'];

    singleSelectFormControl = new UntypedFormControl('', Validators.required);

    multiSelectSelectFormControl = new UntypedFormControl([], Validators.pattern(/^w/));

    searchCtrl: UntypedFormControl = new UntypedFormControl();
    filteredOptions: Observable<string[]>;

    multipleSearchCtrl: UntypedFormControl = new UntypedFormControl();
    filteredMultipleOptions: Observable<string[]>;

    optionCounter = 0;

    options: string[] = OPTIONS.sort();
    selectedOptionsAsObject = [
        { id: 3, name: 'Anapa' },
        { id: 55, name: 'Lyubertsy' },
        { id: 114, name: 'Tomsk' }
    ];
    optionsObj: { id: number; name: string }[] = OPTIONS.sort().map((option, index) => {
        return { id: index, name: option, active: true };
    });

    initialRange: ListRange = { start: 0, end: 7 } as unknown as ListRange;

    selected = ['Almetyevsk', 'Yaroslavl'];

    @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;

    ngOnInit(): void {
        this.filteredOptions = merge(
            of(OPTIONS),
            this.searchCtrl.valueChanges.pipe(map((value) => this.getFilteredOptions(value)))
        );

        this.filteredMultipleOptions = merge(
            of(OPTIONS),
            this.multipleSearchCtrl.valueChanges.pipe(map((value) => this.getFilteredOptions(value)))
        );
    }

    compareWithById = (o1: any, o2: any): boolean => o1 && o2 && o1.id === o2.id;

    openedChange(opened) {
        console.log('openedChange: ', opened);
        if (!opened) {
            this.cdkVirtualScrollViewport.setRenderedContentOffset(0);
            this.cdkVirtualScrollViewport.setRenderedRange(this.initialRange);
        }
    }

    onSelectionChange($event: KbqSelectChange) {
        console.log(`onSelectionChange: ${$event.value}`);
    }

    hiddenItemsTextFormatter(hiddenItemsText: string, hiddenItems: number): string {
        return `${hiddenItemsText} ${hiddenItems}`;
    }

    opened($event) {
        console.log('opened: ', $event);
    }

    closed($event) {
        console.log('closed: ', $event);
    }

    private getFilteredOptions(value): string[] {
        const searchFilter = value && value.new ? value.value : value;

        return searchFilter
            ? this.options.filter((option) => option.toLowerCase().includes(searchFilter.toLowerCase()))
            : this.options;
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ScrollingModule,
        KbqButtonModule,
        KbqSelectModule,
        KbqHighlightModule,
        KbqButtonModule,
        KbqInputModule,
        KbqFormFieldModule,
        KbqIconModule,
        ReactiveFormsModule,
        KbqTagsModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
