import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'AdminComponent',
  standalone: true,
  imports: [GoogleMapsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  title = 'Admin'

  center: google.maps.LatLngLiteral = {
    lat: 24,
    lng: 12
};
zoom = 4;
vertices: google.maps.LatLngLiteral[] = [{
    lat: 45.59135,
    lng: 10.243048
}];
}
