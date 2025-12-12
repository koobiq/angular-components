import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqPseudoCheckboxModule, KbqPseudoCheckboxState, PopUpPlacements, PopUpSizes } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqTrim } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqListModule, KbqListSelectionChange } from '@koobiq/components/list';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { KbqUsernameModule } from '@koobiq/components/username';
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

interface ExampleUser {
    lastName: string;
    firstName: string;
    middleName: string;
    login: string;
    displayName: string;
}

/**
 * @title List multiple checkbox
 */
@Component({
    selector: 'list-intermediate-state-example',
    imports: [
        KbqListModule,
        FormsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqInputModule,
        KbqPopoverModule,
        KbqTrim,
        KbqUsernameModule,
        KbqPseudoCheckboxModule,
        ReactiveFormsModule,
        AsyncPipe,
        KbqEmptyStateModule,
        KbqScrollbarModule
    ],
    standalone: true,
    templateUrl: './list-intermediate-state-example.html',
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            padding-top: var(--kbq-size-7xl);
            padding-bottom: var(--kbq-size-7xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListIntermediateStateExample {
    PopUpSizes = PopUpSizes;
    PopUpPlacements = PopUpPlacements;

    users: ExampleUser[] = [
        {
            lastName: '',
            firstName: '',
            middleName: '',
            login: 'Administrator',
            displayName: 'Administrator'
        },
        {
            lastName: '',
            firstName: 'Алексей',
            middleName: '',
            login: 'AlexFree',
            displayName: 'AlexFree'
        },
        {
            lastName: '',
            firstName: '',
            middleName: '',
            login: 'NightWolf',
            displayName: 'NightWolf'
        },
        {
            lastName: '',
            firstName: '',
            middleName: '',
            login: 'SkyRider',
            displayName: 'SkyRider'
        },
        {
            lastName: 'Smith',
            firstName: 'John',
            middleName: '',
            login: 'agent.smith',
            displayName: 'Smith J.'
        },
        {
            lastName: 'Волкова',
            firstName: '',
            middleName: '',
            login: 'VolkovaV',
            displayName: 'VolkovaV'
        },
        {
            lastName: '',
            firstName: 'Ольга',
            middleName: '',
            login: 'olga_f',
            displayName: 'olga_f'
        },
        {
            lastName: 'Белова',
            firstName: 'Татьяна',
            middleName: 'Михайловна',
            login: 'tat_bel',
            displayName: 'Белова Т. М.'
        },
        {
            lastName: 'Громов',
            firstName: 'Дмитрий',
            middleName: 'Игоревич',
            login: 'grom_d',
            displayName: 'Громов Д. И.'
        },
        {
            lastName: 'Жуков',
            firstName: 'Роман',
            middleName: '',
            login: 'RomanZhuk',
            displayName: 'Жуков Р.'
        },
        {
            lastName: 'Иванов',
            firstName: 'Павел',
            middleName: 'Сергеевич',
            login: 'pavel_i',
            displayName: 'Иванов П. С.'
        },
        {
            lastName: 'Костин',
            firstName: 'Олег',
            middleName: 'Семёнович',
            login: 'kostin_o',
            displayName: 'Костин О. С.'
        },
        {
            lastName: 'Кузнецов',
            firstName: 'Максим',
            middleName: '',
            login: 'mkuznetsov',
            displayName: 'Кузнецов М.'
        },
        {
            lastName: 'Макаров',
            firstName: 'Кирилл',
            middleName: 'Петрович',
            login: 'kirillmak',
            displayName: 'Макаров К. П.'
        },
        {
            lastName: 'Никитин',
            firstName: 'Степан',
            middleName: 'Андреевич',
            login: 'step_nik',
            displayName: 'Никитин С. А.'
        },
        {
            lastName: 'Орлова',
            firstName: 'Мария',
            middleName: '',
            login: 'MashaBright',
            displayName: 'Орлова М.'
        },
        {
            lastName: 'Петров',
            firstName: 'Илья',
            middleName: 'Александрович',
            login: 'petrov_ilya',
            displayName: 'Петров И. А.'
        },
        {
            lastName: 'Сидорова',
            firstName: 'Елена',
            middleName: '',
            login: 'ElenaStar',
            displayName: 'Сидорова Е.'
        },
        {
            lastName: 'Смирнова',
            firstName: 'Вероника',
            middleName: '',
            login: 'VeraSmile',
            displayName: 'Смирнова В.'
        },
        {
            lastName: 'Соколова',
            firstName: 'Анна',
            middleName: 'Дмитриевна',
            login: 'anna_s',
            displayName: 'Соколова А. Д.'
        },
        {
            lastName: 'Тихонова',
            firstName: 'Валерия',
            middleName: 'Алексеевна',
            login: 'val_ti',
            displayName: 'Тихонова В. А.'
        },
        {
            lastName: 'Яковлев',
            firstName: 'Егор',
            middleName: '',
            login: 'egor_y',
            displayName: 'Яковлев Е.'
        }
    ];

    usersSelectedInOtherGroups: ExampleUser[] = [this.users[0]];
    savedUsersSelectedInOtherGroups: ExampleUser[] = [];

    selected: ExampleUser[] = [this.users[5], this.users[8], this.users[11]];
    savedSelection: ExampleUser[] = [];
    needRestore: boolean = true;

    searchControl: UntypedFormControl = new UntypedFormControl();
    filteredUsers: Observable<ExampleUser[]>;

    @ViewChild(KbqPopoverTrigger) popover: KbqPopoverTrigger;

    constructor() {
        this.filteredUsers = merge(
            of(this.users),
            this.searchControl.valueChanges.pipe(map((value) => this.getFilteredUsers(value)))
        );
    }

    getCheckboxState(user: ExampleUser): KbqPseudoCheckboxState {
        if (this.selected.includes(user)) return true;

        if (this.usersSelectedInOtherGroups.includes(user)) return 'indeterminate';

        return false;
    }

    onVisibleChange(state: boolean) {
        if (state) {
            this.saveSelectionState();
        } else {
            if (this.needRestore) {
                this.restoreSelectionState();
            }

            this.popover.focus();
        }
    }

    onApply() {
        this.needRestore = false;
        this.popover.hide(0);
        this.popover.focus();
    }

    onSelectionChange(event: KbqListSelectionChange) {
        if (!event.option.selected) {
            this.usersSelectedInOtherGroups.splice(event.option.value, 1);
        }
    }

    private getFilteredUsers(value): ExampleUser[] {
        const searchFilter = value.toLowerCase();

        return searchFilter ? this.users.filter((user) => this.userHasText(user, searchFilter)) : this.users;
    }

    private userHasText(user: ExampleUser, text: string): boolean {
        return (user.lastName + user.firstName + user.middleName + user.login + user.displayName)
            .toLowerCase()
            .includes(text);
    }

    private saveSelectionState() {
        this.savedSelection = [...this.selected];
        this.savedUsersSelectedInOtherGroups = [...this.usersSelectedInOtherGroups];
        this.needRestore = true;
    }

    private restoreSelectionState() {
        this.selected = [...this.savedSelection];
        this.usersSelectedInOtherGroups = [...this.savedUsersSelectedInOtherGroups];
    }
}
