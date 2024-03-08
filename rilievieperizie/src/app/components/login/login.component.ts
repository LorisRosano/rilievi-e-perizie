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

  rosso:boolean = false;

  async btnLogin(){
    let rq = await this.server.inviaRichiesta("get", "/login" , {username: this.username, password: this.password});
    this.rosso = !rq;
    this.router.navigate(['/admin']);
  }

  
}
