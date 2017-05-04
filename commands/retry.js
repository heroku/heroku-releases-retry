'use strict'

let cli = require('heroku-cli-util')
let co = require('co')

function * run (context, heroku) {
  function getLatestRelease () {
    return heroku.request({
      path: `/apps/${context.app}/releases`,
      partial: true,
      headers: { 'Range': 'version ..; max=2, order=desc' }
    }).then((releases) => releases[0])
  }
  let release = yield getLatestRelease()

  yield cli.action(`Retrying ${cli.color.green('v' + release.version)} on ${cli.color.app(context.app)}`, {success: false}, co(function * () {
    let retry = yield heroku.post(`/apps/${context.app}/releases`, {
      body: {
        slug: release.slug.id,
        description: `Retrying v${release.version}`
      }
    })
    cli.action.done(`done, ${cli.color.green('v' + retry.version)}`)
  }))
}

module.exports = {
  topic: 'releases',
  command: 'retry',
  description: 'Retry the latest release-phase command',
  help: 'Copies the latest release into a new one, retrying the latest release-phase command.',
  needsApp: true,
  needsAuth: true,
  run: cli.command({preauth: true}, co.wrap(run))
}
