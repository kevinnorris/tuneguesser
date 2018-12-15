/* eslint no-param-reassign: 0 */
const score = {};
let currentChannel;
let currentPollMessage;
let currentUsers;
let votes = {};

export function getVoteCount() {
  return Object.values(votes).reduce((memo, guess) => {
    if (!memo[guess]) {
      memo[guess] = 1;
    } else {
      memo[guess] += 1;
    }

    return memo;
  }, {});
}

export function resetPoll(channelId) {
  votes = {};
  currentChannel = channelId;
}

export function getPollMessage() {
  return currentPollMessage;
}

export function setPollMessage(message) {
  currentPollMessage = message;
}

export function setUsers(users) {
  currentUsers = users.reduce((memo, user) => {
    const { id, ...rest } = user;
    memo[id] = rest;

    return memo;
  }, {});
}

export function vote(user, userVotedFor) {
  if (user !== userVotedFor) { // For testing comment out
    votes[user] = userVotedFor;
  }
}

function getUsersWithCorrectAnswer(requestingUserId) {
  return Object.entries(votes).reduce((memo, [userId, guess]) => {
    if (
      // userId !== requestingUserId &&// For testing
      guess === requestingUserId
    ) {
      return [...memo, userId];
    }
    return memo;
  }, []);
}

function increaseScores(userIds) {
  userIds.forEach((userId) => {
    if (score[userId]) {
      score[userId] += 1;
    } else {
      score[userId] = 1;
    }
  });
}

export function tallyScore(requestingUserId) {
  const userIdsWithCorrectAnswer = getUsersWithCorrectAnswer(requestingUserId).map(id => `<@${id}>`);

  increaseScores(userIdsWithCorrectAnswer);
  votes = {}; // Reset votes

  return [userIdsWithCorrectAnswer, currentChannel];
}

export function isSongAttribution(text) {
  return text
    && text.includes(':microphone: This track, ')
    && text.includes(', was last requested by ');
}
