import { Directive, inject, input, TemplateRef } from '@angular/core';

/** Context provided to the tree node component. */
export class KbqTreeNodeOutletContext<T> {
    /** Data for the node. */
    $implicit: T;

    /** Depth of the node. Defaults to `0`. */
    level = 0;

    /** Index location of the node. */
    index?: number;

    /** Length of the number of total dataNodes. */
    // TODO: never filled, as in the CDK context; fill it or deprecate it (#DS-2196).
    count?: number;

    constructor(data: T) {
        this.$implicit = data;
    }
}

/**
 * Data node definition for the KbqTree.
 * Captures the node's template and a when predicate that describes when this node should be used.
 */
@Directive({
    selector: '[kbqTreeNodeDef]',
    // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property -- `when` is an input of the CDK base class
    inputs: ['when: kbqTreeNodeDefWhen']
})
export class KbqTreeNodeDef<T> {
    template = inject<TemplateRef<any>>(TemplateRef);

    readonly data = input<T>(undefined!, { alias: 'kbqTreeNode' });

    /**
     * Function that should return true if this node template should be used for the provided node
     * data and index. If left undefined, this node will be considered the default node template to
     * use when no other when functions return true for the data.
     * For every node, there must be at least one when function that passes or an undefined to
     * default.
     */
    when: ((index: number, nodeData: T) => boolean) | undefined;

    /** @docs-private */
}
