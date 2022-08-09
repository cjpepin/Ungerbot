/* Constructing the message var type */
export class Message {
  public sent: string;
  constructor(sent: string) {
    this.sent = sent;
  }
}

export class AuthResponse {
  public accessToken: string;
  public refreshToken: string;
}
