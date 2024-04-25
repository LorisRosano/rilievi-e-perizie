import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MapsAPILoader } from '@agm/core';


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

