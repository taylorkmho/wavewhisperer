import { z } from "zod";

export const voteSchema = z.object({
  id: z.string().uuid(),
  surf_report_id: z.string().uuid(),
  vote_type: z.enum(["up", "down"]),
  created_at: z.string(),
  ip_address: z.string(),
});

export const voteCountsSchema = z.object({
  upvotes: z.number(),
  downvotes: z.number(),
  userVote: z.enum(["up", "down"]).nullable(),
});

export type Vote = z.infer<typeof voteSchema>;
export type VoteCounts = z.infer<typeof voteCountsSchema>;
