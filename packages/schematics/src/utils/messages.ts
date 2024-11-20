export function noProject(project: string) {
    return `Unable to find project '${project}' in the workspace`;
}

export const logMessage = (logger, content) => {
    logger.warn('-------------------------');
    logger.warn(content.join('\n'));
    logger.warn('-------------------------');
};
