// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule, UntypedFormControl } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { Observable, Observer } from 'rxjs';
import { KbqCheckboxModule } from '../../components/checkbox';
import { KbqFormFieldModule } from '../../components/form-field';
import { KbqIconModule } from '../../components/icon';
import { KbqInputModule } from '../../components/input/';
import { KbqRadioModule } from '../../components/radio';
import { KbqTabsModule } from '../../components/tabs/';

export interface IExampleTab {
    label: string;
    content: string;
}

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TabsDemoComponent {
    asyncTabs: Observable<IExampleTab[]>;
    timeout = 1000;

    tabsWithScroll: any = [];

    tabs = ['First', 'Second', 'Third'];
    selected = new UntypedFormControl(0);

    tabLoadTimes: Date[] = [];

    links = ['First', 'Second', 'Third'];
    activeLink: any = this.links[0];
    background = '';

    constructor() {
        this.asyncTabs = new Observable((observer: Observer<IExampleTab[]>) => {
            setTimeout(() => {
                observer.next([
                    { label: 'First', content: 'Content 1' },
                    { label: 'Second', content: 'Content 2' },
                    { label: 'Third', content: 'Content 3' },
                ]);
            }, this.timeout);
        });
    }

    onSelectionChanged(e) {
        console.log(e);
    }

    addTab(selectAfterAdding: boolean) {
        this.tabs.push('New');

        if (selectAfterAdding) {
            this.selected.setValue(this.tabs.length - 1);
        }
    }

    removeTab(index: number) {
        this.tabs.splice(index, 1);
    }

    selectedTabChange($event: any) {
        console.log('selectedTabChange Event:', $event);
    }

    updatedTabs() {
        this.tabsWithScroll = [...this.tabsWithScroll, +this.tabsWithScroll.length + 1];
    }
}

@NgModule({
    declarations: [TabsDemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqCheckboxModule,
        KbqRadioModule,
        KbqTabsModule,
        KbqInputModule,
        KbqToolTipModule,
        KbqSelectModule,
        KbqButtonModule,
    ],
    bootstrap: [TabsDemoComponent],
})
export class DemoModule {}
