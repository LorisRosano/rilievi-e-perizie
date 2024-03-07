import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServerService } from '../../servizi/server.service';

@Component({
  selector: 'LoginComponent',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private server: ServerService) {}

  username:string = "";
  password:string = "";

  rosso:boolean = false;

  async btnLogin(){
    let rq = await this.server.inviaRichiesta("get", "/login" , {username: this.username, password: this.password});
    console.log(rq);
    if(rq)
      alert("DIO PORCO! Sei loggato!");
    else
      this.rosso = true;
     
  }
}
