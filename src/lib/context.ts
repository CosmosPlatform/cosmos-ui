type User = {
  username: string;
  email: string;
  role: string;
};

export function GetUser(): User | null {
  const user = localStorage.getItem("user");
  if (user) {
    return JSON.parse(user) as User;
  }
  return null;
}

export function GetToken(): string | null {
  return localStorage.getItem("token");
}
