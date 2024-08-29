import {
  ChatBubble,
  ChatLog,
  ChatMessage,
  ChatMessageMeta,
  ChatMessageMetaItem,
  ChatBookend,
  ChatBookendItem,
} from '@twilio-paste/core/chat-log';
import { Tooltip } from '@twilio-paste/core/tooltip';
import { Avatar } from '@twilio-paste/core/avatar';
import { SkeletonLoader } from '@twilio-paste/core/skeleton-loader';
import { Box } from '@twilio-paste/core/box';
import { Stack } from '@twilio-paste/core/stack';
import { UserIcon } from '@twilio-paste/icons/esm/UserIcon';
import { AgentIcon } from '@twilio-paste/icons/esm/AgentIcon';
import { AiTranscriptionMessage } from '../types/VoiceAssistTypes';

import SuggestionCard from './SuggestionCard';
import ActionCard from './ActionCard';
import React from 'react';

export type TranscriptProps = {
  loading: boolean;
  transcript: AiTranscriptionMessage[];
};

const Transcript: React.FC<TranscriptProps> = ({ loading, transcript }) => {
  const RenderMessage = (item: AiTranscriptionMessage) => {
    const direction = item.actor === 'outbound' ? 'outbound' : 'inbound';
    if (item.actor === 'AI') {
      switch (item.type) {
        case 'suggestion':
          if (!item.ai) return <></>;
          return <SuggestionCard suggestion={item.ai} />;
        case 'action':
          return <ActionCard action={item.ai} />;
        default:
          return <></>;
      }
    }

    return (
      <ChatMessage variant={direction}>
        <ChatBubble>{item.transcriptionText}</ChatBubble>
        <ChatMessageMeta aria-label={direction}>
          <Tooltip text={direction}>
            <ChatMessageMetaItem>
              <Avatar name={direction} size="sizeIcon20" icon={direction === 'inbound' ? UserIcon : AgentIcon} />
              {direction === 'inbound' ? 'Customer' : 'You'}
            </ChatMessageMetaItem>
          </Tooltip>
        </ChatMessageMeta>
      </ChatMessage>
    );
  };

  if (loading)
    return (
      <Box padding={'space40'}>
        <Stack orientation={'vertical'} spacing={'space20'}>
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </Stack>
      </Box>
    );

  return (
    <Box width={'100%'} overflow="scroll" inset={undefined} backgroundColor={'colorBackgroundBody'}>
      <ChatLog>
        {transcript && (
          <ChatBookend>
            <ChatBookendItem>
              <strong>Twilio</strong> real-time voice suggestion
            </ChatBookendItem>
          </ChatBookend>
        )}

        {transcript &&
          transcript.map((item: AiTranscriptionMessage, idx: number) => (
            <RenderMessage {...item} key={`chat-${idx}`} />
          ))}
      </ChatLog>
    </Box>
  );
};

export default Transcript;
