'use server';
/**
 * @fileOverview A Genkit flow for generating structured study notes from a given topic or keywords.
 *
 * - generateNotesFromText - A function that handles the note generation process.
 * - TextNoteGenerationInput - The input type for the generateNotesFromText function.
 * - TextNoteGenerationOutput - The return type for the generateNotesFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TextNoteGenerationInputSchema = z.object({
  topicOrKeywords: z
    .string()
    .describe('A topic or a comma-separated list of keywords to generate study notes from.'),
});
export type TextNoteGenerationInput = z.infer<
  typeof TextNoteGenerationInputSchema
>;

const TextNoteGenerationOutputSchema = z.object({
  title: z.string().describe('The title of the generated study notes.'),
  notes:
    z.string().describe(
      'The structured study notes, preferably in Markdown format with headings and bullet points.'
    ),
});
export type TextNoteGenerationOutput = z.infer<
  typeof TextNoteGenerationOutputSchema
>;

export async function generateNotesFromText(
  input: TextNoteGenerationInput
): Promise<TextNoteGenerationOutput> {
  return textNoteGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'textNoteGenerationPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: TextNoteGenerationInputSchema},
  output: {schema: TextNoteGenerationOutputSchema},
  prompt: `You are an AI assistant specialized in creating concise and structured study notes.

Generate detailed study notes based on the provided topic or keywords.
The notes should be well-organized with a clear title, headings, and bullet points.

Topic/Keywords: {{{topicOrKeywords}}}

Format the output as a JSON object with 'title' and 'notes' fields.
Ensure the 'notes' field is a Markdown string.`,
});

const textNoteGenerationFlow = ai.defineFlow(
  {
    name: 'textNoteGenerationFlow',
    inputSchema: TextNoteGenerationInputSchema,
    outputSchema: TextNoteGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate notes.');
    }
    return output;
  }
);
