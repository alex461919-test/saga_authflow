export interface Credential {
  username: string;
  password: string;
}
export interface Profile {
  id: string;
  username: string;
  name: string;
  email: string | null;
  email_verified_at: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string | null;
}

export enum AuthStatus {
  LoggedOut = 'LoggedOut',
  LoggedIn = 'LoggedIn',
  Error = 'Error',
}
export interface AuthState {
  profile: Profile | null;
  token: string | null;
  error: string | null;
  status: AuthStatus;
}
export type ProfileWithToken = Profile & { token: string };
