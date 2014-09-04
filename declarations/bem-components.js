module.exports = {
    default: {
        builder: 'enb',
        command: 'YENV=production enb make __magic__ desktop.examples desktop.tests desktop.docs touch-pad.examples touch-pad.tests touch-pad.docs touch-phone.examples touch-phone.tests touch-phone.docs && enb make *.pages/*',
        copy: ['*.docs', '*.tests', '*.examples'],
        docs: {
            readme: {
                folder: '',
                pattern: 'README.md'
            },
            changelog: {
                folder: '',
                pattern: 'CHANGELOG.md'
            },
            migration: {
                folder: '',
                pattern: 'MIGRATION.md'
            }
        },
        pattern: {
            data: '%s.data.json',
            jsdoc: '%s.jsdoc.html'
        },
        tasks: [
            require('../src/commands/remove-output'),
            require('../src/commands/create-output'),
            require('../src/commands/git-clone'),
            require('../src/commands/git-checkout'),
            require('../src/commands/npm-install'),
            require('../src/commands/npm-run-deps'),
            require('../src/commands/copy-borschik'),
            require('../src/commands/npm-run-build'),
            require('../src/commands/copy-sets'),
            require('../src/commands/collect-sets')
        ]
    }
}
