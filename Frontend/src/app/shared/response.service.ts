import { Response } from "../models/response.model";
import { Subject } from 'rxjs'
/* Build a service class that can locally store message data */
export class ResponseService {
  /* Instantiate responses*/
  private responses: Response[] = [];

  private responseSub: Subject<string[]> = new Subject<string[]>();
  public responseVals = this.responseSub.asObservable();

  private numResponses: number = 0;

/* Create functions that allow the ability to get the messages
 * and add messages to the array*/
  public getResponses(): Response[] {
    return this.responses;
  }
  public setResponses( received: string) {
    let newResponse = { received: received };
    this.responses.splice(this.responses.length, 0, newResponse);

  }
  public getNumResponses(): number {
    return this.numResponses;
  }
  public setNumResponses(val: number) {
    if (val == 0) {
      this.numResponses = val;
    }
    else {
      this.numResponses += val;
    }
    localStorage.setItem("numResponses", JSON.stringify(val));
  }


  /* Update the response service with the machine output */
  updateResponse(response: string) {
    this.setResponses(response);
  }
}

/* Chat history service to load chat history on load */
