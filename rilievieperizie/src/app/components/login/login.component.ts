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
  nCaratteri:boolean = false;
  maiuscolo:boolean = false;
  minuscolo:boolean = false;
  numero:boolean = false;
  speciale:boolean = false;

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
    if(!this.nCaratteri && !this.maiuscolo && !this.minuscolo && !this.numero && !this.speciale && this.nuovaPassword == this.confermaPassword){
      let rq = this.server.inviaRichiesta("post", "/primoLogin", {username: this.username, password: this.nuovaPassword});
      this.divConfermaPassword = false;
    }
  }

  controlloPassword(){
    this.passwordOnChange = true;
    console.log(this.nuovaPassword)
    if(this.nuovaPassword.length >= 8){
      this.nCaratteri = false;
    }
    else{
      this.nCaratteri = true;
    }

    if(/[A-Z]/.test(this.nuovaPassword)){
      this.maiuscolo = false;
    }
    else{
      this.maiuscolo = true;
    }

    if(/[a-z]/.test(this.nuovaPassword)){
      this.minuscolo = false;
    }
    else{
      this.minuscolo = true;
    }

    if(/[0-9]/.test(this.nuovaPassword)){
      this.numero = false;
    }
    else{
      this.numero = true;
    }

    if(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(this.nuovaPassword)){
      this.speciale = false;
    }
    else{
      this.speciale = true;
    }
  }

  
}
