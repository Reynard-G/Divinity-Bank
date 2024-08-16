export interface AuthUser {
  id: number;
  uuid: string;
  username: string;
  role: string;
}

export interface NonSensitiveUser {
  id: number;
  account_type: string;
  minecraft_uuid: string;
  minecraft_username: string;
  discord_username: string;
  created_at: string;
  updated_at: string;
}
