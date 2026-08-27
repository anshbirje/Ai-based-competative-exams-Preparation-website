import { Timestamp } from 'firebase/firestore';

export interface Subject {
  id: string;
  name: string;
  userProfileId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  userProfileId: string;
  isAIGenerated: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
