const USER_KEY = "wtw_user_id";
const EMAIL_KEY = "wtw_email";

export function getUserId(): string | null {
  return localStorage.getItem(USER_KEY);
}

export function setUserId(id: string): void {
  localStorage.setItem(USER_KEY, id);
}

export function getEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}

export function setEmail(email: string): void {
  localStorage.setItem(EMAIL_KEY, email);
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
