/* eslint camelcase: 0 */
import fetch from 'node-fetch';

async function getUser(userId) {
  const user = await fetch(`https://slack.com/api/users.info?token=${process.env.BOT_TOKEN}&user=${userId}`);
  const userJson = await user.json();

  if (!userJson.ok) {
    return userJson.error;
  }

  const { user: { id, profile: { bot_id, display_name, first_name, image_32 } } } = userJson;
  if (bot_id) {
    return null;
  }

  return { id, name: display_name || first_name, avatarUrl: image_32 };
}

export async function getUsers(channelId) {
  try {
    const channelInfo = await fetch(`https://slack.com/api/channels.info?token=${process.env.BOT_TOKEN}&channel=${channelId}`);
    const channelInfoJson = await channelInfo.json();

    if (!channelInfoJson.ok) {
      return channelInfoJson.error;
    }

    const { channel: { members } } = channelInfoJson;

    const userPromises = members.map(memberId => getUser(memberId));
    const users = await Promise.all(userPromises);
    return users.filter(user => !!user);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function sendMessage(message, channelId) {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://slack.com/api/chat.postMessage?token=${process.env.BOT_TOKEN}&channel=${channelId}&text=${encodedMessage}`;

  const response = await fetch(url, {
    method: 'POST',
  });
  const parsed = await response.json();
  // TODO: error handling when ok: false
}
