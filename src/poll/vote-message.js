const MESSAGE_BASE = {
  response_type: 'in_channel',
  text: 'Guess who added this song! :notes:',
};

const ATTACHMENT_BASE = {
  text: '',
  fallback: 'Unable to display buttons',
  color: '#2c963f',
  attachment_type: 'default',
  callback_id: 'voting_action',
};

export const INCORRECT_ACTION = {
  response_type: 'in_channel',
  text: ':x: Incorrect Action',
  mrkdwn: true,
  mrkdwn_in: ['text'],
  replace_original: true,
};

function createUserVoteButtons(users) {
  return users.map(user => ({
    name: 'vote',
    text: user.name,
    type: 'button',
    value: user.id,
  }));
}

function createAttachmenstForButtons(userVoteButtons) {
  // breaks userVoteButtons into attachments with action groups of 5
  return userVoteButtons.reduce((memo, voteButton) => {
    const lastAttachmentIndex = memo.length - 1;

    if (memo[lastAttachmentIndex].actions.length === 5) {
      return [...memo, { ...ATTACHMENT_BASE, actions: [voteButton] }];
    }

    memo[lastAttachmentIndex].actions.push(voteButton);
    return memo;
  }, [{ ...ATTACHMENT_BASE, actions: [] }]);
}

export function getNewMessage(users) {
  const userVoteButtons = createUserVoteButtons(users);
  const attachments = createAttachmenstForButtons(userVoteButtons);

  return {
    ...MESSAGE_BASE,
    attachments,
  };
}

export function getMessageWithVotes(pollMessage, votesMap) {
  const updatedAttachments = pollMessage.attachments.map(attachment => ({
    ...attachment,
    actions: attachment.actions.map(action => ({
      ...action,
      text: votesMap[action.value] ? `${action.text} (${votesMap[action.value]})` : action.text,
    })),
  }));

  return {
    ...pollMessage,
    attachments: updatedAttachments,
  };
}

export function getScoreMessage(song, requestingUser, usersWithCorrectAnswer) {
  switch (usersWithCorrectAnswer.length) {
  case 0:
    return `:sleuth_or_spy: No one guessed it was ${requestingUser} who played ${song}`;
  case 1:
    return `:star-struck: Only ${usersWithCorrectAnswer[0]} guessed that ${requestingUser} played ${song}`;
  case 2:
    return `${usersWithCorrectAnswer[0]} :right-facing_fist::left-facing_fist: ${usersWithCorrectAnswer[1]}`
      + ` both guessed that ${requestingUser} played ${song}`;
  case 5:
    return `:eyes: we're on to you ${requestingUser}`;
  default:
    return `:+1: ${usersWithCorrectAnswer.join(', ')} guessed ${requestingUser} played ${song}`;
  }
}

export function getTotalScoreMessage() {
  return 'Total score message';
}
