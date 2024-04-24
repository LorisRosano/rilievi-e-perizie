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

  public animazioni =
    {
      apri: {
        listaUtente: false,
        aggiungiUtente: false,
        cercaUtente: false,
        listaPerizie: false,
      },
      chiudi: {
        listaUtente: false,
        aggiungiUtente: false,
        cercaUtente: false,
        listaPerizie: false,
      }
    }

  sedeCentrale = {
    "lat": 44.5558363,
    "lng": 7.7360397
  }

  markers: any[];
  markerTitle: any;
  indirizzo: any;

  username: string = "";
  email: string = "";
  nome: string = "";
  cognome: string = "";
  sesso: string = "";
  passwordGenerica: any = "password";

  userRicerca: string = "";
  utenteCercato:any;
  perizieUtenteCercato:any;

  tableNascosta:boolean = true;
  nascondiPerizie:boolean = true;

  listaUtenti: any;
  listaPerizie: any;

  idPeriziaCorrente:number = 0;
  latPeriziaCorrente:any;
  lngPeriziaCorrente:any;
  dataOraPerizia:any;
  txtFile:any;

  ausUtente:any;

  lblAggiungiUtente: string = "";
  coloreUtenteAggiunto: boolean = false;
  coloreUtenteNONAggiunto: boolean = false;

  divAggiungiPerizia:boolean = false;

  visualizzaDivInfoMarker:boolean = false;
  chiudiInfoMarker:boolean = false;
  togliOpacity:boolean = false;

  btnAggiungiPerizia:boolean = false;
  visualizzaDivInfoPerizia:boolean = false;

  titoloPerizia:any;
  idOperatorePerizia:any;
  descPerizia:any;

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
    this.listaPerizie.forEach((perizia: any) => {
      this.createMarker(perizia.lat, perizia.lng, perizia.Title);
      this.idPeriziaCorrente++;
    })
    this.idPeriziaCorrente++;
  }

  caricaUtenti(){
    let rq = this.server.inviaRichiesta("get", "/listaUtenti");
    rq!.then((data: any) => {
      this.listaUtenti = data;
    }).catch((error: any) => {
      console.log(error);
    });
  }

  center: google.maps.LatLngLiteral =
    {
      lat: this.sedeCentrale.lat,
      lng: this.sedeCentrale.lng
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
    this.pulisciRicerca();
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

  apriCercaUtente(){
    this.Apri('cercaUtente');
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

  eliminaPerizia(idPerizia: any) {
    let titoloCorrente = this.getTitoloPeriziaByID(idPerizia);
    console.log(titoloCorrente);
    let rq = this.server.inviaRichiesta("delete", "/eliminaPerizia", { idPerizia: idPerizia });
    rq!.then((data: any) => {
      console.log(data);
    }).catch((error: any) => {
      console.log(error);
    });
    this.listaPerizie = this.listaPerizie.filter((perizia: any) => {
      return perizia._id != idPerizia;
    });
    this.markers = this.markers.filter((marker: any) => {
      return marker.title != titoloCorrente;
    });
  }

  getTitoloPeriziaByID(idPerizia: any) {
    let perizia = this.listaPerizie.filter((perizia: any) => {
      return perizia._id != idPerizia;
    });
    return perizia[0].Title;
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

  cercaUtente(){
    this.tableNascosta = false;
    this.nascondiPerizie = false;
    let rq = this.server.inviaRichiesta("get", "/cercaUtente", {username: this.userRicerca});
    rq!.then((data: any) => {
      this.utenteCercato = data;
      this.filtraPerizie(this.utenteCercato.id);
    }).catch((error: any) => {
      console.log(error);
    });
  }

  filtraPerizie(idUtente:any){
    let rq = this.server.inviaRichiesta("get", "/perizieById", {idUtente: idUtente});
    rq!.then((data: any) => {
      this.perizieUtenteCercato = data;
      console.log(this.perizieUtenteCercato);
    }).catch((error: any) => {
      console.log(error);
    });
  }

  pulisciRicerca(){
    this.tableNascosta = true;
    this.utenteCercato = "";
    this.perizieUtenteCercato = "";
    this.nascondiPerizie = true;
  }

  editUtente(){

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

  indirizzoPerizia(lat:any, lng:any){
    // const request: google.maps.DirectionsRequest = {
    //   destination: { lat: lat, lng: lng },
    //   origin: { lat: this.sedeCentrale?.lat!, lng: this.sedeCentrale?.lng! },
    //   travelMode: google.maps.TravelMode.DRIVING,
    // };

    // this.indirizzo = this.mapDirectionsService.route(request).pipe(
    //   map((response) => {
    //     this.perizieService.markerPositions = []

    //     this.startAddress = response.result?.routes[0].legs[0].start_address!;
    //     this.endAddress = response.result?.routes[0].legs[0].end_address!;
    //     this.distance = response.result?.routes[0].legs[0].distance!.text!;
    //     this.duration = response.result?.routes[0].legs[0].duration!.text!;

    //     return response.result;
    //   }),
    // );
  }

  aggiungiPerizia(event: MapMouseEvent){

    let lat = event.latLng!.toJSON().lat - 0.00059;
    let lng = event.latLng!.toJSON().lng + 0.00025;

    this.lngPeriziaCorrente = lng;
    this.latPeriziaCorrente = lat;

    this.aggiungiInfoPerizia();
  }

  aggiungiInfoPerizia(){
    this.visualizzaDivInfoPerizia = true;
  }

  inviaInfo(){
    this.createMarker(this.lngPeriziaCorrente, this.latPeriziaCorrente, this.titoloPerizia);
    
    let nuovaPerizia = {
      idPerizia: this.idPeriziaCorrente.toString(),
      lat: this.latPeriziaCorrente.toString(),
      lng: this.lngPeriziaCorrente.toString(),
      titolo: this.titoloPerizia,
      idOperatore: this.idOperatorePerizia,
      desc: this.descPerizia,
      dataOra: this.dataOraPerizia.toString()
    }

    console.log(nuovaPerizia)
    console.log(this.listaPerizie)

    this.visualizzaDivInfoPerizia = false;
    this.btnAggiungiPerizia = false;


    let rq = this.server.inviaRichiesta("post", "/aggiungiPerizia", {perizia: nuovaPerizia});
    rq!.then((data: any) => {
      console.log(data);
    }).catch((error: any) => {
      console.log(error);
    });
  }

  async aggiungiImmaginiCloudinary(event:any){
    const selectedFile: File = event.target.files[0];
    
    this.uploadImageOnCloudinary(selectedFile);
		
  }

  uploadImageOnCloudinary(file: File){
    // Configura i parametri del caricamento su Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_upload_preset'); // Imposta il tuo upload preset

    // Effettua la richiesta di caricamento a Cloudinary
    // this.server.uploadImage(file).subscribe((imageUrl: string) => {
    //   // Ricevi l'URL dell'immagine dal server e inseriscilo nel database MongoDB
    //   console.log('URL dell\'immagine su Cloudinary:', imageUrl);
    //   // Ora puoi eseguire l'operazione per salvare l'URL nel database MongoDB qui
    // });
  }

  chiudiDivInfoPerizia(){
    this.visualizzaDivInfoPerizia = false;
  }

  createMarker(lat:any, lng:any, title:any){
    console.log(lat, lng);
    
    this.markers.push({
      position: {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      },
      title: title
    });

    console.log(this.markers);

  }  
}
