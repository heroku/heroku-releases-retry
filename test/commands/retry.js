'use strict'
/* globals describe it beforeEach */

const cli = require('heroku-cli-util')
const nock = require('nock')
const cmd = require('../..').commands.find(c => c.topic === 'releases' && c.command === 'retry')
const expect = require('chai').expect
const stdMocks = require('std-mocks')

describe('releases:retry', function () {
  beforeEach(() => cli.mockConsole())

  it('retries the release', function () {
    let api = nock('https://api.heroku.com:443')
      .get('/apps/myapp/releases')
      .reply(200, [{ 'slug': { id: 'slug_uuid' }, version: 40 }])
      .post('/apps/myapp/releases', { slug: 'slug_uuid', description: 'Retrying v40' })
      .reply(200, {})
    return cmd.run({app: 'myapp'})
      .then(() => api.done())
  })

  it('retries the release with output', function () {
    stdMocks.use()
    let busl = nock('https://busl.test:443')
      .get('/streams/release.log')
      .reply(200, 'Release Output Content')
    let api = nock('https://api.heroku.com:443')
      .get('/apps/myapp/releases')
      .reply(200, [{ 'slug': { id: 'slug_uuid' }, version: 40 }])
      .post('/apps/myapp/releases', { slug: 'slug_uuid', description: 'Retrying v40' })
      .reply(200, {output_stream_url: 'https://busl.test/streams/release.log'})

    return cmd.run({app: 'myapp'})
      .then(() => expect(stdMocks.flush().stdout.join('')).to.equal('Release Output Content'))
      .then(() => expect(cli.stderr).to.equal(''))
      .then(() => api.done())
      .then(() => busl.done())
      .then(() => stdMocks.restore())
      .catch(() => stdMocks.restore())
  })

  it('retries the release with missing output', function () {
    let busl = nock('https://busl.test:443')
      .get('/streams/release.log')
      .reply(404, '')
    let api = nock('https://api.heroku.com:443')
      .get('/apps/myapp/releases')
      .reply(200, [{ 'slug': { id: 'slug_uuid' }, version: 40 }])
      .post('/apps/myapp/releases', { slug: 'slug_uuid', description: 'Retrying v40' })
      .reply(200, {version: 1, output_stream_url: 'https://busl.test/streams/release.log'})

    return cmd.run({app: 'myapp'})
      .then(() => expect(cli.stdout).to.equal('Running release command...\n'))
      .then(() => expect(cli.stderr).to.contain('Release command starting. Use `heroku releases:output` to view the log.\n'))
      .then(() => api.done())
      .then(() => busl.done())
  })
})
