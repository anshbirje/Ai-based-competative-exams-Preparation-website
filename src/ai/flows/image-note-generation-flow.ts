'use server';
/**
 * @fileOverview A Genkit flow that processes images containing text to generate concise, structured study notes.
 *
 * - generateNotesFromImage - A function that handles the note generation process from an image.
 * - ImageNoteGenerationInput - The input type for the generateNotesFromImage function.
 * - ImageNoteGenerationOutput - The return type for the generateNotesFromImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImageNoteGenerationInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "An image containing text (e.g., a textbook page) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Supported MIME types: image/*."
    ),
});
export type ImageNoteGenerationInput = z.infer<typeof ImageNoteGenerationInputSchema>;

const ImageNoteGenerationOutputSchema = z.object({
  notes: z.string().describe('The concise, structured study notes extracted from the image.'),
});
export type ImageNoteGenerationOutput = z.infer<typeof ImageNoteGenerationOutputSchema>;

export async function generateNotesFromImage(
  input: ImageNoteGenerationInput
): Promise<ImageNoteGenerationOutput> {
  return imageNoteGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageNoteGenerationPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: ImageNoteGenerationInputSchema },
  output: { schema: ImageNoteGenerationOutputSchema },
  prompt: `You are an AI assistant specialized in extracting key information from images containing text and generating concise and structured study notes.
Analyze the provided image and extract the most important information to create comprehensive yet brief study notes.
The notes should be well-organized and easy to understand.
The image content is provided below:
{{media url=imageUri}}`,
});

const imageNoteGenerationFlow = ai.defineFlow(
  {
    name: 'imageNoteGenerationFlow',
    inputSchema: ImageNoteGenerationInputSchema,
    outputSchema: ImageNoteGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate notes from image.');
    }
    return output;
  }
);
