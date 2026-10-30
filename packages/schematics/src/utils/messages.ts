export function noProject(project: string) {
    return `Unable to find project '${project}' in the workspace`;
}

export function noProjectOrDirectory(project: string) {
    return `'${project}' is neither a project of the workspace nor a folder of it`;
}

export const logMessage = (logger, content) => {
    logger.warn('-------------------------');
    logger.warn(content.join('\n'));
    logger.warn('-------------------------');
};
