class GeoXCreateTrack {
    constructor(DivApp){
        this._DivApp = DivApp
        this._MapId = "mapid"
        this._Map = null
        this._Polyline = null
        this._MarkerGroup = null

        this._Nextpoint = 0
        this._Nextlatlng = null
        this._Newpoint = null

        this._IconPointOption = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconSize:     [25, 41],
            iconAnchor:   [12, 40],
            popupAnchor:  [0, -20] // point from which the popup should open relative to the iconAnchor
        });
    }

    LoadViewMap(){
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Ajout du div qui va contenir la map
        this._DivApp.appendChild(CoreXBuild.Div(this._MapId, "", "height: 100vh; width: 100%"))
        // Parametre de la carte
        let CenterPoint = {Lat: 50.709446, Long: 4.543413}
        let Zoom = 15
        // Creation de la carte
        var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        })
        var Openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        })
        var OpenStreetMap_France = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        var baseLayers = {
            "OpenStreet": Openstreetmap,
            "OpenStreetFrance" : OpenStreetMap_France,
            "OpenTopMap" : OpenTopoMap,
            "Satellite": satellite
        };
        this._Map = L.map(this._MapId , {zoomControl: false, layers: [Openstreetmap]}).setView([CenterPoint.Lat, CenterPoint.Long], Zoom);
        L.control.zoom({position: 'bottomright'}).addTo(this._Map);
        L.control.layers(baseLayers,null,{position: 'bottomright'}).addTo(this._Map);
        

        this._Polyline = L.polyline([]).addTo(this._Map)

        var marker = L.marker([50.709446, 4.543413], {icon: this._IconPointOption}).addTo(this._Map)
        marker.bindPopup("<b>La Villa</b>")

        this._MarkerGroup = L.layerGroup().addTo(this._Map)


        this._Map.clicked = 0; 
        this._Map.on('click', (e)=>{
            this._Map.clicked = this._Map.clicked + 1;
            let me = this
            setTimeout(function() {
                if(me._Map.clicked == 1){
                    me._Map.clicked = 0;
                    me.OnMapClick(e);               
                }
              }, 300);
        })
        this._Map.on('dblclick', (e)=>{
            this._Map.clicked = 0;
            this._Map.zoomIn();
        })
    }

    OnMapClick(e) {
        var newMarker = new L.marker(e.latlng, {icon: this._IconPointOption, draggable: 'true',}).addTo(this._MarkerGroup);
        let me = this
        newMarker
            .on('dragstart', me.DragStartHandler.bind(this, newMarker))
            .on('click', me.DragStartHandler.bind(this, newMarker))
            .on('drag', me.DragHandler.bind(this, newMarker))
            .on('dragend', me.DragEndHandler.bind(this, newMarker));
        this._Polyline.addLatLng(L.latLng(e.latlng));
        this._Map.setView((e.latlng));
        //displaylatlong();
    }

    DragStartHandler(e){
        // Get the polyline's latlngs
        var latlngs = this._Polyline.getLatLngs()
        // Get the marker's start latlng
        var latlng = e.getLatLng();
        for (var i = 0; i < latlngs.length; i++) {
            // Compare each to the marker's latlng
            if (latlng.equals(latlngs[i])) {
                // If equals store key in marker instance
                e.polylineLatlng = i;
                this._Nextpoint = i - 1;
                if (this._Nextpoint  < 0) {
                    this._Nextpoint  = 0;
                }
                this._Nextlatlng = latlngs[this._Nextpoint];
                var bounds = L.latLngBounds(latlng, this._Nextlatlng);
                this._Newpoint = bounds.getCenter();
                var markerid = e._leaflet_id
                if (e.polylineLatlng > -1) {
                    e.bindPopup(this.BuildPopupContent(e.polylineLatlng, markerid)).openPopup();
                }
            }
        };
    }
    BuildPopupContent(mypoint, myid){
        let Div = document.createElement("div")
        let ButtonDelete = document.createElement("button")
        ButtonDelete.innerHTML = "Delete"
        ButtonDelete.onclick = this.Deletepoint.bind(this, mypoint, myid)
        Div.appendChild(ButtonDelete)

        let ButtonInsert = document.createElement("button")
        ButtonInsert.innerHTML = "Insert"
        ButtonInsert.onclick = this.Insertpoint.bind(this, mypoint, myid)
        Div.appendChild(ButtonInsert)
        
        return Div
    }

    DragHandler(e){
        // Get the polyline's latlngs
        var latlngs = this._Polyline.getLatLngs()
        // Get the marker's start latlng
        var latlng = e.getLatLng();
        latlngs.splice(e.polylineLatlng, 1, latlng)
        // Update the polyline with the new latlngs
        this._Polyline.setLatLngs(latlngs)
    }

    DragEndHandler(e){
        // Delete key from marker instance
        delete e.polylineLatlng;
        //displaylatlong();
    }

    Deletepoint(mypoint, myid) {
        this._MarkerGroup.removeLayer(myid);
        var latlngs = this._Polyline.getLatLngs();
        latlngs.splice(mypoint, 1);
        this._Polyline.setLatLngs(latlngs);
        //displaylatlong();
        this._Map.closePopup();
        this.Redrawmarkers();
    }

    Insertpoint(mypoint, myid){
        //markerGroup.removeLayer(myid);
        var latlngs = this._Polyline.getLatLngs();
        latlngs.splice(mypoint, 0, this._Newpoint);
        var newMarker = new L.marker(this._Newpoint, {icon: this._IconPointOption, draggable: 'true'}).addTo(this._MarkerGroup);
        let me = this
        newMarker
            .on('dragstart', me.DragStartHandler.bind(this, newMarker))
            .on('click', me.DragStartHandler.bind(this, newMarker))
            .on('drag', me.DragHandler.bind(this, newMarker))
            .on('dragend', me.DragEndHandler.bind(this, newMarker));
        this._Polyline.setLatLngs(latlngs);
        //displaylatlong();
        this._Map.closePopup();
    }

    Redrawmarkers() {
        this._MarkerGroup.clearLayers();
        // Get the polyline's latlngs
        var latlngs = this._Polyline.getLatLngs();
        // Iterate the polyline's latlngs
        for (var i = 0; i < latlngs.length; i++) {
            var newMarker = new L.marker(latlngs[i], {icon: this._IconPointOption, draggable: 'true'}).addTo(this._MarkerGroup);
            let me = this
            newMarker
                .on('dragstart', me.DragStartHandler.bind(this, newMarker))
                .on('click', me.DragStartHandler.bind(this, newMarker))
                .on('drag', me.DragHandler.bind(this, newMarker))
                .on('dragend', me.DragEndHandler.bind(this, newMarker));
            }
    }

    /**
     * Suppression d'une carte
     */
    DeleteMap(){
        if (this._Map && this._Map.remove) {
            this._Map.off();
            this._Map.remove();
            this._Map = null
            let mapDiv = document.getElementById(this._MapId)
            if(mapDiv) mapDiv.parentNode.removeChild(mapDiv)
            this._Polyline = null
            this._MarkerGroup = null
            this._Nextpoint = 0
            this._Nextlatlng = null
            this._Newpoint = null
        }
    }
}