module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            ['feat', 'feature', 'fix', 'refactor', 'docs', 'build', 'test', 'ci', 'chore']
        ]
    }
};
