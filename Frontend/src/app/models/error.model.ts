export class Error {
  id: string;
  userName: string;
  error: string;
  status: number;

  constructor(user: string, error: string, status: number, id?: string,) {
    this.id = id;
    this.userName = user;
    this.error = error;
    this.status = status;
  }
}
