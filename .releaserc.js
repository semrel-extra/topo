module.exports = {
  branches: ['master'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          {type: 'docs', release: 'patch'},
          {type: 'refactor', release: 'patch'},
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES']
        }
      }
    ],
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semrel-extra/npm',
    '@semantic-release/github',
    '@semantic-release/git'
  ]
}
