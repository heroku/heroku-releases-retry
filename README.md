# Releases Retry [![Build Status](https://travis-ci.org/heroku/heroku-releases-retry.svg?branch=master)](https://travis-ci.org/heroku/releases-retry)

This plugin is meant to be used with apps using [Release Phase](https://devcenter.heroku.com/articles/release-phase).  
It will take the latest release in an app, and create a new one identical to it. That will trigger a new release-phase command, allowing for retrying them.

## Installation

Run the following command:

> heroku plugins:install heroku-releases-retry

## Usage

Retry the latest release:

> heroku releases:retry --app happy-samurai-42

## Usage with container apps

The plugin doesn't support container apps. You will get the following error:

```
Cannot read property 'id' of null
```

You need to push a new image instead of using this plugin.
