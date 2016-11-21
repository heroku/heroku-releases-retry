'use strict'
/* globals describe it beforeEach */

const cli = require('heroku-cli-util')
const nock = require('nock')
const cmd = require('../..').commands.find(c => c.topic === 'releases' && c.command === 'retry')

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
})
