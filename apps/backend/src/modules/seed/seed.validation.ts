import { z } from 'zod';

export const seedDemoDataSchema = {
  query: z
    .object({
      count: z.coerce.number().int().min(1).max(50).default(20),
    })
    .strip(),
};

export type SeedDemoDataQuery = z.infer<(typeof seedDemoDataSchema)['query']>;
