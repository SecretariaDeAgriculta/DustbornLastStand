'use server';

/**
 * @fileOverview An AI agent that adapts the game difficulty to the player's skill level.
 *
 * - adaptDifficulty - A function that handles the game difficulty adaptation process.
 * - AdaptDifficultyInput - The input type for the adaptDifficulty function.
 * - AdaptDifficultyOutput - The return type for the adaptDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptDifficultyInputSchema = z.object({
  playerSkillLevel: z
    .number()
    .describe('The player skill level, ranging from 1 (beginner) to 10 (expert).'),
  currentWave: z.number().describe('The current wave number in the game.'),
  environment: z.string().describe('The current environment of the game level.'),
  factionFrequency: z
    .record(z.number())
    .describe(
      'A record of how often each faction has appeared, with faction names as keys and frequencies as values.'
    ),
});
export type AdaptDifficultyInput = z.infer<typeof AdaptDifficultyInputSchema>;

const AdaptDifficultyOutputSchema = z.object({
  waveDifficulty: z
    .string()
    .describe(
      'The recommended difficulty level for the next wave, can be easy, medium, or hard.'
    ),
  enemyTypes: z
    .array(z.string())
    .describe('The types of enemies to include in the next wave.'),
  availableWeapons: z
    .array(z.string())
    .describe('The weapons available to the player in the next wave.'),
  factionAdjustments: z
    .record(z.number())
    .describe(
      'Adjustments to the frequency of factions, with faction names as keys and adjustment values as values. Positive values increase frequency, negative values decrease it.'
    ),
});
export type AdaptDifficultyOutput = z.infer<typeof AdaptDifficultyOutputSchema>;

export async function adaptDifficulty(input: AdaptDifficultyInput): Promise<AdaptDifficultyOutput> {
  return adaptDifficultyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptDifficultyPrompt',
  input: {schema: AdaptDifficultyInputSchema},
  output: {schema: AdaptDifficultyOutputSchema},
  prompt: `You are an expert game designer specializing in creating engaging and challenging game experiences.

You are designing the next wave for the game Dustborn: Last Stand.

Based on the player's skill level, the current wave, the environment, and the frequency of factions, you will determine the difficulty of the next wave, the types of enemies to include, the weapons available to the player, and any adjustments to the frequency of factions.

Player Skill Level: {{{playerSkillLevel}}}
Current Wave: {{{currentWave}}}
Environment: {{{environment}}}
Faction Frequency: {{{factionFrequency}}}

Consider the following when making your decisions:

- A higher player skill level should result in a more difficult wave.
- The difficulty should increase as the player progresses through the waves.
- The environment should influence the types of enemies and weapons available.
- Faction frequency should be adjusted to ensure a balanced and varied experience.

Output the waveDifficulty as easy, medium, or hard.
Output factionAdjustments to +1 or -1 or 0. Example: {Faction1: +1, Faction2: -1, Faction3: 0}

`,
});

const adaptDifficultyFlow = ai.defineFlow(
  {
    name: 'adaptDifficultyFlow',
    inputSchema: AdaptDifficultyInputSchema,
    outputSchema: AdaptDifficultyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
