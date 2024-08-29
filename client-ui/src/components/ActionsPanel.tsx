import React from 'react';
import { Card } from '@twilio-paste/core/card';
import { Grid, Column } from '@twilio-paste/core/grid';
import { AiAction } from '../types/VoiceAssistTypes';

import ActionList from './ActionList';
import ActionProgress from './ActionProgress';

export interface ActionsPanelProps {
  actions: AiAction[];
}
const ActionsPanel: React.FC<ActionsPanelProps> = (props: ActionsPanelProps) => {
  return (
    <Grid gutter="space30" equalColumnHeights={false}>
      <Column span={6}>
        <Card padding="space70">
          <ActionList actions={props.actions} />
        </Card>
      </Column>
      <Column span={6}>
        <Card padding="space70">
          <ActionProgress actions={props.actions} />
        </Card>
      </Column>
    </Grid>
  );
};

export default ActionsPanel;
