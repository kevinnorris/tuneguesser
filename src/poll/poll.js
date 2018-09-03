/* eslint no-param-reassign: 0 */
const score = {};
let currentChannel;
let currentPollMessage;
let votes = {};

export function getVoteCount() {
  return Object.values(votes).reduce((memo, voteValue) => {
    if (!memo[voteValue]) {
      memo[voteValue] = 1;
    } else {
      memo[voteValue] += 1;
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

export function vote(user, userVotedFor) {
  // if (user !== userVotedFor) { // For testing
    votes[user] = userVotedFor;
  // }
}
