import React from 'react';
import { Box } from '@twilio-paste/core/box';
import { Button } from '@twilio-paste/core/button';
import { Flex } from '@twilio-paste/core/flex';
import { Heading } from '@twilio-paste/core/heading';
import { Separator } from '@twilio-paste/core/separator';

import { ProcessDraftIcon } from '@twilio-paste/icons/esm/ProcessDraftIcon';
import { SuccessIcon } from '@twilio-paste/icons/esm/SuccessIcon';
import { Stack } from '@twilio-paste/core';
import { AiAction } from '@/types/VoiceAssistTypes';

export interface ActionListProps {
  actions: AiAction[];
}
const ActionList: React.FC<ActionListProps> = (props: ActionListProps) => {
  const MakeAction = (action: AiAction, idx: number) => (
    <Flex marginTop={'space30'}>
      <Flex grow>
        {action.completed ? (
          <SuccessIcon decorative={true} color={'colorTextIconSuccess'} />
        ) : (
          <ProcessDraftIcon decorative={true} />
        )}
        <Box marginLeft={'space20'}>
          <Heading as={'h3'} variant={'heading50'}>
            {action.title}
          </Heading>
        </Box>
      </Flex>
      <Flex>
        <Button variant="link" onClick={() => window.open(action.action_url, '_blank')}>
          View
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <Stack orientation={'vertical'} spacing={'space50'}>
      <Heading as={'div'} variant={'heading40'}>
        AI Recommended Actions
      </Heading>
      {props.actions.map((a, idx) => (
        <Box key={`action-${idx}`}>
          <MakeAction {...a} />
          {idx < props.actions.length - 1 && <Separator orientation={'horizontal'} />}
        </Box>
      ))}
    </Stack>
  );
};

export default ActionList;
