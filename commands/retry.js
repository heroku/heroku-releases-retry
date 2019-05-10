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

  if (!release) {
    return cli.error('No release found for this app')
  }

  let retry = yield cli.action(`Retrying ${cli.color.green('v' + release.version)} on ${cli.color.app(context.app)}`, {success: false}, co(function * () {
    let r = yield heroku.post(`/apps/${context.app}/releases`, {
      body: {
        slug: release.slug.id,
        description: `Retry of v${release.version}: ${release.description}`
      }
    })

    cli.action.done(`done, ${cli.color.green('v' + r.version)}`)
    return r
  }))

  if (retry.output_stream_url) {
    cli.log('Running release command...')

    yield new Promise(function (resolve, reject) {
      let stream = cli.got.stream(retry.output_stream_url)
      stream.on('error', reject)
      stream.on('end', resolve)
      let piped = stream.pipe(process.stdout)
      piped.on('error', reject)
    }).catch(err => {
      if (err.statusCode === 404) {
        cli.warn('Release command starting. Use `heroku releases:output` to view the log.')
        return
      }
      throw err
    })
  }
}

module.exports = {
  topic: 'releases',
  command: 'retry',
  description: 'Retry the latest release-phase command',
  help: 'Copies the latest release into a new one, retrying the latest release-phase command.',
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(run))
}
