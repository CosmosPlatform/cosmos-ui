import { ApiResult, sendRequestWithAuth } from "@/lib/api/cosmosServerClient";
import type { Application } from "../applications/applications";

export type CreateGroupRequest = {
  name: string;
  description: string;
  members: string[];
};

export async function createGroup(
  request: CreateGroupRequest,
): Promise<ApiResult<null>> {
  return sendRequestWithAuth<CreateGroupRequest, null>(
    "POST",
    "/groups",
    request,
  );
}

// -----------------------------------------------------------------

export type GroupReduced = {
  name: string;
  description: string;
};

export type GetGroupsResponse = {
  groups: GroupReduced[];
};

export async function getGroups(): Promise<ApiResult<GetGroupsResponse>> {
  return sendRequestWithAuth<never, GetGroupsResponse>("GET", "/groups");
}

// -----------------------------------------------------------------

export type Group = {
  name: string;
  description: string;
  members: Application[];
};

export type GetGroupResponse = {
  group: Group;
};

export async function getGroup(
  name: string,
): Promise<ApiResult<GetGroupResponse>> {
  return sendRequestWithAuth<never, GetGroupResponse>("GET", `/groups/${name}`);
}

// -----------------------------------------------------------------

export async function deleteGroup(name: string): Promise<ApiResult<null>> {
  return sendRequestWithAuth<never, null>("DELETE", `/groups/${name}`);
}

// -----------------------------------------------------------------

export type UpdateGroupRequest = {
  name?: string;
  description?: string;
  members?: string[];
};

export async function updateGroup(
  groupName: string,
  request: UpdateGroupRequest,
): Promise<ApiResult<null>> {
  return sendRequestWithAuth<UpdateGroupRequest, null>(
    "PUT",
    `/groups/${groupName}`,
    request,
  );
}
