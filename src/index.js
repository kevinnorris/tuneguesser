/* eslint import/first: 0 camelcase: 0 */
require('dotenv').config();

import express from 'express';
import bodyParser from 'body-parser';

import { getUsers, sendMessage } from './slack-utils';
import { getNewMessage, getMessageWithVotes, INCORRECT_ACTION } from './poll/vote-message';
import {
  resetPoll,
  getPollMessage,
  setPollMessage,
  vote,
  getVoteCount,
} from './poll/poll';

const score = {};
let channel;
let userVotes = {};

// [./ngrok http 8080] from code directory to start tunnel

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/slack/command/guess', async (req, res) => {
  try {
    const { channel_id } = req.body;
    resetPoll(channel_id);

    const users = await getUsers(channel_id);

    const pollMessage = getNewMessage(users);
    setPollMessage(pollMessage);

    return res.json(pollMessage);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Something blew up. We\'re looking into it.');
  }
});

app.post('/slack/actions', async (req, res) => {
  try {
    const actionResponse = JSON.parse(req.body.payload);
    const { callback_id } = actionResponse;

    if (callback_id === 'voting_action') {
      const { actions, user: { id } } = actionResponse;
      const { name: actionName, value } = actions[0];

      if (actionName === 'vote') {
        vote(id, value);
        const voteMap = getVoteCount();

        const messageWithVotes = getMessageWithVotes(getPollMessage(), voteMap);
        return res.json(messageWithVotes);
      }
    }

    return res.json(INCORRECT_ACTION);
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
