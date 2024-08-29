import React from 'react';
import { Box } from '@twilio-paste/core/box';
import { Card } from '@twilio-paste/core/card';
import { HelpText } from '@twilio-paste/core/help-text';
import { ProgressBar, ProgressBarLabel } from '@twilio-paste/core/progress-bar';
import { Stack } from '@twilio-paste/core/stack';
import { AiAction } from '../types/VoiceAssistTypes';

export interface ActionProgressProps {
  actions: AiAction[];
}
const ActionProgress: React.FC<ActionProgressProps> = (props: ActionProgressProps) => {
  const completedActions = props.actions.filter((action) => action.completed === true);
  const percentComplete = Math.round((completedActions.length / props.actions.length) * 100) || 0;

  return (
    <Box marginBottom="space90">
      <ProgressBarLabel htmlFor={'actions-progress-bar'} valueLabel={`${percentComplete}%`}>
        Completed Actions
      </ProgressBarLabel>
      <ProgressBar
        id={'actions-progress-bar'}
        aria-describedby={'actions-progress-bar-help'}
        value={percentComplete}
        valueLabel={`${percentComplete}%`}
      />
      <HelpText id={'actions-progress-bar-help'}>Progress towards completing AI recommended actions.</HelpText>
    </Box>
  );
};

export default ActionProgress;
