'use server';

/**
 * @fileOverview A flow to translate emergency advice to a user's native language.
 *
 * - translateEmergencyAdvice - A function that translates emergency advice.
 * - TranslateEmergencyAdviceInput - The input type for the translateEmergencyAdvice function.
 * - TranslateEmergencyAdviceOutput - The return type for the translateEmergencyAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateEmergencyAdviceInputSchema = z.object({
  advice: z.string().describe('The emergency advice to translate.'),
  language: z.string().describe('The target language for the translation.'),
});
export type TranslateEmergencyAdviceInput = z.infer<
  typeof TranslateEmergencyAdviceInputSchema
>;

const TranslateEmergencyAdviceOutputSchema = z.object({
  translatedAdvice: z.string().describe('The translated emergency advice.'),
});
export type TranslateEmergencyAdviceOutput = z.infer<
  typeof TranslateEmergencyAdviceOutputSchema
>;

export async function translateEmergencyAdvice(
  input: TranslateEmergencyAdviceInput
): Promise<TranslateEmergencyAdviceOutput> {
  return translateEmergencyAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateEmergencyAdvicePrompt',
  input: {schema: TranslateEmergencyAdviceInputSchema},
  output: {schema: TranslateEmergencyAdviceOutputSchema},
  prompt: `Translate the following emergency advice to {{language}}:\n\n{{advice}}`,
});

const translateEmergencyAdviceFlow = ai.defineFlow(
  {
    name: 'translateEmergencyAdviceFlow',
    inputSchema: TranslateEmergencyAdviceInputSchema,
    outputSchema: TranslateEmergencyAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
