export function noProject(project: string) {
    return `Unable to find project '${project}' in the workspace`;
}

export function noModuleFile(moduleFilePath: string) {
    return `File '${moduleFilePath}' does not exist.`;
}
