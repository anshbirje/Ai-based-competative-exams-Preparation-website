'use server';
/**
 * @fileOverview A Genkit flow for generating flashcards from study notes.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  noteContent: z.string().describe('The content of the study note to generate flashcards from.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
    front: z.string().describe('The content for the front of the flashcard (e.g., a question or a term).'),
    back: z.string().describe('The content for the back of the flashcard (e.g., the answer or definition).'),
});

const GenerateFlashcardsOutputSchema = z.object({
    flashcards: z.array(FlashcardSchema).describe('An array of generated flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;


export async function generateFlashcards(
  input: GenerateFlashcardsInput
): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: GenerateFlashcardsInputSchema },
  output: { schema: GenerateFlashcardsOutputSchema },
  prompt: `You are an expert study assistant. Your task is to create a set of flashcards from the provided study notes.

For each flashcard, create a clear and concise question or term for the 'front' and a corresponding answer or definition for the 'back'.

Focus on the most important concepts, definitions, and key facts in the notes.

Generate as many high-quality flashcards as possible from the provided content.

Study Notes:
{{{noteContent}}}
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate flashcards.');
    }
    return output;
  }
);
