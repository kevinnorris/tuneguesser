import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

import { getUsers } from '../slack-utils';

export const guess: APIGatewayProxyHandler = async (event, _context) => {
  const bodyInfo = event.body.split('&');
  const channelId = bodyInfo
    .find(x => x.startsWith('channel_id'))
    .substring(11);
  const userId = bodyInfo.find(x => x.startsWith('user_id')).substring(8);

  const users = await getUsers(channelId);

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'You hit the /guess endpoint',
        body: event.body,
        channelId: channelId,
        userId: userId,
        channelUsers: users,
      },
      null,
      2
    ),
  };
};
