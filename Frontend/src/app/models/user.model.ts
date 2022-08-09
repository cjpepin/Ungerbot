export class User {
  id: string;
  userName: string;
  password: string;
  userEmail: string;
  refreshToken: string;
  refreshTokenExpiryTime: Date;
  profilePicture: string;
  theme: number;
  customTheme: string;

  constructor(username?: string, pw?: string, email="", pfp?:string, refreshToken?: string, theme?: number, customTheme?: string) {
    this.id = "";
    this.userName = username;
    this.password = pw;
    this.userEmail = email;
    this.refreshToken = refreshToken || "default";
    this.refreshTokenExpiryTime = new Date();
    this.profilePicture = pfp;
    this.theme = theme;
    this.customTheme = customTheme;
  }
}
