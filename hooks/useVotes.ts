import { supabase } from "@/lib/supabase/client";
import { type Vote, type VoteCounts } from "@/types/votes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useVotes(surfReportId: string) {
  const queryClient = useQueryClient();
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({
    upvotes: 0,
    downvotes: 0,
    userVote: null,
  });

  // Query to fetch initial vote counts and user's vote
  const { data: initialVotes } = useQuery<Vote[]>({
    queryKey: ["votes", surfReportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .eq("surf_report_id", surfReportId);

      if (error) throw error;
      return data;
    },
  });

  // Update vote counts when initial data changes
  useEffect(() => {
    if (initialVotes) {
      const ups = initialVotes.filter((v) => v.vote_type === "up").length;
      const downs = initialVotes.filter((v) => v.vote_type === "down").length;

      // Get the current IP
      const getCurrentIp = async () => {
        const { data: ipData } = await supabase.rpc("get_client_ip");
        const currentIp = ipData as string;

        // Find user's vote by matching IP
        const userVote =
          initialVotes.find((v) => v.ip_address === currentIp)?.vote_type ||
          null;

        setVoteCounts({ upvotes: ups, downvotes: downs, userVote });
      };

      getCurrentIp();
    }
  }, [initialVotes]);

  // Set up realtime subscription (costs 1 connection)
  useEffect(() => {
    console.log(`Setting up realtime subscription for report ${surfReportId}`);

    const channel = supabase
      .channel(`votes:${surfReportId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `surf_report_id=eq.${surfReportId}`,
        },
        (_payload) => {
          console.log("Realtime vote update received:", _payload);
          queryClient.invalidateQueries({ queryKey: ["votes", surfReportId] });
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status:`, status);
      });

    return () => {
      console.log(
        `Cleaning up realtime subscription for report ${surfReportId}`
      );
      supabase.removeChannel(channel);
    };
  }, [surfReportId, queryClient]);

  // Function to cast or update a vote
  const castVote = async (type: "up" | "down") => {
    console.log(`Attempting to cast ${type} vote for report ${surfReportId}`);

    const { data: ipData, error: ipError } =
      await supabase.rpc("get_client_ip");

    if (ipError) {
      console.error("Error getting IP:", ipError);
      throw ipError;
    }

    const clientIp = ipData as string;

    // Always replace the existing vote with the new vote
    console.log("Upserting vote");
    // First, delete any existing vote from this IP for this surf report
    await supabase
      .from("votes")
      .delete()
      .eq("surf_report_id", surfReportId)
      .eq("ip_address", clientIp);

    // Then insert the new vote
    const { error } = await supabase.from("votes").insert({
      surf_report_id: surfReportId,
      vote_type: type,
      ip_address: clientIp,
    });

    if (error) {
      console.error("Error inserting vote:", error);
      throw error;
    }
  };

  return {
    voteCounts,
    castVote,
    userVote: voteCounts.userVote,
  };
}
