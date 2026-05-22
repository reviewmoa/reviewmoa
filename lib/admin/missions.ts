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
  github_owner: string;
  github_repo: string;
  pr_base_url: string;
  is_active: boolean;
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
    githubOwner: row.github_owner,
    githubRepo: row.github_repo,
    prBaseUrl: row.pr_base_url,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listAdminMissions() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("missions")
    .select("id, slug, name, github_owner, github_repo, pr_base_url, is_active, created_at, updated_at")
    .order("created_at", { ascending: false })
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
      github_owner: input.githubOwner,
      github_repo: input.githubRepo,
      pr_base_url: input.prBaseUrl,
      is_active: input.isActive ?? true
    })
    .select("id, slug, name, github_owner, github_repo, pr_base_url, is_active, created_at, updated_at")
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
    ...(input.githubOwner !== undefined ? { github_owner: input.githubOwner } : {}),
    ...(input.githubRepo !== undefined ? { github_repo: input.githubRepo } : {}),
    ...(input.prBaseUrl !== undefined ? { pr_base_url: input.prBaseUrl } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase
    .from("missions")
    .update(updatePayload)
    .eq("id", missionId)
    .select("id, slug, name, github_owner, github_repo, pr_base_url, is_active, created_at, updated_at")
    .maybeSingle<MissionRow>();

  if (error) {
    throw error;
  }

  return data ? mapMission(data) : null;
}
