// Types of `firebase-hosting.mjs`, which stays plain JavaScript because `tools/serve-docs.mjs` runs it with Node alone.

export declare type HostingRule = { source?: string; regex?: string; destination: string; type?: number };

export declare type HostingTarget = {
    target: string;
    ignore: string[];
    headers: { source: string; headers: { key: string; value: string }[] }[];
    redirects?: HostingRule[];
    rewrites?: HostingRule[];
};

export declare const readHostingTarget: (target: string, path?: string) => HostingTarget;

export declare const findRedirect: (
    hosting: HostingTarget,
    path: string
) => { location: string; status: number } | null;

export declare const findRewrite: (hosting: HostingTarget, path: string) => string | null;
