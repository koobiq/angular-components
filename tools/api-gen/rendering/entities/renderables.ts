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
    moduleName: string;
    htmlDescription: string;
    shortHtmlDescription: string;
    jsdocTags: JsDocTagRenderable[];
    additionalLinks: LinkEntryRenderable[];
    htmlUsageNotes: string;
    isDeprecated: boolean;
    isDeveloperPreview: boolean;
}

/** Documentation entity for a constant augmented transformed content for rendering. */
export type ConstantEntryRenderable = ConstantEntry &
    DocEntryRenderable & {
        codeLinesGroups: Map<string, CodeLineRenderable[]>;
    };

/** Documentation entity for a type alias augmented transformed content for rendering. */
export type TypeAliasEntryRenderable = TypeAliasEntry &
    DocEntryRenderable & {
        codeLinesGroups: Map<string, CodeLineRenderable[]>;
    };

/** Documentation entity for a TypeScript class augmented transformed content for rendering. */
export type ClassEntryRenderable = ClassEntry &
    DocEntryRenderable & {
        membersGroups: Map<string, MemberEntryRenderable[]>;
        codeLinesGroups: Map<string, CodeLineRenderable[]>;
    };

/** Documentation entity for a TypeScript enum augmented transformed content for rendering. */
export type EnumEntryRenderable = EnumEntry &
    DocEntryRenderable & {
        codeLinesGroups: Map<string, CodeLineRenderable[]>;
        members: MemberEntryRenderable[];
    };

/** Documentation entity for a TypeScript interface augmented transformed content for rendering. */
export type InterfaceEntryRenderable = ClassEntryRenderable;

export type FunctionEntryRenderable = FunctionEntry &
    DocEntryRenderable & {
        codeLinesGroups: Map<string, CodeLineRenderable[]>;
        params: ParameterEntryRenderable[];
        isDeprecated: boolean;
    };

/** Sub-entry for a single class or enum member augmented with transformed content for rendering. */
export interface MemberEntryRenderable extends MemberEntry {
    htmlDescription: string;
    jsdocTags: JsDocTagRenderable[];
    isDeprecated: boolean;
}

/** Sub-entry for a class method augmented transformed content for rendering. */
export type MethodEntryRenderable = MemberEntryRenderable &
    FunctionEntryRenderable & {
        params: ParameterEntryRenderable[];
    };

/** Sub-entry for a single function parameter augmented transformed content for rendering. */
export interface ParameterEntryRenderable extends ParameterEntry {
    htmlDescription: string;
}

/** Sub-entry for a class method augmented transformed content for rendering. */
export type PropertyEntryRenderable = MemberEntryRenderable & {
    isDirectiveInput?: boolean;
    isDirectiveOutput?: boolean;
};

export interface CodeLineRenderable {
    contents: string;
    isDeprecated: boolean;
    id?: string;
}

export interface LinkEntryRenderable {
    label: string;
    url: string;
}
