import {
    ClassEntry,
    ConstantEntry,
    DocEntry,
    EnumEntry,
    FunctionEntry,
    JsDocTagEntry,
    MemberEntry,
    ParameterEntry,
    TypeAliasEntry
} from '../entities';

/** JsDoc tag info augmented with transformed content for rendering. */
export interface JsDocTagRenderable extends JsDocTagEntry {
    htmlComment: string;
}

/** A documentation entry augmented with transformed content for rendering. */
export interface DocEntryRenderable extends DocEntry {
    htmlDescription: string;
    jsdocTags: JsDocTagRenderable[];
    htmlUsageNotes: string;
    isDeprecated: boolean;
}

/** Documentation entity for a constant augmented transformed content for rendering. */
export type ConstantEntryRenderable = ConstantEntry & DocEntryRenderable;

/** Documentation entity for a type alias augmented transformed content for rendering. */
export type TypeAliasEntryRenderable = TypeAliasEntry & DocEntryRenderable;

/** Documentation entity for a TypeScript class augmented transformed content for rendering. */
export type ClassEntryRenderable = Omit<ClassEntry, 'members'> &
    DocEntryRenderable & {
        members: MemberEntryRenderable[];
    };

/** Documentation entity for a TypeScript enum augmented transformed content for rendering. */
export type EnumEntryRenderable = Omit<EnumEntry, 'members'> &
    DocEntryRenderable & {
        members: MemberEntryRenderable[];
    };

/** Documentation entity for a TypeScript interface augmented transformed content for rendering. */
export type InterfaceEntryRenderable = ClassEntryRenderable;

export type FunctionEntryRenderable = FunctionEntry &
    DocEntryRenderable & {
        params: ParameterEntryRenderable[];
        isDeprecated: boolean;
    };

/** Sub-entry for a single class or enum member augmented with transformed content for rendering. */
export interface MemberEntryRenderable extends MemberEntry {
    htmlDescription: string;
    jsdocTags: JsDocTagRenderable[];
    isDeprecated: boolean;
}

/** Sub-entry for a single function parameter augmented transformed content for rendering. */
export interface ParameterEntryRenderable extends ParameterEntry {
    htmlDescription: string;
}
