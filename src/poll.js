const POLL_BASE = {
  response_type: 'in_channel',
  text: 'Hello :slightly_smiling_face:',
};

const POLL_ATTACHMENT = {
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

export function getNewPollMessage(userActions) {
  return {
    ...POLL_BASE,
    attachments: [
      {
        ...POLL_ATTACHMENT,
        actions: userActions,
      },
    ],
  };
}

export function getPollWithVotes(pollMessage, votesMap) {
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
        ...POLL_ATTACHMENT,
        actions: actionsWithVotes,
      },
    ],
  };
}
