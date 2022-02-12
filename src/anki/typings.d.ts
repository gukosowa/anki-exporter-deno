export interface DeckConfig {
  id?: number;
  name: string;
  dest?: string;
  card: {
    fields: string[];
    template: {
      question: string;
      answer: string;
    };
    styleText?: string;
  };
}

export interface Card {
  timestamp?: number;
  content: string[];
}
