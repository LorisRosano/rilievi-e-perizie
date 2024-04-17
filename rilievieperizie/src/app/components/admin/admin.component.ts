import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { ServerService } from '../../servizi/server.service';
import { FormsModule } from '@angular/forms';
import MapMouseEvent = google.maps.MapMouseEvent;
import { MapMarker } from '@angular/google-maps';

@Component({
  selector: 'AdminComponent',
  standalone: true,
  imports: [GoogleMapsModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  title = 'Admin'

  markers: any[];
  markerTitle: any;

  public animazioni =
    {
      apri: {
        listaUtente: false,
        aggiungiUtente: false,
        listaPerizie: false,
      },
      chiudi: {
        listaUtente: false,
        aggiungiUtente: false,
        listaPerizie: false,
      }
    }

  

  username: string = "";
  email: string = "";
  nome: string = "";
  cognome: string = "";
  sesso: string = "";
  passwordGenerica: any = "password";

  listaUtenti: any;
  listaPerizie: any;

  ausUtente:any;

  lblAggiungiUtente: string = "";
  coloreUtenteAggiunto: boolean = false;
  coloreUtenteNONAggiunto: boolean = false;

  divAggiungiPerizia:boolean = false;

  visualizzaDivInfoMarker:boolean = false;
  chiudiInfoMarker:boolean = false;
  togliOpacity:boolean = false;

  btnAggiungiPerizia:boolean = false;

  ngOnInit(){
    this.caricaPerizie();
    this.caricaUtenti();
  }

  caricaPerizie(){
    let rq = this.server.inviaRichiesta("get", "/listaPerizie");
    rq!.then((data: any) => {
      this.listaPerizie = data;
      console.log(this.listaPerizie);
      this.aggiornaMarker();
    }).catch((error: any) => {
      console.log(error);
    });

   
  }

  aggiornaMarker(){
    console.log(this.listaPerizie)
    this.listaPerizie.forEach((perizia: any) => {
      this.createMarker(perizia.lat, perizia.lng);
    })
  }

  caricaUtenti(){
    let rq = this.server.inviaRichiesta("get", "/listaUtenti");
    rq!.then((data: any) => {
      this.listaUtenti = data;
      console.log(this.listaUtenti);
    }).catch((error: any) => {
      console.log(error);
    });
  }

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


  constructor(private server: ServerService, public router: Router) {
    this.markers = [{
      position: {
        lat: 44.5558363,
        lng: 7.7360397
      },
      title: 'Sede centrale'
    }];

  }

  infoMarker(event: MapMouseEvent, marker: any) {
    this.visualizzaDivInfoMarker = true;
  }

  chiudiDivInfoMarker(){
    this.visualizzaDivInfoMarker = false;
    // this.chiudiInfoMarker = true;
    // this.togliOpacity = true;
  }

  Apri(nome: string) {
    const { chiudi, apri } = this.animazioni;
    const aperti = Object.keys(apri).filter((c) => apri[c as keyof typeof apri]);
    const chiaviChiudi = Object.keys(chiudi).filter(c => c !=nome && aperti.includes(c)).filter((c) => {
      return !this.animazioni["chiudi"][c as keyof typeof chiudi];
    });

    chiudi[nome as keyof typeof chiudi] = false;

    chiaviChiudi.forEach((c) => {
      chiudi[c as keyof typeof chiudi] = true;
    })

    this.animazioni.apri[nome as keyof typeof chiudi] = true;
    console.log(1, this.animazioni);
  }

  ChiudiTutto(){
    console.log(this.animazioni)
    const { apri, chiudi } = this.animazioni;
    const aperti = Object.keys(apri).filter((c) => apri[c as keyof typeof apri]);
    Object.keys(apri).forEach((c) => apri[c as keyof typeof apri] = false)
    console.log(aperti)
    Object.keys(chiudi).filter((c) => aperti.includes(c)).forEach((c) => chiudi[c as keyof typeof apri] = true) 
  }

  apriListaUtenti() {
    this.Apri('listaUtente');
  }

  apriListaPerizie(){
    this.Apri('listaPerizie');
  }

  eliminaUtente(idUtente: any) {
    let rq = this.server.inviaRichiesta("delete", "/eliminaUtente", { idUtente: idUtente });
    rq!.then((data: any) => {
      console.log(data);
    }).catch((error: any) => {
      console.log(error);
    });
    this.listaUtenti = this.listaUtenti.filter((utente: any) => {
      return utente._id != idUtente;
    });
  }

  async aggiungiUtente() {
    let idNuovoUtente: any = await this.getNuovoID();
    console.log("nuovo id" + idNuovoUtente)
    let rq: any = this.server.inviaRichiesta("post", "/nuovoUtente", { username: this.username, password: this.passwordGenerica, email: this.email, cognome: this.cognome, nome: this.nome, sesso: this.sesso, idUtente: idNuovoUtente });
    console.log(this.username, this.passwordGenerica, this.email);
    rq.then((data: any) => {
      console.log(data);
      this.lblAggiungiUtente = "Utente aggiunto con successo";
      this.coloreUtenteAggiunto = true;
      this.coloreUtenteNONAggiunto = false;
    }).catch((error: any) => {
      console.log(error);
      this.lblAggiungiUtente = "Errore durante l'aggiunta dell'utente";
      this.coloreUtenteNONAggiunto = true;
      this.coloreUtenteAggiunto = false;
    });

  }

  getNuovoID() {
    return new Promise((resolve, reject) => {
      let id: any;
      let aus: any = this.server.inviaRichiesta("get", "/getUtenti");
      aus.then((data: any) => {
        console.log("Data lenght" + data.length)
        id = data.length;
        resolve(id);
      }).catch((error: any) => {
        reject(error);
      });

    });
  }

  stampaDataOra(s:any){
    let [dataPerizia, ora] = s.split("T");
    ora = ora.split(":")[0] + ":" + ora.split(":")[1];
    return [dataPerizia, ora];
  }

  aggiungiPerizia(event: MapMouseEvent){

    console.log(event.latLng!.toJSON());

    let lat = event.latLng!.toJSON().lat;
    let lng = event.latLng!.toJSON().lng;

    this.createMarker(lat, lng);
    
    

    
  }

  createMarker(lat:any, lng:any){
    this.markers.push({
      position: {
        lat: lat,
        lng: lng
      },
      title: this.markerTitle
    });

  }  
}
