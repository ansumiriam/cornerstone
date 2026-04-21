"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    const payload = {
      title: "Cornerstone",
      text: "Track family construction expenses, tasks, contacts, and notes.",
      url
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
      } catch {
        return;
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button variant="secondary" onClick={handleShare}>
      <Share2 className="size-4" />
      {copied ? "Link Copied" : "Share App"}
    </Button>
  );
}
