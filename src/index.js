/* eslint import/first: 0 camelcase: 0 */
require('dotenv').config();

import express from 'express';
import bodyParser from 'body-parser';

import { getUsers, sendMessage } from './slack-utils';
import {
  getNewMessage,
  getMessageWithVotes,
  getScoreMessage,
  INCORRECT_ACTION,
} from './poll/vote-message';
import {
  resetPoll,
  getPollMessage,
  setPollMessage,
  setUsers,
  vote,
  getVoteCount,
  tallyScore,
  isSongAttribution,
} from './poll/poll';

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
    setUsers(users);

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
    const isMessage = type === 'message';
    console.log('isMessage', isMessage);
    const textIsSongAttribution = isSongAttribution(text);
    console.log('textIsSongAttribution', textIsSongAttribution);

    if (isMessage && textIsSongAttribution) {
      const requestingUserId = text.match(/<@(.+?)>/)[1];
      console.log('requestingUserId', requestingUserId);

      const [userNamesWhoGuessedCorrectly, channelId] = tallyScore(requestingUserId);

      const message = getScoreMessage(userNamesWhoGuessedCorrectly);
      // Send a message about who got it right
      sendMessage(message, channelId);
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
