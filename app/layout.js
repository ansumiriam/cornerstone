import "./globals.css";

export const metadata = {
  title: "Cornerstone",
  description: "Family construction tracker for expenses, tasks, contacts, and notes.",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
