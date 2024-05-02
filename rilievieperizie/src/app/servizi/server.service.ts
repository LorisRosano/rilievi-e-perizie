import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private REST_API_SERVER = 'https://rilievi-e-perizie.onrender.com/api';

  constructor() {

    axios.interceptors.response.use((response: any) => {
      console.log("ciao res")
      let token: any = response.headers["authorization"];
      if (token) {
        localStorage.setItem("token", JSON.stringify(token));
      }
      console.log(token)
      return response;
    });

    axios.interceptors.request.use((config: any) => {
      console.log("ciao req")
      let token: any = localStorage.getItem("token");
      if (token) {
        if(token === "undefined") {
          localStorage.removeItem("token");
        }
        else{
          config.headers["authorization"] = token;
        }
        let parsedCache: any = JSON.parse(token);
        if (parsedCache.token === "undefined") {
          localStorage.removeItem("token");
        } else {
          config.headers["authorization"] = parsedCache.token;
        }
      }
      return config;
    });

  }

  public inviaRichiesta(method: string, resource: string, params: any = {} ): Promise<any> | undefined {
    resource = this.REST_API_SERVER + resource;
    switch (method.toLowerCase()) {
      case 'get':
        return axios.get(resource, { params: params });
      case 'delete':
        return  axios.delete(resource, { params: params });
      case 'post':
        return  axios.post(resource, params);
      case 'patch':
        return  axios.patch(resource, params);
      case 'put':
        return  axios.put(resource, params);
      default:
        return undefined;
    }
  }

  

  public uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_upload_preset'); // Imposta il tuo upload preset

    // Invia l'immagine al tuo server per caricarla su Cloudinary
    return this.inviaRichiesta("post", '/upload-image', formData);
  }
}