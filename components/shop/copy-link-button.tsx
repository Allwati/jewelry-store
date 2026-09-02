"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyLinkButtonProps {
  url: string;
  label: string;
}

export function CopyLinkButton({ url, label }: CopyLinkButtonProps) {
  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Direct order link copied!");
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="flex-shrink-0"
      onClick={handleCopy}
    >
      <Share2 className="h-3.5 w-3.5 me-1" />
      {label}
    </Button>
  );
}
