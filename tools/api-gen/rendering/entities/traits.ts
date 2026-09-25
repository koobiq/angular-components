import { JsDocTagEntry, MemberEntry, ParameterEntry } from '../entities';
import { JsDocTagRenderable, MemberEntryRenderable, ParameterEntryRenderable } from './renderables';

/** A doc entry that has jsdoc tags. */
export interface HasJsDocTags {
    jsdocTags: JsDocTagEntry[];
}

/** A doc entry that has jsdoc tags transformed for rendering. */
export interface HasRenderableJsDocTags {
    jsdocTags: JsDocTagRenderable[];
}

/** A doc entry that has a description. */
export interface HasDescription {
    description: string;
}

/** A doc entry that has a transformed html description. */
export interface HasHtmlDescription {
    htmlDescription: string;
}

/** A doc entry that has a transformed html usage notes. */
export interface HasHtmlUsageNotes {
    htmlUsageNotes: string;
}

/** A doc entry that has members transformed for rendering. */
export interface HasMembers {
    members: MemberEntry[];
}

/** A doc entry that has members transformed for rendering. */
export interface HasRenderableMembers {
    members: MemberEntryRenderable[];
}

/** A doc entry that has params transformed for rendering. */
export interface HasParams {
    params: ParameterEntry[];
}

/** A doc entry that has params for rendering. */
export interface HasRenderableParams {
    params: ParameterEntryRenderable[];
}

export interface HasDeprecatedFlag {
    isDeprecated: boolean;
}
