'use server';
import { config } from 'dotenv';

// Load environment variables from .env.local, which is standard for Next.js.
// The Genkit server runs as a separate process and needs to be told to load these.
config({ path: '.env.local' });

// As a fallback for different environments or user setups, also load .env.
// dotenv will not override any variables that are already set.
config();

import '@/ai/flows/pdf-note-generation-flow.ts';
import '@/ai/flows/image-note-generation-flow.ts';
import '@/ai/flows/text-note-generation-flow.ts';
import '@/ai/flows/generate-flashcards-flow.ts';
