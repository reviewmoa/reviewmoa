import "server-only";

import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const createMissionSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use kebab-case slug"),
  name: z.string().min(1).max(120),
  githubOwner: z.string().min(1).max(120),
  githubRepo: z.string().min(1).max(160),
  prBaseUrl: z.string().url(),
  isActive: z.boolean().optional()
});

export const updateMissionSchema = createMissionSchema
  .omit({
    slug: true
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });

type MissionRow = {
  id: string;
  slug: string;
  name: string;
  owner: string;
  repo: string;
  pr_base_url: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AdminMission = {
  id: string;
  slug: string;
  name: string;
  githubOwner: string;
  githubRepo: string;
  prBaseUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function mapMission(row: MissionRow): AdminMission {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    githubOwner: row.owner,
    githubRepo: row.repo,
    prBaseUrl: row.pr_base_url,
    isActive: row.status === "active",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listAdminMissions() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("missions")
    .select("id, slug, name, owner, repo, pr_base_url, status, created_at, updated_at")
    .order("display_order", { ascending: true })
    .returns<MissionRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapMission);
}

export async function createAdminMission(input: z.infer<typeof createMissionSchema>) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("missions")
    .insert({
      slug: input.slug,
      name: input.name,
      owner: input.githubOwner,
      repo: input.githubRepo,
      pr_base_url: input.prBaseUrl,
      status: input.isActive === false ? "inactive" : "active"
    })
    .select("id, slug, name, owner, repo, pr_base_url, status, created_at, updated_at")
    .single<MissionRow>();

  if (error) {
    throw error;
  }

  return mapMission(data);
}

export async function updateAdminMission(
  missionId: string,
  input: z.infer<typeof updateMissionSchema>
) {
  const supabase = createSupabaseServiceClient();
  const updatePayload = {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.githubOwner !== undefined ? { owner: input.githubOwner } : {}),
    ...(input.githubRepo !== undefined ? { repo: input.githubRepo } : {}),
    ...(input.prBaseUrl !== undefined ? { pr_base_url: input.prBaseUrl } : {}),
    ...(input.isActive !== undefined ? { status: input.isActive ? "active" : "inactive" } : {}),
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase
    .from("missions")
    .update(updatePayload)
    .eq("id", missionId)
    .select("id, slug, name, owner, repo, pr_base_url, status, created_at, updated_at")
    .maybeSingle<MissionRow>();

  if (error) {
    throw error;
  }

  return data ? mapMission(data) : null;
}
