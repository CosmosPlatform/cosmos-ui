export function GetToken(): string | null {
  return localStorage.getItem("token");
}
