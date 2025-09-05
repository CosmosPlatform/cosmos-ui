import { ApiResult, sendRequestWithAuth } from "@/lib/api/cosmosServerClient";

export async function updateApplicationMonitoring(
  application: string,
): Promise<ApiResult<null>> {
  return sendRequestWithAuth<never, null>(
    "POST",
    `/monitoring/update/${application}`,
  );
}

// -----------------------------------------------------------------

export type GetApplicationInteractionsResponse = {
  mainApplication: ApplicationInformation;
  applicationsToProvide: ApplicationInformation[];
  applicationsToConsume: ApplicationInformation[];
  dependencies: ApplicationDependency[];
};

type ApplicationInformation = {
  name: string;
  team: string;
};

type ApplicationDependency = {
  consumer: string;
  provider: string;
  reasons?: string[];
  endpoints: Endpoints;
};

type Endpoints = Record<string, EndpointMethods>;

type EndpointMethods = Record<string, EndpointDetails>;

type EndpointDetails = {
  reasons?: string[];
};

export async function getApplicationInteractions(
  application: string,
): Promise<ApiResult<GetApplicationInteractionsResponse>> {
  return sendRequestWithAuth<never, GetApplicationInteractionsResponse>(
    "GET",
    `/monitoring/interactions/${application}`,
  );
}
