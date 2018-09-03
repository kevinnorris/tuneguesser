const MESSAGE_BASE = {
  response_type: 'in_channel',
  text: 'Hello :slightly_smiling_face:',
};

const ATTACHMENT_BASE = {
  text: 'Guess who added this song!',
  fallback: 'You are unalbe to guess',
  color: '#2c963f',
  attachment_type: 'default',
  callback_id: 'voting_action',
};

const FINISH_ACTION = {
  name: 'finish',
  text: 'Finish',
  style: 'danger',
  type: 'button',
  value: 'finish',
  confirm: {
    title: 'Are you sure?',
    text: 'This will close the guessing and talley votes',
    ok_text: 'Yes',
    dismiss_text: 'No',
  },
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

export function getNewMessage(users) {
  const userVoteButtons = createUserVoteButtons(users);

  return {
    ...MESSAGE_BASE,
    attachments: [
      {
        ...ATTACHMENT_BASE,
        actions: userVoteButtons,
      },
    ],
  };
}

export function getMessageWithVotes(pollMessage, votesMap) {
  const actionsWithVotes = pollMessage.attachments[0].actions.map((action) => {
    if (votesMap[action.value]) {
      return {
        ...action,
        text: `${action.text} (${votesMap[action.value]})`,
      };
    }
    return action;
  });

  return {
    ...pollMessage,
    attachments: [
      {
        ...ATTACHMENT_BASE,
        actions: actionsWithVotes,
      },
    ],
  };
}
