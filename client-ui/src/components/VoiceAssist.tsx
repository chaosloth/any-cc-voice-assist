import { useEffect, useState } from 'react';
import { SyncClient, SyncStream } from 'twilio-sync';
import { AiTranscriptionMessage } from '@/types/VoiceAssistTypes';

import { Card } from '@twilio-paste/core/card';
import { Box } from '@twilio-paste/core/box';
import { Stack } from '@twilio-paste/core/stack';

import Transcript from './Transcript';
import ActionsPanel from './ActionsPanel';

export type VoiceAssistProps = {
  client: SyncClient;
  callSid: string;
};

const VoiceAssist: React.FC<VoiceAssistProps> = ({ client, callSid }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState<AiTranscriptionMessage[]>([]);
  const [requestAnalysis, setRequestAnalysis] = useState(false);

  useEffect(() => {
    if (requestAnalysis === false) return;
    // if (transcript.length <= 2 === false) return; // Don't analyse small transcript

    let signalCancel = false;

    const performAnalysis = () => {
      console.log('Performing analysis on transcript');

      fetch(`${BASE_URL}/api/perform-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript, CallSid: callSid }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (signalCancel) {
            console.log('Analysis cancelled before result returned');
            return;
          }
          console.log('Analysis result:', data);
          // Do something with the analysis result
          // setTranscript((transcript) => [msg, ...transcript]);
        })
        .catch((error) => {
          console.error('Error performing analysis:', error);
        })
        .finally(() => setRequestAnalysis(false));
    };

    performAnalysis();
    return () => {
      signalCancel = true;
    };
  }, [requestAnalysis]);

  useEffect(() => {
    if (!client) {
      console.log('Error: Missing client for Voice Assist');
      return;
    }

    if (!callSid || callSid === '') {
      console.log('Error: Missing callSid for Voice Assist');
      return;
    }
    console.log('Using this CallSid for stream connection:', callSid);

    let signalCancel = false;
    const subscribeToStream = async function subscribeToStream() {
      try {
        const stream: SyncStream = await client.stream(`TRANSCRIPTION_${callSid}`);

        if (signalCancel) {
          console.log('Subscription has been cancelled, returning');
          stream.removeAllListeners();
          stream.close();
          return;
        }
        setLoading(false);
        console.log('Access to stream:', stream);

        stream.on('messagePublished', (event) => {
          const msg: AiTranscriptionMessage = event.message.data as AiTranscriptionMessage;
          console.log(`Transcription event (${msg.actor})`, event);
          setTranscript((transcript) => [msg, ...transcript]);
          if (msg.actor === 'inbound') setRequestAnalysis(true);
        });
      } catch (error) {
        console.error('RVS: Unable to subscribe to Sync stream', error);
      }
    };

    subscribeToStream();
    return () => {
      signalCancel = true;
      console.log('Tearing down useEffect subscription');
    };
  }, [callSid, client]);

  const actionMessages = transcript.filter((entry) => entry.actor === 'AI' && entry.type === 'action');
  const actions = actionMessages.map((msg) => msg.ai);

  return (
    <Box padding={'space80'}>
      <Stack orientation={'vertical'} spacing={'space60'}>
        <ActionsPanel actions={actions} />
        <Card padding={'space10'}>
          <Transcript loading={loading} transcript={transcript} />
        </Card>
      </Stack>
    </Box>
  );
};

export default VoiceAssist;
