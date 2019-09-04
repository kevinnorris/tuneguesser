import fetch from 'node-fetch';

type User = {
  id: string;
  name: string;
  avatarUrl: string;
  is_bot: boolean;
};

type ChannelInfo = {
  ok: boolean;
  error: string;
  channel: {
    id: string;
    name: string;
    members: string[];
  };
};

async function getUser(userId: string): Promise<User | null> {
  const rawResult = await fetch(
    `https://slack.com/api/users.info?token=${process.env.BOT_TOKEN}&user=${userId}`
  );
  const result = await rawResult.json();

  const { error, user } = result;

  if (error) {
    console.log(`Error getting user ${userId}: ${error}`);
    return null;
  }

  const {
    id,
    is_bot,
    profile: { real_name, display_name, first_name, image_32 },
  } = user;

  return {
    id,
    name: display_name || first_name || real_name,
    avatarUrl: image_32,
    is_bot,
  };
}

export async function getUsers(channelId: string): Promise<User[] | null> {
  const channelInfoRaw = await fetch(
    `https://slack.com/api/channels.info?token=${process.env.BOT_TOKEN}&channel=${channelId}`
  );
  const channelInfo: ChannelInfo = await channelInfoRaw.json();

  const { channel, error } = channelInfo;

  if (error) {
    console.log(`Error getting users for ${channelId} channel: ${error}`);
    return null;
  }

  const { members } = channel;
  const users = await Promise.all(members.map(userId => getUser(userId)));

  return users.filter(user => !!user);
}
