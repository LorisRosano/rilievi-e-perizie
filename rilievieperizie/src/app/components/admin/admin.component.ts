import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { ServerService } from '../../servizi/server.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'AdminComponent',
  standalone: true,
  imports: [GoogleMapsModule,FormsModule,RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  title = 'Admin'

  markers:any; 
  markerTitle:any;
  
  animationAggiungiUtente:boolean = false;
  animationCloseAggiungiUtente:boolean = false;

  username:string = "";
  email:string = "";
  passwordGenerica:any = "password";

  center: google.maps.LatLngLiteral = 
  {
    lat: 44.5558363,
    lng: 7.7360397
  };

  zoom = 16;
  vertices: google.maps.LatLngLiteral[] = [{
    lat: 44.5558363,
    lng: 7.7360397
  }];

  constructor(private server: ServerService,public router : Router) {
    this.markers = [{
      position: {
        lat: 44.5558363,
        lng: 7.7360397
      },
      title: 'Sede centrale'
    }];
  
  }

  infoMarker(){

  }

  apriAggiuntaUtente(){
    this.animationAggiungiUtente = true;
  }

  chiudiAggiuntaUtente(){
    this.animationCloseAggiungiUtente = true;

    setTimeout(() => {
      this.animationAggiungiUtente = false;
      this.animationCloseAggiungiUtente = false;
    }, 1000);
  }

  aggiungiUtente(){
    let rq:any = this.server.inviaRichiesta("post", "/nuovoUtente", {username: this.username, password: this.passwordGenerica, email: this.email});
    console.log(this.username, this.passwordGenerica, this.email);
    rq.then((data:any) => {
      console.log(data);
    }).catch((error:any) => {
      console.log(error);
    });
  }
}
