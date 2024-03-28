import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ServerService } from '../../servizi/server.service';

@Component({
  selector: 'UtenteComponent',
  standalone: true,
  imports: [RouterModule, RouterOutlet],
  templateUrl: './utente.component.html',
  styleUrl: './utente.component.css'
})
export class UtenteComponent {
  constructor(private server: ServerService,public router : Router) {}
}
