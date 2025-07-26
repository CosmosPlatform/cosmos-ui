import { ApiResult, sendRequest } from "@/lib/api/cosmosServerClient";

export type CreateTeamRequest = {
  name: string;
  description: string;
};

export type CreateTeamResponse = {
  Team: {
    name: string;
    description: string;
  };
};

export async function createTeam(
  request: CreateTeamRequest,
): Promise<ApiResult<CreateTeamResponse>> {
  return sendRequest<CreateTeamRequest, CreateTeamResponse>(
    "POST",
    "/teams",
    request,
  );
}

// -----------------------------------------------------------------

export type GetTeamsResponse = {
  teams: Array<{
    name: string;
    description: string;
  }>;
};

export async function getTeams(): Promise<ApiResult<GetTeamsResponse>> {
  return sendRequest<never, GetTeamsResponse>("GET", "/teams");
}

// -----------------------------------------------------------------

export async function deleteTeam(teamName: string): Promise<ApiResult<null>> {
  return sendRequest<never, null>("DELETE", `/teams`, null, { name: teamName });
}
