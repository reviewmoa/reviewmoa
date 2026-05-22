import "server-only";

import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

const websocketTransport = WebSocket as unknown as typeof globalThis.WebSocket;

export function createSupabaseServiceClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    realtime: {
      transport: websocketTransport
    }
  });
}
