export type Call = {
  callSid: string;
};

export type AiTranscriptionSyncEvent = {
  data: AiTranscriptionMessage; // twilio-sync StreamMessage type
  sid: string;
};

export type AiTranscriptionMessage = AiMessage | TranscriptionMessage;

export type AiMessage = AiSuggestionMessage | AiActionMessage;

export enum Actor {
  AI = 'AI',
  inbound = 'inbound',
  outbound = 'outbound',
  assistant = 'assistant',
}

export type AiSuggestionMessage = {
  actor: Actor.AI;
  type: 'suggestion';
  ai: AiSuggestion;
};

export type AiActionMessage = {
  actor: Actor.AI;
  type: 'action';
  ai: AiAction;
};

export type TranscriptionMessage = {
  actor: Actor.inbound | Actor.outbound | Actor.assistant;
  transcriptionText: string;
};

export type LegacySyncStreamEvent = {
  message: any; // twilio-sync does not export the StreamMessage type
  isLocal: boolean;
};

export type TranscriptTurn = {
  message: string;
  direction: 'inbound' | 'outbound';
};

export type AiAction = {
  title: string;
  description?: string;
  action_url: string;
  completed: boolean;
};

export type AiSuggestion = {
  title: string;
  suggestion: string;
};

export type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
};

export interface OpenAIResponse {
  result: Result;
}

export interface Result {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
}

export interface Choice {
  index: number;
  message: Message;
  finish_reason: string;
}

export interface Message {
  role: string;
  content: string;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
