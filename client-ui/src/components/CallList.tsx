'use client';

import React, { useEffect } from 'react';
import { Anchor } from '@twilio-paste/core/anchor';
import { Table, THead, TBody, Tr, Th, Td } from '@twilio-paste/core/table';
import { useSyncClient } from '@/app/context/Sync';
import { Call } from '../types/VoiceAssistTypes';
import { SyncMapItem } from 'twilio-sync';
import { SkeletonLoader } from '@twilio-paste/core';
import SyncHelper from '../utils/SyncHelper';

export interface CallListProps {}

const CallList: React.FC<CallListProps> = (props: CallListProps) => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<SyncMapItem[]>([]);
  const { client } = useSyncClient();

  useEffect(() => {
    let signalCancel: boolean = false;
    const subscribeToMap = async () => {
      const mapName = process.env.NEXT_PUBLIC_CALL_LOG_MAP || 'Live Transcription Calls';
      console.log(`Fetching map: ${mapName}`);

      if (signalCancel) {
        console.log('Subscription cancelled, not subscribing to map');
        return;
      }

      if (!client) {
        console.log(`Sync client is not set`);
        return;
      }

      const data = await SyncHelper.getMapItems(client, mapName);
      setData(data);
      setLoading(false);
    };
    subscribeToMap();

    return () => {
      signalCancel = true;
    };
  }, [client]);

  const MakeRow: React.FC<{ data: SyncMapItem }> = ({ data }) => {
    return (
      <Tr>
        <Td>
          <Anchor href={'#'} onClick={() => window.open(`/index.html?sid=${data.key}`, `_blank`)}>
            {data.key}
          </Anchor>
        </Td>
      </Tr>
    );
  };

  const LoadingRows = () => {
    return (
      <>
        <Tr>
          <Td>
            <SkeletonLoader />
          </Td>
        </Tr>
        <Tr>
          <Td>
            <SkeletonLoader />
          </Td>
        </Tr>
        <Tr>
          <Td>
            <SkeletonLoader />
          </Td>
        </Tr>
      </>
    );
  };

  return (
    <Table>
      <THead>
        <Tr>
          <Th>SID</Th>
        </Tr>
      </THead>
      <TBody>
        {loading && <LoadingRows />}
        {!loading && data.length === 0 && (
          <Tr>
            <Td>No calls in progress</Td>
          </Tr>
        )}
        {!loading && data.length > 0 && (
          <>
            {data.map((item, idx) => (
              <MakeRow data={item} key={`call_${idx}`} />
            ))}
          </>
        )}
      </TBody>
    </Table>
  );
};

export default CallList;
