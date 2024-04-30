import { Component, ElementRef, ViewChild, asNativeElements, viewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { GoogleMap, GoogleMapsModule, MapGeocoder } from '@angular/google-maps';
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

  @ViewChild(GoogleMap) map!: GoogleMap;
  google:any = window.google;

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
  utenteCercato: any;
  perizieUtenteCercato: any;

  tableNascosta: boolean = true;
  nascondiPerizie: boolean = true;

  listaUtenti: any;
  listaPerizie: any;

  idPeriziaCorrente: number = 0;
  latPeriziaCorrente: any;
  lngPeriziaCorrente: any;
  dataOraPerizia: any;
  txtFile: any;

  ausUtente: any;

  lblAggiungiUtente: string = "";
  coloreUtenteAggiunto: boolean = false;
  coloreUtenteNONAggiunto: boolean = false;

  divAggiungiPerizia: boolean = false;

  visualizzaDivInfoMarker: boolean = false;
  chiudiInfoMarker: boolean = false;
  togliOpacity: boolean = false;

  btnAggiungiPerizia: boolean = false;
  visualizzaDivInfoPerizia: boolean = false;

  titoloPerizia: any;
  idOperatorePerizia: any;
  descPerizia: any;
  fotoPerizie: any = [];
  fotoPerizaCorrente:any = [];

  aspettaImmagini:boolean = false;
  visualizzaImmaginiPerizie:boolean = false;

  utenteModificato:any;
  nuovoNome:any;
  nuovoCognome:any;
  nuovoUsername: any;
  nuovaEmail: any;
  nuovoSesso: any;

  periziaModifica:any;
  titoloPeriziaModificata:any;
  descPeriziaModificata:any;

  codOpPeriziaVisualizzata: any;
  dataOraPeriziaVisualizzata: any;
  descPeriziaVisualizzata: any;
  latPeriziaVisualizzata: any;
  lngPeriziaVisualizzata: any;
  titlePeriziaVisualizzata: any;
  markerPeriziaVisualizzata: any;
  idPeriziaVisualizzata: any;

  edit:boolean = false;
  editP:boolean = false;

  aggiungiperiziatext: string = "Aggiungi perizia";

  divTempoStimato:any = "";
  pulisciPercorso:boolean = false;

  erroreRicercaUtente: boolean = false;
  divErroreRicerca:any = "";

  indirizzi: any = [];

  ngOnInit() {
    this.caricaPerizie();
    this.caricaUtenti();
  }

  caricaPerizie() {
    let rq = this.server.inviaRichiesta("get", "/listaPerizie");
    rq!.then((data: any) => {
      this.listaPerizie = data;
      this.aggiornaMarker();
      this.getindirizzo();
    }).catch((error: any) => {
      console.log(error);
    });
    
  }

  aggiornaMarker() {
    this.markers = [];
    this.listaPerizie.forEach((perizia: any) => {
      this.createMarker(perizia.lat, perizia.lng, perizia.Title);
      this.idPeriziaCorrente++;
    })
    this.idPeriziaCorrente++;

    this.markers.push({
      position: {
        lat: 44.5558363,
        lng: 7.7360397
      },
      title: "Sede centrale"
    });

  }

  caricaUtenti() {
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

  zoom = 12;
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

  getindirizzo() {
    this.listaPerizie.forEach((perizia: any) => {
      let geocoder = new this.google.maps.Geocoder();
      let latlng = {lat: parseFloat(perizia.lat), lng: parseFloat(perizia.lng)}
      geocoder.geocode({'location': latlng}, (results: any, status:string) => {
        if (status === 'OK') {
          if (results[0]) {
            let indirizzo = results[0].formatted_address.split(',')[0]+ ', ' + results[0].formatted_address.split(',')[1];
            this.indirizzi.push({id: perizia.idPerizia, indirizzo: indirizzo});
          } else {
            console.log('No results found');
          }
        } else {
          console.log('Geocoder failed due to: ' + status);
        }
      })
    })
    console.log(this.indirizzi);
  }

  infoMarker(event: any, marker: any) {
    if(marker.title != "Sede centrale"){
      this.visualizzaDivInfoMarker = true;
      let title = marker.title;
  
      let perizia = this.getPeriziaByTitle(title);
  
      this.titlePeriziaVisualizzata = perizia.Title;
      this.codOpPeriziaVisualizzata = perizia.codiceOperatore;
      this.dataOraPeriziaVisualizzata= this.stampaDataOra(perizia.dataOra);
      this.descPeriziaVisualizzata = perizia.descrizione;
      this.latPeriziaVisualizzata = perizia.lat;
      this.lngPeriziaVisualizzata = perizia.lng;
      this.idPeriziaVisualizzata = perizia.idPerizia;
  
      // let address = this.getAddress(perizia.lat, perizia.lng);
  
      this.markerPeriziaVisualizzata = marker;
    }
  }

  getPeriziaByTitle(title: any) {
    let perizia = this.listaPerizie.filter((perizia: any) => {
      return perizia.Title == title;
    });

    return perizia[0];


    // this.markerTitle = perizia[0].Title;
    // this.idOperatorePerizia = perizia[0].codiceOperatore;
    // this.dataOraPerizia = this.stampaDataOra(perizia[0].dataOra);
    // this.descPerizia = perizia[0].descrizione;
  }

  getAddress(lat:any, lng:any){
    const apiKey = 'AIzaSyBZKYgxbiyRE7DknUpnRP2QHCBVjvLgH7g';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    let rq = this.server.inviaRichiesta("get", url)
    rq!.then((data: any) => {
      if (data.status === 'OK' && data.results[0]) {
        const address = data.results[0].formatted_address;
        console.log('Indirizzo:', address);
        return address;
      } else {
        console.error('Impossibile trovare l\'indirizzo per le coordinate specificate.');
      }
    }).catch((error: any) => {
      console.log(error);
    });
    
      
  }

  btnPercorso(){
    
    this.visualizzaDivInfoMarker = false;
    this.visualizzaPercorso(this.markerPeriziaVisualizzata);
  }

  visualizzaPercorso(marker:any){
    
    const destination = marker.position;
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    // const sideBar: HTMLElement = document.getElementById("sidebar") as HTMLElement;

    // sideBar.innerHTML = '';

    this.map.panTo(destination);
    directionsRenderer.setMap(this.map.googleMap!);
    // directionsRenderer.setPanel(sideBar);

    const request: google.maps.DirectionsRequest = {
      origin: this.sedeCentrale,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING, // 
      provideRouteAlternatives: true
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        result!.routes.forEach((route, i) => {
          console.log(`Percorso ${i + 1}:`);
          console.log(`- Tempo stimato di percorso: ${route.legs[0].duration!.text}`);
          console.log(`- Distanza: ${route.legs[0].distance!.text}`);
          this.divTempoStimato = "Tempo stimato: " + route.legs[0].duration!.text + " - Distanza: " + route.legs[0].distance!.text;
          this.pulisciPercorso = true;
        });
      } else {
        console.error('Errore durante il calcolo del percorso:', status);
      }
    });
  }

  pulisciPercorsoFunction(){
    window.location.reload();
  }

  chiudiDivInfoMarker() {
    this.visualizzaDivInfoMarker = false;
    // this.chiudiInfoMarker = true;
    // this.togliOpacity = true;
  }

  Apri(nome: string) {
    const { chiudi, apri } = this.animazioni;
    const aperti = Object.keys(apri).filter((c) => apri[c as keyof typeof apri]);
    const chiaviChiudi = Object.keys(chiudi).filter(c => c != nome && aperti.includes(c)).filter((c) => {
      return !this.animazioni["chiudi"][c as keyof typeof chiudi];
    });

    chiudi[nome as keyof typeof chiudi] = false;

    chiaviChiudi.forEach((c) => {
      chiudi[c as keyof typeof chiudi] = true;
    })

    this.animazioni.apri[nome as keyof typeof chiudi] = true;
  }

  ChiudiTutto() {
    this.pulisciRicerca();
    const { apri, chiudi } = this.animazioni;
    const aperti = Object.keys(apri).filter((c) => apri[c as keyof typeof apri]);
    Object.keys(apri).forEach((c) => apri[c as keyof typeof apri] = false)
    Object.keys(chiudi).filter((c) => aperti.includes(c)).forEach((c) => chiudi[c as keyof typeof apri] = true)
  }

  apriListaUtenti() {
    this.Apri('listaUtente');
  }

  apriListaPerizie() {
    this.Apri('listaPerizie');
  }

  apriCercaUtente() {
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

  eliminaPerizia(titolo: any, idPerizia: any) {
    console.log(idPerizia);

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
      return marker.title != titolo;
    });

    this.idPeriziaCorrente--;
  }

  async aggiungiUtente() {
    let idNuovoUtente: any = await this.getNuovoID();
    let rq: any = this.server.inviaRichiesta("post", "/nuovoUtente", { username: this.username, password: this.passwordGenerica, email: this.email, cognome: this.cognome, nome: this.nome, sesso: this.sesso, idUtente: idNuovoUtente });
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
    this.caricaUtenti();
  }

  cercaUtente() {
    
    let rq = this.server.inviaRichiesta("get", "/cercaUtente", { username: this.userRicerca });
    rq!.then((data: any) => {
      if(data != null){
        this.tableNascosta = false;
        this.nascondiPerizie = false;
        this.utenteCercato = data;
        this.filtraPerizie(this.utenteCercato.id);
        this.erroreRicercaUtente = false;
        this.divErroreRicerca = "";
      }
      else{
        this.erroreRicercaUtente = true;
        this.divErroreRicerca = "L'utente cercato non esiste";
        console.log("Utente non trovato")
      }
      
    }).catch((error: any) => {
      console.log(error);
    });

    // this.filtraMarker(this.utenteCercato);
  }

  filtraMarker(utente: any) {
    let perizieUtente = this.listaPerizie.filter((perizia: any) => {
      return perizia.codiceOperatore == utente.id;
    });

    console.log(perizieUtente)

    // this.markers = [];
    // perizieUtente.forEach((perizia: any) => {
    //   this.createMarker(perizia.lat, perizia.lng, perizia.Title);
    // });

    // this.markers.push({
    //   position: {
    //     lat: 44.5558363,
    //     lng: 7.7360397
    //   },
    //   title: "Sede centrale"
    // });

  }

  filtraPerizie(idUtente: any) {
    let rq = this.server.inviaRichiesta("get", "/perizieById", { idUtente: idUtente });
    rq!.then((data: any) => {
      this.perizieUtenteCercato = data;
      console.log(this.perizieUtenteCercato);
    }).catch((error: any) => {
      console.log(error);
    });
  }

  pulisciRicerca() {
    this.tableNascosta = true;
    this.utenteCercato = "";
    this.perizieUtenteCercato = "";
    this.nascondiPerizie = true;
    this.userRicerca = "";
  }

  editUtente(utente: any) {
    this.edit = true;
    this.utenteModificato = utente;
    console.log(this.utenteModificato)
  }

  editPerizia(perizia:any){
    this.editP = true;
    this.periziaModifica = perizia;
    console.log(this.periziaModifica)
  }

  chiudiEditUtente(){
    this.edit = false;
  }

  chiudiEditPerizia(){
    this.editP = false;
  }

  applicaModificheUtente(){
    console.log(this.utenteModificato)
    let nome, cognome, username, email, sesso;
    if(!this.nuovoNome) {nome = this.utenteModificato.nome} else {nome = this.nuovoNome;}
    if(!this.nuovoCognome) {cognome = this.utenteModificato.cognome} else {cognome = this.nuovoCognome;}
    if(!this.nuovoUsername) {username = this.utenteModificato.username} else {username = this.nuovoUsername;}
    if(!this.nuovaEmail) {email = this.utenteModificato.email} else {email = this.nuovaEmail;}
    if(!this.nuovoSesso) {sesso = this.utenteModificato.sesso} else {sesso = this.nuovoSesso;}

    console.log(this.nuovoNome, this.nuovoCognome, this.nuovoUsername, this.nuovaEmail, this.nuovoSesso)

    let rq = this.server.inviaRichiesta("post", "/modificaUtente", {id: this.utenteModificato.id, nome: nome, cognome: cognome, username: username, email: email, sesso: sesso});
    this.caricaUtenti();
    this.edit = false;
  }

  modificaPerizia(){
    let titolo, descrizione;
    if(!this.descPeriziaModificata) {descrizione = this.periziaModifica.descrizione} else {descrizione = this.descPeriziaModificata;}
    if(!this.titoloPeriziaModificata) {titolo = this.periziaModifica.Title} else {titolo = this.titoloPeriziaModificata;}
    let rq = this.server.inviaRichiesta("post", "/modificaPerizia", {id: this.periziaModifica.idPerizia, descrizione: descrizione, titolo: titolo});
    this.caricaPerizie();
    this.editP = false;
  }

  getNuovoID() {
    return new Promise((resolve, reject) => {
      let id: any;
      let aus: any = this.server.inviaRichiesta("get", "/getUtenti");
      aus.then((data: any) => {
        id = data.length;
        resolve(id);
      }).catch((error: any) => {
        reject(error);
      });

    });
  }

  stampaDataOra(s: any) {
    let [dataPerizia, ora] = s.split("T");
    ora = ora.split(":")[0] + ":" + ora.split(":")[1];
    return [dataPerizia, ora];
  }

  aggiungiPerizia(event: MapMouseEvent) {

    let lat = event.latLng!.toJSON().lat - 0.00059;
    let lng = event.latLng!.toJSON().lng + 0.00025;

    this.createMarker(lat, lng, this.titoloPerizia);

    this.latPeriziaCorrente = lat;
    this.lngPeriziaCorrente = lng;

    this.aggiungiInfoPerizia();
  }

  aggiungiInfoPerizia() {
    this.visualizzaDivInfoPerizia = true;
  }

  inviaInfo() {
    let nuovaPerizia = {
      codiceOperatore: this.idOperatorePerizia,
      dataOra: this.dataOraPerizia.toString(),
      descrizione: this.descPerizia,
      images: this.fotoPerizie,
      idPerizia: this.idPeriziaCorrente.toString(),
      lat: this.latPeriziaCorrente.toString(),
      lng: this.lngPeriziaCorrente.toString(),
      Title: this.titoloPerizia
    }



    console.log(nuovaPerizia)
    console.log(this.listaPerizie)

    this.visualizzaDivInfoPerizia = false;
    this.btnAggiungiPerizia = false;


    let rq = this.server.inviaRichiesta("post", "/aggiungiPerizia", { perizia: nuovaPerizia });
    rq!.then((data: any) => {
      this.caricaPerizie();
    }).catch((error: any) => {
      console.log(error);
    });

    this.titoloPerizia = "";
    this.idOperatorePerizia = "";
    this.descPerizia = "";
    this.dataOraPerizia = "";
    this.txtFile = "";
    this.fotoPerizie = [];

  }

  async aggiungiImmaginiCloudinary(event: any) {
    const selectedFile: File = event.target.files[0];
    console.log(event.target);

    for (let photo of event.target.files) {
      this.base64Convert(selectedFile).then((base64: any) => {
        console.log(base64);

        let rq = this.server.inviaRichiesta("post", "/addBase64CloudinaryImage", { codiceOperatore: this.idOperatorePerizia, imgBase64: base64 });
        rq!.then((data: any) => {
          this.fotoPerizie.push(data.url);
          console.log(this.fotoPerizie);
          this.aspettaImmagini = true;
        }).catch((error: any) => {
          console.log(error);
        });
        
      }).catch((error: any) => {
        console.log(error);
      });
    }

    // let rq = this.server.inviaRichiesta("post", "/addImages", { idPerizia: this.idPeriziaCorrente, images: this.fotoPerizie });

  }

  base64Convert(fileObject: any) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.readAsDataURL(fileObject);
      reader.onload = (event) => {
        resolve(event.target!.result);
      }
      reader.onerror = (err) => {
        reject(err);
      }
    });
  }


  chiudiDivInfoPerizia() {
    this.visualizzaDivInfoPerizia = false;
  }

  createMarker(lat: any, lng: any, title: any) {
    this.markers.push({
      position: {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      },
      title: title
    });

    console.log(this.markers);

  }

  visualizzaImmagini(idPerizia: any) {
    console.log(idPerizia);
    this.visualizzaImmaginiPerizie = true;

    let perizia = this.listaPerizie.filter((perizia: any) => {
      return perizia.idPerizia == idPerizia;
    });

    console.log(perizia[0])

    for(let img of perizia[0].images){
      this.fotoPerizaCorrente.push(img);
    }

    console.log(this.fotoPerizaCorrente)

  }

  chiudiImmaginiPerizie(){
    this.visualizzaImmaginiPerizie = false;
    this.fotoPerizaCorrente = [];
  }

  logout(){
    this.router.navigate(["/login"]);
  }
}
