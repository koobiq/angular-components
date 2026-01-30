import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';

export class FileNode {
    children: FileNode[];
    name: string;
    description: string;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name: string;
    description: string;
    level: number;
    expandable: boolean;
    parent: any;
    checked: boolean;
}

/**
 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
 * The return value is the list of `FileNode`.
 */
export function buildFileTree(countries: any, level: number): FileNode[] {
    const data: any[] = [];

    for (const country of countries) {
        const node = new FileNode();

        node.name = country.name;
        node.description = country.description;

        if (country.clubs && country.clubs.length) {
            node.children = buildFileTree(country.clubs, level + 1);
        }

        data.push(node);
    }

    return data;
}

export const DATA_OBJECT = [
    {
        name: 'England',
        description:
            "England is considered the birthplace of modern football, with the Football Association (FA) founded in 1863. The English Premier League, established in 1992, is one of the most watched sports leagues globally. England won its first and only World Cup in 1966. The country has a rich football culture with intense local rivalries and historic stadiums. English football is known for its physicality, pace, and passionate fan support. The FA Cup, first held in 1871, is the world's oldest national football competition.'",
        clubs: [
            {
                name: 'Arsenal',
                description:
                    "Founded in 1886 as Dial Square, Arsenal is one of England's most successful clubs with 13 league titles. Based in North London, they're known as 'The Gunners'. Arsène Wenger's 'Invincibles' of 2003-04 went an entire Premier League season unbeaten. The club has a reputation for attractive, attacking football and has developed many world-class players. Their home, the Emirates Stadium, is one of England's finest football arenas. Arsenal's rivalry with Tottenham Hotspur is among English football's most intense derbies."
            },
            {
                name: 'Chelsea',
                description:
                    "Founded in 1905, Chelsea rose to global prominence after Roman Abramovich's 2003 takeover. Based in West London, they've won multiple Premier League titles and two Champions League trophies (2012, 2021). Known as 'The Blues', their Stamford Bridge stadium has been home since formation. Chelsea became known for defensive solidity under José Mourinho and later for developing young talent. The club holds the record for most consecutive home games unbeaten in English football (86 from 2004-2008). Their rivalry with nearby clubs like Fulham and QPR is fierce"
            },
            {
                name: 'Liverpool',
                description:
                    "Liverpool FC, founded in 1892, is England's most successful club in European competitions with 6 Champions League titles. Based at Anfield, their anthem 'You'll Never Walk Alone' is world-famous. The club dominated English football in the 1970s-80s under Bill Shankly and Bob Paisley. The Hillsborough disaster (1989) profoundly impacted the club and football safety standards. Jürgen Klopp's modern team restored Liverpool to European elite status. Their rivalry with Everton (Merseyside derby) and Manchester United are among football's most passionate"
            }
        ]
    },
    {
        name: 'Germany',
        description:
            "German football is renowned for its efficiency, strong youth development, and fan-friendly stadium culture. The Bundesliga, founded in 1963, boasts the highest average attendance globally. Germany has won 4 World Cups (1954, 1974, 1990, 2014) and 3 European Championships. The country revolutionized football tactics with innovations like 'gegenpressing'. German clubs are majority fan-owned under the 50+1 rule. The DFB-Pokal is Germany's premier cup competition. German football recovered strongly after post-war division, with East Germany having its own football structure until reunification.'",
        clubs: [
            {
                name: 'Bayern Munich',
                description:
                    "Germany's most successful club, Bayern Munich was founded in 1900 and dominates the Bundesliga with over 30 titles. Based at the Allianz Arena, they've won 6 Champions League trophies. Known for developing world-class players like Beckenbauer, Müller, and Lahm. Their rivalry with Borussia Dortmund defines modern German football. Under Uli Hoeneß, Bayern became a global brand while maintaining local traditions. The club's 1970s team revolutionized European football. Bayern's women's team is also among Germany's best. Their motto 'Mia san mia' (We are who we are) reflects Bavarian identity"
            },
            {
                name: 'Wolfsburg',
                description:
                    "VfL Wolfsburg, founded in 1945, is unique as being originally a works team for Volkswagen. Based in Lower Saxony, they won their only Bundesliga title in 2008-09 under Felix Magath. The club is known for developing young talents and has a strong women's team that dominates German women's football. Their home stadium is the Volkswagen Arena. Wolfsburg's rise reflects Germany's industrial football culture. The club has participated in European competitions multiple times. Their green-and-white colors match Volkswagen's corporate identity, maintaining close ties with the automaker."
            }
        ]
    },
    {
        name: 'Spain',
        description:
            "Spanish football is characterized by technical skill, tactical innovation, and fierce regional rivalries. La Liga, founded in 1929, features some of the world's best clubs. Spain's national team dominated world football from 2008-2012, winning two European Championships and a World Cup with their 'tiki-taka' style. The Copa del Rey is Spain's premier cup competition. Spanish clubs have been exceptionally successful in European competitions. The country's football culture reflects its diverse regional identities, with historic clubs representing different linguistic and cultural communities within Spain.",
        clubs: [
            {
                name: 'Atletico Madrid',
                description:
                    "Founded in 1903, Atlético Madrid is known as 'Los Colchoneros' (The Mattress Makers) due to their striped jerseys. Based at the Wanda Metropolitano, they've won 11 La Liga titles, often challenging Barcelona and Real Madrid. Under Diego Simeone, they became known for defensive solidity and intense work ethic. The club has won 3 Europa Leagues and reached 3 Champions League finals. Their identity is built on fighting spirit and overcoming financial limitations. Atlético's rivalry with Real Madrid is among Europe's most intense city derbies. The club developed world-class strikers like Fernando Torres and Antoine Griezmann."
            },
            {
                name: 'Barcelona',
                description:
                    "FC Barcelona, founded in 1899, is more than a club ('Més que un club') representing Catalan identity. Based at Camp Nou, they've won 5 Champions League titles and 26 La Liga titles. Their La Masia academy produced legends like Messi, Xavi, and Iniesta. Johan Cruyff's 'Dream Team' in the 1990s established Barcelona's commitment to attacking football. The club pioneered the tiki-taka style under Pep Guardiola. Barcelona's rivalry with Real Madrid (El Clásico) is football's biggest club match. The club operates as a membership society, owned by its fans. Their 2009 sextuple remains unmatched in football history."
            },
            {
                name: 'Real Madrid',
                description:
                    "Real Madrid, founded in 1902, is the most successful club in Champions League history with 14 titles. Based at the Santiago Bernabéu, they've won 35 La Liga titles. The club was instrumental in creating the European Cup in the 1950s. Their all-white kit and Galácticos transfer policy are legendary. Alfredo Di Stéfano, Cristiano Ronaldo, and Zinedine Zidane are among their icons. Under Florentino Pérez, Madrid became a global sporting brand. Their rivalry with Barcelona mixes football with Spain's political tensions. The club was named 'Real' (Royal) by King Alfonso XIII in 1920"
            }
        ]
    }
];

