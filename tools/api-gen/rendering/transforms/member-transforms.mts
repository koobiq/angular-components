import { MemberEntry, MemberTags, MemberType } from '../entities.mjs';

import { isClassMethodEntry } from '../entities/categorization.mjs';
import { MemberEntryRenderable } from '../entities/renderables.mjs';
import { HasMembers, HasRenderableMembers, HasRenderableMembersGroups } from '../entities/traits.mjs';

import { addHtmlDescription, addHtmlJsDocTagComments, setEntryFlags } from './jsdoc-transforms.mjs';
import { sortCategorizedMethodMembers, sortCategorizedPropertyMembers } from '../../utils.mjs';

const lifecycleMethods = [
    'ngAfterContentChecked',
    'ngAfterContentChecked',
    'ngAfterContentInit',
    'ngAfterViewChecked',
    'ngAfterViewChecked',
    'ngAfterViewInit',
    'ngDoCheck',
    'ngDoCheck',
    'ngOnChanges',
    'ngOnDestroy',
    'ngOnInit',

    // ControlValueAccessor methods
    'writeValue',
    'registerOnChange',
    'registerOnTouched',
    'setDisabledState',

    // Don't ever need to document constructors
    'constructor',

    // tabIndex exists on all elements, no need to document it
    'tabIndex'
];

/** Gets a list of members with Angular lifecycle methods removed. */
export function filterLifecycleMethods(members: MemberEntry[]): MemberEntry[] {
    return members.filter((m) => !lifecycleMethods.includes(m.name));
}

/** Merges getter and setter entries with the same name into a single entry. */
export function mergeGettersAndSetters(members: MemberEntry[]): MemberEntry[] {
    const getters = new Set<string>();
    const setters = new Set<string>();

    // Note all getter and setter names for the class.
    for (const member of members) {
        if (member.memberType === MemberType.Getter) getters.add(member.name);
        if (member.memberType === MemberType.Setter) setters.add(member.name);
    }

    // Mark getter-only members as `readonly`.
    for (const member of members) {
        if (member.memberType === MemberType.Getter && !setters.has(member.name)) {
            member.memberType = MemberType.Property;
            member.memberTags.push(MemberTags.Readonly);
        }
    }

    // Filter out setters that have a corresponding getter.
    return members.filter(
        (member) => member.memberType !== MemberType.Setter || !getters.has(member.name),
    );
}

export const fromMemberGroups = (memberGroups: Map<string, MemberEntryRenderable[]>, types: MemberType[]) => {
    const members: MemberEntryRenderable[] = [];
    for (const group of memberGroups.values()) {
        const member = group
            .find((memberFromGroup) => types.includes(memberFromGroup.memberType))

        if (member) {
            members.push(member);
        }
    }
    return members;
}

/** Given an entity with members, gets the entity augmented with renderable members. */
export function addRenderableGroupMembers<T extends HasMembers>(
    entry: T,
): T & HasRenderableMembersGroups {
    const members = filterLifecycleMethods(entry.members);

    // overloads groupped in map
    const membersGroups = members.reduce((groups, item) => {
        const member = setEntryFlags(
            addMethodParamsDescription(addHtmlDescription(addHtmlJsDocTagComments(item))),
        );
        if (groups.has(member.name)) {
            const group = groups.get(member.name);
            group?.push(member);
        } else {
            groups.set(member.name, [member]);
        }
        return groups;
    }, new Map<string, MemberEntryRenderable[]>());

    return {
        ...entry,
        membersGroups,
        methods: fromMemberGroups(membersGroups, [MemberType.Method]).sort(sortCategorizedMethodMembers),
        properties: fromMemberGroups(membersGroups, [MemberType.Property, MemberType.Getter, MemberType.Setter])
            .map((entry) => ({
                ...entry,
                isDirectiveInput: entry.memberTags.some((tag) => tag === MemberTags.Input),
                isDirectiveOutput: entry.memberTags.some((tag) => tag === MemberTags.Output)
            })).sort(sortCategorizedPropertyMembers),
    };
}

export function addRenderableMembers<T extends HasMembers>(entry: T): T & HasRenderableMembers {
    const members = entry.members.map((entry) =>
        setEntryFlags(addMethodParamsDescription(addHtmlDescription(addHtmlJsDocTagComments(entry)))),
    );

    return { ...entry, members, };
}

function addMethodParamsDescription<T extends MemberEntry>(entry: T): T {
    if (isClassMethodEntry(entry)) {
        return {
            ...entry as T,
            params: entry.params.map((param) => addHtmlDescription(param)),
        };
    }
    return entry;
}
