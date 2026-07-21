import type { Metadata } from "next";

/** Shared by both root layouts, which Next.js requires to declare metadata
 *  independently. Keeping one object here stops the two from drifting. */
export const SITE_METADATA: Metadata = {
  title: "Divinity Bank",
  description: "Secure financial management for Minecraft servers",
  keywords: ["banking", "minecraft", "finance", "transactions"],
  authors: [{ name: "Divinity Bank Team" }],
};
