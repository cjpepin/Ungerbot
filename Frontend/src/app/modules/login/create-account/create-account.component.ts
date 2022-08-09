import { Component, OnInit, NgZone } from '@angular/core';
import { UserApiService } from '../../../shared/apis/user-api.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})


export class CreateAccountComponent implements OnInit {

  //Call services
  constructor(
    private userApiService: UserApiService,
    private router: Router,
    private ngZone: NgZone  ) { }

  //Keep track of error message
  public error: string = "";

  ngOnInit(): void {
  }
  //Create account by verifying the input follows the desired rules
  public createAccount(email: string, username: string, password1: string, password2: string) {
    
    this.checkEmail(email);
    if (this.error != "")
      return;
    this.checkUsername(username);
    if (this.error != "")
      return;
    this.checkPasswords(password1, password2);
    if (this.error != "")
      return;
    
    if (this.error == "") {
      this.userApiService.createAccount(email, username, password1).subscribe(data => {
        if (data === null) {
          alert("Your account has been created for " + username + "!\n You're going to be redirected to the login page to log in!");
          this.ngZone.run(() => this.router.navigate(['/']));
        } else 
          alert("Hmm... something weird happened on our end, please try again in a bit.")
      });
    }
    

    
  }

  //Simple email check for now, would want to send verification
  //email for true security
  private checkEmail(email: string): void {
    const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
    if (regex.test(email))
      this.error = "";
    else {
      this.error = "Please put in a valid email address";
    }
  }

  //Check for username to be:
  //1. No starting or ending with . or _
  //2. No usernames like test._test, test..test, test_.test
  //3. 4-20 characters long
  //4. a-z, A-Z, 0-9 characters allowed
  private checkUsername(username: string): void {
    //^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$
    //Between 4 and 20 characters
    const regex1 = /^[\w\d#?!@$%^&*-]{4,20}$/

    if (username === "") {
      this.error = "Must put in a username."
      return;
    }
    if (username === "Guest") {
      this.error = "Username cannot be Guest";
      return;
    }
    if (regex1.test(username))
      this.error = "";
    else {
      this.error = "Username must be between 4 and 20 characters."
      return;
    }
    
  }

  //Check that passwords match
  //Check that passwords have:
  //1. 8- characters
  //2. at least one uppercase and lowercase letter
  //3. at leeast one number and special character
  private checkPasswords(password1: string, password2: string): void {
    // 8- characters
    const regex1 = /^[\w\d#?!@$%^&*-]{8,}$/
    // at least one uppercase and lowercase letter
    const regex2 = /^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$!%*#?&]{8,}$/
    // at least one number and special character
    const regex3 = /^(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    /// no more than four repeating characters
    const regex4 = /(.)\1{4,}/

    if (password1 === password2)
      this.error = "";
    else {
      this.error = "Passwords do not match.";
      return;
    }
    if (regex1.test(password1))
      this.error = ""
    else {
      this.error = "Password must contain at least 8 characters";
      return;
    }
    if (regex2.test(password1))
      this.error = ""
    else {
      this.error = "Password must contain at least 1 uppercase and 1 lowercase letter.";
      return;
    }
    if (regex3.test(password1))
      this.error = "";
    else {
      this.error = "Password must contain at least 1 number and 1 special character.";
      return;
    }
    if (!regex4.test(password1))
      this.error = "";
    else {
      this.error = "Password cannot contain 4 or more repeated character.";
      return;
    }
  }

  

}
