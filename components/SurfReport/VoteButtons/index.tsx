import { Button } from "@/components/ui/button";
import { useVotes } from "@/hooks/useVotes";

import { FaThumbsDown, FaThumbsUp } from "react-icons/fa6";
import { toast } from "sonner";

interface VoteButtonsProps {
  surfReportId: string;
}

export function VoteButtons({ surfReportId }: VoteButtonsProps) {
  const { voteCounts, castVote, userVote } = useVotes(surfReportId);

  const handleVote = async (type: "up" | "down") => {
    if (type === userVote) {
      toast.error("You already voted for this report!");
      return;
    }

    try {
      await castVote(type);
      toast(`Vote ${type === "up" ? "up" : "down"} recorded!`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("up")}
        className="flex items-center gap-2"
      >
        <FaThumbsUp />
        <span>{voteCounts.upvotes}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("down")}
        className="flex items-center gap-2"
      >
        <FaThumbsDown />
        <span>{voteCounts.downvotes}</span>
      </Button>
    </div>
  );
}
