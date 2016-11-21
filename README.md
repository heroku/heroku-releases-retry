# Releases Retry

This plugin is meant to be used with apps using [Release Phase](https://devcenter.heroku.com/articles/release-phase).  
It will take the latest release in an app, and create a new one identical to it. That will trigger a new release-phase command, allowing for retrying them.

## Installation

Run the following command:

> heroku plugins:install releases-retry

## Usage

Retry the latest release:

> heroku releases:retry --app happy-samurai-42
