'use client';

import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adaptDifficulty, type AdaptDifficultyInput, type AdaptDifficultyOutput } from '@/ai/flows/adaptive-difficulty';
import { Loader2, Wand2 } from 'lucide-react';

const AdaptDifficultyClientSchema = z.object({
  playerSkillLevel: z.coerce.number().min(1).max(10),
  currentWave: z.coerce.number().min(1),
  environment: z.enum(['Saloon', 'Mines', 'Desert']),
  factions: z.array(z.object({
    name: z.string().min(1, "Faction name is required"),
    frequency: z.coerce.number().min(0),
  })).min(1, "At least one faction is required"),
});

type AdaptDifficultyClientInput = z.infer<typeof AdaptDifficultyClientSchema>;

const predefinedFactions = ["Outlaws", "Regulators", "Prospectors", "Mutants"];

export function AdaptiveBalancerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AdaptDifficultyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, register, formState: { errors } } = useForm<AdaptDifficultyClientInput>({
    resolver: zodResolver(AdaptDifficultyClientSchema),
    defaultValues: {
      playerSkillLevel: 5,
      currentWave: 1,
      environment: 'Desert',
      factions: predefinedFactions.map(name => ({ name, frequency: 0 })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "factions"
  });

  const onSubmit = async (data: AdaptDifficultyClientInput) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    const factionFrequency: Record<string, number> = {};
    data.factions.forEach(faction => {
      factionFrequency[faction.name] = faction.frequency;
    });

    const apiInput: AdaptDifficultyInput = {
      playerSkillLevel: data.playerSkillLevel,
      currentWave: data.currentWave,
      environment: data.environment,
      factionFrequency,
    };

    try {
      const output = await adaptDifficulty(apiInput);
      setResult(output);
    } catch (e) {
      console.error(e);
      setError((e as Error).message || 'Failed to adapt difficulty.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="playerSkillLevel" className="font-headline">Player Skill Level (1-10)</Label>
          <Controller
            name="playerSkillLevel"
            control={control}
            render={({ field }) => (
              <Input id="playerSkillLevel" type="number" {...field} min="1" max="10" className="mt-1" />
            )}
          />
          {errors.playerSkillLevel && <p className="text-sm text-destructive mt-1">{errors.playerSkillLevel.message}</p>}
        </div>

        <div>
          <Label htmlFor="currentWave" className="font-headline">Current Wave</Label>
          <Controller
            name="currentWave"
            control={control}
            render={({ field }) => (
              <Input id="currentWave" type="number" {...field} min="1" className="mt-1" />
            )}
          />
          {errors.currentWave && <p className="text-sm text-destructive mt-1">{errors.currentWave.message}</p>}
        </div>

        <div>
          <Label htmlFor="environment" className="font-headline">Environment</Label>
          <Controller
            name="environment"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="environment" className="mt-1">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Saloon">Saloon</SelectItem>
                  <SelectItem value="Mines">Mines</SelectItem>
                  <SelectItem value="Desert">Desert</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.environment && <p className="text-sm text-destructive mt-1">{errors.environment.message}</p>}
        </div>
        
        <div>
          <Label className="font-headline">Faction Frequencies</Label>
          <div className="space-y-2 mt-1">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input {...register(`factions.${index}.name`)} readOnly className="bg-muted"/>
                <Input 
                  type="number" 
                  {...register(`factions.${index}.frequency`)} 
                  placeholder="Frequency"
                  min="0"
                />
              </div>
            ))}
            {errors.factions && <p className="text-sm text-destructive mt-1">{errors.factions.message || errors.factions.root?.message}</p>}
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Adapt Wave Difficulty
        </Button>
      </form>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive font-headline">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary font-headline">Adaptive Wave Configuration</CardTitle>
            <CardDescription>Generated parameters for the next wave.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>Wave Difficulty:</strong> <span className="text-accent font-semibold">{result.waveDifficulty}</span></p>
            <div>
              <strong>Enemy Types:</strong>
              <ul className="list-disc list-inside ml-4">
                {result.enemyTypes.map((type, i) => <li key={i}>{type}</li>)}
              </ul>
            </div>
            <div>
              <strong>Available Weapons:</strong>
              <ul className="list-disc list-inside ml-4">
                {result.availableWeapons.map((weapon, i) => <li key={i}>{weapon}</li>)}
              </ul>
            </div>
            <div>
              <strong>Faction Adjustments:</strong>
              <ul className="list-disc list-inside ml-4">
                {Object.entries(result.factionAdjustments).map(([faction, adj]) => (
                  <li key={faction}>{faction}: {adj > 0 ? `+${adj}` : adj}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
