import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "Cornerstone",
    short_name: "Cornerstone",
    description: "Family construction tracker for expenses, tasks, contacts, and notes.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4ecdd",
    theme_color: "#16362d",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  });
}
