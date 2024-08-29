import { Stack } from '@twilio-paste/core/stack';
import { Alert } from '@twilio-paste/core/alert';

import VoiceAssist from './VoiceAssist';

// import client from '../../../utils/sdk-clients/sync/SyncClient';
import { useSyncClient } from '@/app/context/Sync';

export type VoiceAssistTabProps = {
  callSid: string;
};

const VoiceAssistTabStub: React.FC<VoiceAssistTabProps> = ({ callSid }) => {
  const { client } = useSyncClient();

  const props = {
    task: {
      taskChannelUniqueName: 'voice',
      attributes: {
        call_sid: callSid,
      },
    },
  };

  if (!props.task || props.task.taskChannelUniqueName !== 'voice')
    return (
      <Stack orientation={'vertical'} spacing={'space20'}>
        <Alert variant={'neutral'}>
          <strong>Not active for this task:</strong> This tab only displays information for Call tasks
        </Alert>
      </Stack>
    );

  if (!client)
    return (
      <Stack orientation={'vertical'} spacing={'space20'}>
        <Alert variant={'neutral'}>
          <strong>Client not instantiated:</strong> This tab only displays information for Call tasks
        </Alert>
      </Stack>
    );

  return <VoiceAssist client={client} callSid={props.task.attributes.call_sid} />;
};

export default VoiceAssistTabStub;
