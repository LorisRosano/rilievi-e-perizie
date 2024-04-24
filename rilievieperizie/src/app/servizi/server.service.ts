import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private REST_API_SERVER = 'http://localhost:3000/api';

  constructor(private httpClient: HttpClient) {}

  public inviaRichiesta(method: string, resource: string, params: any = {} ): Promise<any> | undefined {
    resource = this.REST_API_SERVER + resource;
    switch (method.toLowerCase()) {
      case 'get':
        return firstValueFrom(this.httpClient.get(resource, { params: params }));
      case 'delete':
        return  firstValueFrom(this.httpClient.delete(resource, { body: params }));
      case 'post':
        return  firstValueFrom(this.httpClient.post(resource, params));
      case 'patch':
        return  firstValueFrom(this.httpClient.patch(resource, params));
      case 'put':
        return  firstValueFrom(this.httpClient.put(resource, params));
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