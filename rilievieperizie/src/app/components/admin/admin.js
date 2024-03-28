"use strict";

const URL_MAPS = 'https://maps.googleapis.com/maps/api'

window.onload = async function() {
    
    function caricaGoogleMaps(){
        let promise =  new Promise(function(resolve, reject){
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = URL_MAPS + '/js?v=3&key=' + MAP_KEY;
            document.body.appendChild(script);
            // onload e onerror sono semplici puntatori a funzione
            // in cui memorizzare i puntatori alle funzione da eseguire
            script.onload = resolve;  // non inietta alcun dato
            script.onerror = reject;  // non inietta alcun errore
            script.onerror = function (){
                throw new Error("Errore caricamento GoogleMaps")
            } 
        })
        return promise
    }

    await caricaGoogleMaps()

	let mapContainer = $("#divMappa");       
	
	let gpsOptions = {
		enableHighAccuracy: false,
		timeout: 7000,	// con 5000 ogni tanto va in errore
		maximumAge: 0 
	}
		

	let map;
	navigator.geolocation.getCurrentPosition(visualizzaPosizione, errore, gpsOptions)	

	
	function visualizzaPosizione(position){
		let lat = position.coords.latitude
		let lng = position.coords.longitude
		let precision = position.coords.accuracy.toFixed(2)
		let alt = position.coords.altitude
		results.html(`Latitudine = ${lat}, Longitudine = ${lng}, Altitudine = ${alt} ,Precisione ${precision}`)
		
		let point = {'lat':lat, 'lng': lng}
		let mapOptions = {
			'center': point,
			'zoom':15.5
		}
		map = new google.maps.Map(mapContainer,mapOptions)

		let markerOptions = {
			'map':map,
			'position': point,
			'title': 'Questa è la tua posizione',
			'animation': google.maps.Animation.BOUNCE
		}
		new google.maps.Marker(markerOptions)
	}


	function errore(err) {
		results.html(`Errore: ${err.code} - ${err.message}`)
	}	
	
	
}