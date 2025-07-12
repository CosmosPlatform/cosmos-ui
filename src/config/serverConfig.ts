import { z } from "zod";

const serverConfigSchema = z.object({
  serverUrl: z.string().url(),
});

export const serverConfig = serverConfigSchema.parse({
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL,
});
