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

  animationListaUtenti:boolean = false;
  animationCloseListaUtenti:boolean = false;

  username:string = "";
  email:string = "";
  nome:string = "";
  cognome:string = "";
  sesso:string = "";
  passwordGenerica:any = "password";

  listaUtenti:any;
  lblAggiungiUtente:string = "";
  coloreUtenteAggiunto:boolean = false;
  coloreUtenteNONAggiunto:boolean = false;

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
    if(this.animationAggiungiUtente == false){
      this.animationAggiungiUtente = true;
    }
    if(this.animationListaUtenti == true){
      this.animationCloseListaUtenti = true;
      this.animationAggiungiUtente = true;
      this.animationCloseAggiungiUtente = false;
    }
  }

  chiudiAggiuntaUtente(){
    this.animationCloseAggiungiUtente = true;

    setTimeout(() => {
      this.animationAggiungiUtente = false;
      this.animationCloseAggiungiUtente = false;
      this.animationCloseListaUtenti = false;

    }, 1000);
  }

  apriListaUtenti(){
    if(this.animationListaUtenti == false){
      this.animationListaUtenti = true;
    }
    
    if(this.animationAggiungiUtente == true){
      this.animationCloseAggiungiUtente = true;
      this.animationListaUtenti = true;
      this.animationCloseListaUtenti = false;
    }
    
    let rq = this.server.inviaRichiesta("get", "/listaUtenti");
    rq!.then((data:any) => {
      console.log(data);
      this.listaUtenti = data;
    }).catch((error:any) => {
      console.log(error);
    });
  }
  chiudiListaUtenti(){
    this.animationCloseListaUtenti = true;

    setTimeout(() => {
      this.animationListaUtenti = false;
      this.animationCloseListaUtenti = false;
      this.animationCloseAggiungiUtente = false;
    }, 1000);
  }

  eliminaUtente(idUtente:any){
    let rq = this.server.inviaRichiesta("delete", "/eliminaUtente", {idUtente: idUtente});
    rq!.then((data:any) => {
      console.log(data);
    }).catch((error:any) => {
      console.log(error);
    });
    this.listaUtenti = this.listaUtenti.filter((utente:any) => {
      return utente._id != idUtente;
    });
  }

  aggiungiUtente(){
    let rq:any = this.server.inviaRichiesta("post", "/nuovoUtente", {username: this.username, password: this.passwordGenerica, email: this.email, cognome: this.cognome, nome: this.nome, sesso: this.sesso});
    console.log(this.username, this.passwordGenerica, this.email);
    rq.then((data:any) => {
      console.log(data);
      this.lblAggiungiUtente = "Utente aggiunto con successo";
      this.coloreUtenteAggiunto = true;
      this.coloreUtenteNONAggiunto = false;
    }).catch((error:any) => {
      console.log(error);
      this.lblAggiungiUtente = "Errore durante l'aggiunta dell'utente";
      this.coloreUtenteNONAggiunto = true;
      this.coloreUtenteAggiunto = false;
    });
    
  }
}