/**
 * @title tree-select-and-mark
 */
@Component({
    selector: 'tree-select-and-mark-example',
    imports: [
        KbqTreeModule,
        FormsModule,
        KbqPseudoCheckboxModule
    ],
    template: `
        <div class="layout-row">
            <div class="flex-30">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl" [(ngModel)]="modelValue">
                    <kbq-tree-option
                        *kbqTreeNodeDef="let node"
                        kbqTreeNodePadding
                        [class.kbq-checked]="node.checked"
                        (keydown.space)="toggleCheckboxState($event, node)"
                    >
                        <kbq-pseudo-checkbox [state]="node.checked" (click)="toggleCheckboxState($event, node)" />
                        <span [innerHTML]="treeControl.getViewValue(node)"></span>
                    </kbq-tree-option>

                    <kbq-tree-option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        kbqTreeNodePadding
                        [class.kbq-checked]="node.checked"
                        (keydown.space)="toggleCheckboxState($event, node)"
                    >
                        <kbq-tree-node-toggle [node]="node" />

                        <kbq-pseudo-checkbox [state]="node.checked" (click)="toggleCheckboxState($event, node)" />
                        <span [innerHTML]="treeControl.getViewValue(node)"></span>
                    </kbq-tree-option>
                </kbq-tree-selection>
            </div>

            <div class="layout-padding-left-l layout-padding-right-l flex-70">
                <div class="kbq-subheading layout-padding-bottom-s">{{ modelValue.name }}</div>
                <div class="kbq-text-normal">{{ modelValue.description }}</div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectAndMarkExample {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    modelValue: any = '';

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    private transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.description = node.description;
        flatNode.parent = parent;
        flatNode.level = level;
        flatNode.expandable = !!node.children;
        flatNode.checked = false;

        return flatNode;
    };

    private getLevel = (node: FileFlatNode) => {
        return node.level;
    };

    private isExpandable = (node: FileFlatNode) => {
        return node.expandable;
    };

    private getChildren = (node: FileNode): FileNode[] => {
        return node.children;
    };

    private getValue = (node: FileFlatNode): FileFlatNode => {
        return node;
    };

    private getViewValue = (node: FileFlatNode): string => {
        return `${node.name}`;
    };

    toggleCheckboxState(event: Event, node: FileFlatNode) {
        event.preventDefault();
        event.stopPropagation();

        node.checked = !node.checked;
    }
}
