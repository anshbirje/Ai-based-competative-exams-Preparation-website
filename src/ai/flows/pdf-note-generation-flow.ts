'use server';
/**
 * @fileOverview A Genkit flow that processes PDF documents to generate concise study notes.
 *
 * - pdfNoteGeneration - A function that handles the note generation process from a PDF document.
 * - PdfNoteGenerationInput - The input type for the pdfNoteGeneration function.
 * - PdfNoteGenerationOutput - The return type for the pdfNoteGeneration function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PdfNoteGenerationInputSchema = z.object({
  documentUri: z
    .string()
    .describe(
      "A PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type PdfNoteGenerationInput = z.infer<typeof PdfNoteGenerationInputSchema>;

const PdfNoteGenerationOutputSchema = z.object({
  notes: z.string().describe('The concise, structured study notes generated from the PDF document.'),
});
export type PdfNoteGenerationOutput = z.infer<typeof PdfNoteGenerationOutputSchema>;

export async function pdfNoteGeneration(
  input: PdfNoteGenerationInput
): Promise<PdfNoteGenerationOutput> {
  return pdfNoteGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pdfNoteGenerationPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: PdfNoteGenerationInputSchema },
  output: { schema: PdfNoteGenerationOutputSchema },
  prompt: `You are an AI assistant specialized in creating concise and structured study notes from PDF documents.
Analyze the provided PDF document and extract the key information to generate comprehensive yet brief study notes.
The notes should be well-organized and easy to understand, focusing on critical concepts and summaries.
The PDF document is provided below:
{{media url=documentUri}}
`,
});

const pdfNoteGenerationFlow = ai.defineFlow(
  {
    name: 'pdfNoteGenerationFlow',
    inputSchema: PdfNoteGenerationInputSchema,
    outputSchema: PdfNoteGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate notes from PDF.');
    }
    return output;
  }
);
