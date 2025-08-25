import { ApiResult, sendRequestWithAuth } from "@/lib/api/cosmosServerClient";

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
  return sendRequestWithAuth<CreateTeamRequest, CreateTeamResponse>(
    "POST",
    "/teams",
    request,
  );
}

// -----------------------------------------------------------------

export type GetTeamResponse = {
  team: {
    name: string;
    description: string;
  };
};

export async function getTeam(
  teamName: string,
): Promise<ApiResult<GetTeamResponse>> {
  return sendRequestWithAuth<never, GetTeamResponse>(
    "GET",
    `/teams/${teamName}`,
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
  return sendRequestWithAuth<never, GetTeamsResponse>("GET", "/teams");
}

// -----------------------------------------------------------------

export async function deleteTeam(teamName: string): Promise<ApiResult<null>> {
  return sendRequestWithAuth<never, null>("DELETE", `/teams/${teamName}`);
}

// -----------------------------------------------------------------

export type AddTeamMemberRequest = {
  email: string;
};

export async function addTeamMember(
  teamName: string,
  request: AddTeamMemberRequest,
): Promise<ApiResult<null>> {
  return sendRequestWithAuth<AddTeamMemberRequest, null>(
    "POST",
    `/teams/${teamName}/members`,
    request,
  );
}

// -----------------------------------------------------------------

export async function removeTeamMember(
  teamName: string,
  email: string,
): Promise<ApiResult<null>> {
  return sendRequestWithAuth<never, null>(
    "DELETE",
    `/teams/${teamName}/members`,
    null,
    { email },
  );
}
