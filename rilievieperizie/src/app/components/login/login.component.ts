import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServerService } from '../../servizi/server.service';
import { AdminComponent } from '../admin/admin.component';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'LoginComponent',
  standalone: true,
  imports: [FormsModule,AdminComponent, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private server: ServerService, public router : Router) {}

  username:string = "";
  password:string = "";

  nuovaPassword:string = "";
  confermaPassword:string = "";

  divConfermaPassword:boolean = false;
  rosso:boolean = false;
  passwordOnChange:boolean = false;

  async btnLogin(){
    if(this.username == "admin"){
      let rq = await this.server.inviaRichiesta("get", "/login" , {username: this.username, password: this.password});
      this.rosso = !rq;
      if(rq){
        this.router.navigate(['/admin']);
      }
    }
    else{
      if(this.password == "password"){
        this.divConfermaPassword = true;
      }
      else{
        let rq = await this.server.inviaRichiesta("get", "/login" , {username: this.username, password: this.password});
        this.rosso = !rq;
        if(rq){
          this.router.navigate(['/utente']);
        }
      }
    }
    
  }

  btnAccedi(){
    if(this.nuovaPassword == this.confermaPassword){
      let rq = this.server.inviaRichiesta("post", "/primoLogin", {username: this.username, password: this.nuovaPassword});
      this.divConfermaPassword = false;
    }
  }

  controlloPassword(ausPassword:any){
    this.passwordOnChange = true;
  }

  
}
