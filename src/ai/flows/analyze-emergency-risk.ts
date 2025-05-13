// src/ai/flows/analyze-emergency-risk.ts
'use server';

/**
 * @fileOverview Analyzes the risk level of a medical emergency and suggests potential solutions with multilingual support.
 *
 * - analyzeEmergencyRisk - A function that handles the emergency risk analysis process.
 * - AnalyzeEmergencyRiskInput - The input type for the analyzeEmergencyRisk function.
 * - AnalyzeEmergencyRiskOutput - The return type for the analyzeEmergencyRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeEmergencyRiskInputSchema = z.object({
  emergencyDescription: z
    .string()
    .describe('A description of the medical emergency.'),
  language: z
    .string()
    .optional()
    .describe('The language to respond in. Defaults to English.'),
});
export type AnalyzeEmergencyRiskInput = z.infer<typeof AnalyzeEmergencyRiskInputSchema>;

const AnalyzeEmergencyRiskOutputSchema = z.object({
  riskLevel: z.string().describe('The risk level of the emergency (e.g., low, medium, high).'),
  suggestedSolutions: z.array(z.string()).describe('An array of suggested solutions to the emergency.'),
  reason: z.string().describe('The reasoning behind the risk assessment and suggested solutions.'),
});
export type AnalyzeEmergencyRiskOutput = z.infer<typeof AnalyzeEmergencyRiskOutputSchema>;

export async function analyzeEmergencyRisk(input: AnalyzeEmergencyRiskInput): Promise<AnalyzeEmergencyRiskOutput> {
  return analyzeEmergencyRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmergencyRiskPrompt',
  input: {schema: AnalyzeEmergencyRiskInputSchema},
  output: {schema: AnalyzeEmergencyRiskOutputSchema},
  prompt: `You are an AI medical assistant that analyzes medical emergencies and provides potential solutions.

  Analyze the following medical emergency description and provide a risk level (low, medium, high) and suggested solutions.
  Respond in the specified language, if provided.

  Emergency Description: {{{emergencyDescription}}}
  Language: {{{language}}}

  Respond with the risk level, suggested solutions, and reasoning behind your assessment.
  Ensure the suggested solutions are clear and actionable.
  Follow the schema exactly and ensure it is valid JSON. Do not include any conversational text, only the JSON.
  `,
});

const analyzeEmergencyRiskFlow = ai.defineFlow(
  {
    name: 'analyzeEmergencyRiskFlow',
    inputSchema: AnalyzeEmergencyRiskInputSchema,
    outputSchema: AnalyzeEmergencyRiskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
