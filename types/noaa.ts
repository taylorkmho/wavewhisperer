import { z } from "zod";

// Wave Height Schema
export const waveHeightSchema = z.object({
  direction: z.string(),
  height: z.string(),
  minHeight: z.number(),
  maxHeight: z.number(),
  trend: z.enum(["increasing", "decreasing", "steady"]),
  order: z.number(),
});

// Surf Report Schema
export const surfReportSchema = z.object({
  id: z.string(),
  lastBuildDate: z.string(),
  lastBuildDateObject: z.date(),
  discussion: z.array(z.string()),
  waveHeights: z.array(waveHeightSchema),
  poem: z.array(z.string()).optional(),
  model: z.string().optional(),
  audioPath: z.string().optional(),
});

// Types inferred from schemas
export type WaveHeight = z.infer<typeof waveHeightSchema>;
export type SurfReport = z.infer<typeof surfReportSchema>;
