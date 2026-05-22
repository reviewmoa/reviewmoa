import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import WebSocket from "ws";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

const websocketTransport = WebSocket as unknown as typeof globalThis.WebSocket;

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    realtime: {
      transport: websocketTransport
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Route handlers can.
        }
      }
    }
  });
}
