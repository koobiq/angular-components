import { Component, OnInit, ViewEncapsulation } from '@angular/core';


export const OPTIONS = [
    'Abakan', 'Almetyevsk', 'Anadyr', 'Anapa', 'Arkhangelsk', 'Astrakhan', 'Barnaul', 'Belgorod', 'Beslan', 'Biysk',
    'Birobidzhan', 'Blagoveshchensk', 'Bologoye', 'Bryansk', 'Veliky Novgorod', 'Veliky Ustyug', 'Vladivostok',
    'Vladikavkaz', 'Vladimir', 'Volgograd', 'Vologda', 'Vorkuta', 'Voronezh', 'Gatchina', 'Gdov', 'Gelendzhik',
    'Gorno-Altaysk', 'Grozny', 'Gudermes', 'Gus-Khrustalny', 'Dzerzhinsk', 'Dmitrov', 'Dubna', 'Yeysk', 'Yekaterinburg',
    'Yelabuga', 'Yelets', 'Yessentuki', 'Zlatoust', 'Ivanovo', 'Izhevsk', 'Irkutsk', 'Yoshkar-Ola', 'Kazan',
    'Kaliningrad', 'Kaluga', 'Kemerovo', 'Kislovodsk', 'Komsomolsk-on-Amur', 'Kotlas', 'Krasnodar', 'Krasnoyarsk',
    'Kurgan', 'Kursk', 'Kyzyl', 'Leninogorsk', 'Lensk', 'Lipetsk', 'Luga', 'Lyuban', 'Lyubertsy', 'Magadan', 'Maykop',
    'Makhachkala', 'Miass', 'Mineralnye Vody', 'Mirny', 'Moscow', 'Murmansk', 'Murom', 'Mytishchi',
    'Naberezhnye Chelny', 'Nadym', 'Nalchik', 'Nazran', 'Naryan-Mar', 'Nakhodka', 'Nizhnevartovsk', 'Nizhnekamsk',
    'Nizhny Novgorod', 'Nizhny Tagil', 'Novokuznetsk', 'Novosibirsk', 'Novy Urengoy', 'Norilsk', 'Obninsk',
    'Oktyabrsky', 'Omsk', 'Orenburg', 'Orekhovo-Zuyevo', 'Oryol', 'Penza', 'Perm', 'Petrozavodsk',
    'Petropavlovsk-Kamchatsky', 'Podolsk', 'Pskov', 'Pyatigorsk', 'Rostov-on-Don', 'Rybinsk', 'Ryazan', 'Salekhard',
    'Samara', 'Saint Petersburg', 'Saransk', 'Saratov', 'Severodvinsk', 'Smolensk', 'Sol-Iletsk', 'Sochi', 'Stavropol',
    'Surgut', 'Syktyvkar', 'Tambov', 'Tver', 'Tobolsk', 'Tolyatti', 'Tomsk', 'Tuapse', 'Tula', 'Tynda', 'Tyumen',
    'Ulan-Ude', 'Ulyanovsk', 'Ufa', 'Khabarovsk', 'Khanty-Mansiysk', 'Chebarkul', 'Cheboksary', 'Chelyabinsk',
    'Cherepovets', 'Cherkessk', 'Chistopol', 'Chita', 'Shadrinsk', 'Shatura', 'Shuya', 'Elista', 'Engels',
    'Yuzhno-Sakhalinsk', 'Yakutsk', 'Yaroslavl'
];

/**
 * @title Prioritized Selected Example
 */
@Component({
    selector: 'select-prioritized-selected-example',
    templateUrl: 'select-prioritized-selected-example.html',
    styleUrls: ['select-prioritized-selected-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SelectPrioritizedSelectedExample implements OnInit {
    selected = ['Makhachkala', 'Miass', 'Mineralnye Vody'];

    defaultOptions = OPTIONS;
    options: string[] = [];

    ngOnInit() {
        this.popSelectedOptionsUp();
    }

    openedChange(isOpen: boolean) {
        if (!isOpen) {
            this.popSelectedOptionsUp();
        }
    }

    popSelectedOptionsUp(): void {
        const unselected = this.defaultOptions.filter((option) => !this.selected.includes(option))
            .sort((a, b) => this.defaultOptions.indexOf(a) - this.defaultOptions.indexOf(b));

        this.options = this.selected.concat(unselected);
    }
}
