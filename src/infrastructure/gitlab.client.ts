import { Env } from "../config/env";
import fetch from "node-fetch";

import { GitLabMRChange } from "../types/gitlab.types";

const headers = {
  "Private-Token": Env.GITLAB_TOKEN,
  "Content-Type": "application/json",
};

export async function getMergeRequestChanges(
  mrId: string
): Promise<{ changes: any[]; sourceBranch: string }> {
  const url = `${Env.GITLAB_API_URL}/projects/${encodeURIComponent(
    Env.GITLAB_PROJECT_ID
  )}/merge_requests/${mrId}/changes`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(
      `GitLab API error: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as {
    changes: GitLabMRChange[];
    source_branch: string;
  };
  return {
    changes: data.changes,
    sourceBranch: data.source_branch,
  };
}

export async function getMergeRequestMeta(
  mrId: string
): Promise<{ sourceBranch: string }> {
  const url = `${Env.GITLAB_API_URL}/projects/${encodeURIComponent(
    Env.GITLAB_PROJECT_ID
  )}/merge_requests/${mrId}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(
      `GitLab API error (meta): ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as { source_branch: string };
  return {
    sourceBranch: data.source_branch,
  };
}

export async function updateMergeRequestDescription(
  mrId: string,
  description: string
): Promise<void> {
  const url = `${Env.GITLAB_API_URL}/projects/${encodeURIComponent(
    Env.GITLAB_PROJECT_ID
  )}/merge_requests/${mrId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update MR description: ${response.status} - ${errorText}`
    );
  }
}
