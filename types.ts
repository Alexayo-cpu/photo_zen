export type SwipeAction = 'keep' | 'delete' | 'favorite' | null;

export interface PhotoItem {
  id: string;
  file: File;
  url: string;
  status: 'pending' | 'kept' | 'deleted' | 'favorite';
}

export type AppScreen = 'onboarding' | 'swiping' | 'summary';

export interface Settings {
  batchSize: number;
}