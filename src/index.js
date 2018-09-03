/* eslint import/first: 0 */
require('dotenv').config();

import express from 'express';
import bodyParser from 'body-parser';

import { getUsers, sendMessage } from './slack-utils';
import { getNewPollMessage, getPollWithVotes } from './poll';

const score = {};
let channel;
let currentPollMessage;
let userVotes = {};

// [./ngrok http 8080] from code directory to start tunnel

function getVoteTally() {
  return Object.values(userVotes).reduce((memo, vote) => {
    if (!memo[vote]) {
      memo[vote] = 1;
    } else {
      memo[vote] += 1;
    }

    return memo;
  }, {});
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/slack/command/guess', async (req, res) => {
  try {
    const slackReqObj = req.body;
    channel = slackReqObj.channel_id;

    const users = await getUsers(slackReqObj.channel_id);
    const userActions = users.map(user => ({
      name: 'vote',
      text: user.name,
      type: 'button',
      value: user.id,
    }));

    currentPollMessage = getNewPollMessage(userActions);
    userVotes = {}; // Reset votes

    return res.json(currentPollMessage);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Something blew up. We\'re looking into it.');
  }
});

app.post('/slack/actions', async (req, res) => {
  try {
    const actionResponse = JSON.parse(req.body.payload);

    if (actionResponse.callback_id === 'voting_action') {
      const { user: { id } } = actionResponse;
      const { name: actionName, value } = actionResponse.actions[0];

      if (actionName === 'vote') {
        userVotes[id] = value;

        const voteTally = getVoteTally();
        console.log('voteTally', voteTally);

        const pollWithVotes = getPollWithVotes(currentPollMessage, voteTally);
        return res.json(pollWithVotes);
      }

      return res.json({
        response_type: 'in_channel',
        text: 'Something went wrong :heavy_check_mark:',
        mrkdwn: true,
        mrkdwn_in: ['text'],
        replace_original: false,
      });
      // replace_original: bool that can go on messages
    }

    return res.json({
      response_type: 'in_channel',
      text: 'Wrong action',
      mrkdwn: true,
      mrkdwn_in: ['text'],
      replace_original: false,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Something blew up. We\'re looking into it.');
  }
});

app.post('/slack/events', async (req, res) => {
  if (req.body.challenge) {
    return res.send(req.body.challenge);
  }

  if (req.body.event) {
    const { text, type } = req.body.event;

    if (type === 'message' && text && text.includes(':microphone: This track, ') && text.includes(', was last requested by ')) {
      const requestingUserId = text.match(/<@(.+?)>/)[1];
      console.log('requestingUserId', requestingUserId);

      const usersWhoGuessedCorrectly = Object.entries(userVotes).reduce((memo, [userId, guess]) => {
        if (userId !== requestingUserId && guess === requestingUserId) {
          return [...memo, userId];
        }
        return memo;
      }, []);
      console.log('usersWhoGuessedCorrectly', usersWhoGuessedCorrectly);

      // Increase their score
      usersWhoGuessedCorrectly.forEach((userId) => {
        if (score[userId]) {
          score[userId] += 1;
        } else {
          score[userId] = 1;
        }
      });

      // Reset votes
      userVotes = {};

      // Send a message about who got it right
      sendMessage({ text: 'Score increased' }, channel);
    }
  }
  return res.json({ response: 'hello' });
});

app.use((req, res) => {
  res.status(404).send({
    status: 404,
    message: 'The requested resource was not found',
  });
});

app.listen(8080);
