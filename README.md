# Tune Guesser

A slack bot for guessing who played the current tune while using with [Jukebot](https://getjukebot.com/).

## Installation

- Clone the repository.
- Install dependencies.
  - `yarn`

## Setup

- Download [ngrok](https://ngrok.com/download)
- Create a [new slack app](https://api.slack.com/apps?new_app=1)
  - Add the following scopes:
    - `channels:history`
    - `bot`
    - `commands`
  - Turn "Interactive Components" on
  - Create "Slash Commands" for `/guess` and `/score`
  - Enable "Event Subscriptions" and subscribe to the bot event `message.channels`

## Starting the application locally

1. Start ngrok with `./ngrok http 8080` to get a public url for your local server
2. Start your slack bot with `yarn dev`
3. Update all of the URL's in the [slack api](https://api.slack.com/apps) for your slack bot with your new public url
4. Add your slack bot to a slack workspace (only required once)
