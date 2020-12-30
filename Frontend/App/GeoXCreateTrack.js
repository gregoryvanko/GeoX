class GeoXCreateTrack {
    constructor(DivApp){
        this._DivApp = DivApp
        this._MapId = "mapid"
        this._Map = null
        this._Polyline = null
        this._MarkerGroup = null
        this._DragpointNb = 0
        this._AllowClick = true

        this._IconPointOption = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconSize:     [18, 30],
            iconAnchor:   [9, 30],
            popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
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
        this._Map = L.map(this._MapId , {zoomControl: false, tapTolerance:40, tap:false, layers: [Openstreetmap]}).setView([CenterPoint.Lat, CenterPoint.Long], Zoom);
        L.control.zoom({position: 'bottomright'}).addTo(this._Map);
        L.control.layers(baseLayers,null,{position: 'bottomright'}).addTo(this._Map);
        

        this._Polyline = L.polyline([]).arrowheads({frequency: '50px', size: '10m', fill: true}).addTo(this._Map)

        //var marker = L.marker([50.709446, 4.543413], {icon: this._IconPointOption}).addTo(this._Map)
        //marker.bindPopup("<b>La Villa</b>")

        this._MarkerGroup = L.layerGroup().addTo(this._Map)

        let me = this
        // Gestion du bug click deux fois sur IOS
        this._Map.on('movestart', (e)=>{this._AllowClick = false})
        this._Map.on('moveend', (e)=>{setTimeout(()=>{me._AllowClick = true}, 300);})
        this._Map.on('click', (e)=>{
            if (e.originalEvent.isTrusted){
                if (this._AllowClick){
                    this.OnMapClick(e)
                }
            }
        })

        this.BuildInfoBox()
    }

    OnMapClick(e) {
        var newMarker = new L.marker(e.latlng, {icon: this._IconPointOption, draggable: 'true',}).addTo(this._MarkerGroup);
        this._Polyline.addLatLng(L.latLng(e.latlng));
        newMarker.bindPopup(this.BuildPopupContent(newMarker._leaflet_id));
        let me = this
        newMarker
            .on('click', me.MarkerOnClickHandler.bind(this, newMarker))
            .on('dragstart', me.MarkerDragStartHandler.bind(this, newMarker))
            .on('drag', me.MarkerDragHandler.bind(this, newMarker))
            .on('dragend', me.MarkerDragEndHandler.bind(this, newMarker));
        this._Map.setView((e.latlng));
        this.UpdateViewDistance()
    }

    BuildPopupContent(myid){
        let Div = document.createElement("div")
        Div.setAttribute("style","display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-around; align-content:center; align-items: center; box-sizing: border-box; margin:10%;")
        let ButtonDelete = document.createElement("button")
        ButtonDelete.setAttribute("Class", "ButtonPopup TextSmall")
        ButtonDelete.innerHTML = "Delete"
        ButtonDelete.onclick = this.Deletepoint.bind(this, myid)
        Div.appendChild(ButtonDelete)

        // Si le marker est le premier, il ne faut pas ajouter le boutton indsert
        var latlngs = this._Polyline.getLatLngs()
        var CurrentMarker = this._MarkerGroup.getLayer(myid)
        var latlng = CurrentMarker.getLatLng();
        if (!latlng.equals(latlngs[0])){
            let ButtonInsert = document.createElement("button")
            ButtonInsert.setAttribute("Class", "ButtonPopup TextSmall")
            ButtonInsert.innerHTML = "Insert"
            ButtonInsert.onclick = this.Insertpoint.bind(this, myid)
            Div.appendChild(ButtonInsert)
        }
        return Div
    }

    MarkerOnClickHandler(newMarker){
        newMarker.openPopup()
    }

    MarkerDragStartHandler(newMarker){
        this._AllowClick = false
        var latlngs = this._Polyline.getLatLngs()
        var latlng = newMarker.getLatLng();
        for (var i = 0; i < latlngs.length; i++){
            if (latlng.equals(latlngs[i])){
                this._DragpointNb = i
            }
        }
    }

    MarkerDragHandler(newMarker){
        this._AllowClick = false
        this._Map.closePopup();
        var latlngs = this._Polyline.getLatLngs()
        var latlng = newMarker.getLatLng();
        latlngs.splice(this._DragpointNb, 1, latlng)
        this._Polyline.setLatLngs(latlngs)
    }

    MarkerDragEndHandler(newMarker){
        this.UpdateViewDistance()
        let me = this
        setTimeout(()=>{ me._AllowClick = true}, 300);
    }

    Deletepoint(myid) {
        var mypoint = 0
        var latlngs = this._Polyline.getLatLngs()
        var CurrentMarker = this._MarkerGroup.getLayer(myid)
        var latlng = CurrentMarker.getLatLng();
        var Found = false
        for (var i = 0; i < latlngs.length; i++){
            if (latlng.equals(latlngs[i])){
                mypoint = i
                Found = true
                this._MarkerGroup.removeLayer(myid);
                latlngs.splice(mypoint, 1);
                this._Polyline.setLatLngs(latlngs);
                this._Map.closePopup();
                this.Redrawmarkers();
                this.UpdateViewDistance()
            }
        }
        if (!Found){
            alert("Error, Marker not found")
        }
    }

    Insertpoint(myid){
        var mypoint = 0
        var latlngs = this._Polyline.getLatLngs()
        var CurrentMarker = this._MarkerGroup.getLayer(myid)
        var latlng = CurrentMarker.getLatLng();
        var Found = false
        for (var i = 0; i < latlngs.length; i++){
            if (latlng.equals(latlngs[i])){
                mypoint = i
                Found = true
            }
        }
        if (Found){
            var Nextpoint = mypoint - 1;
            if (Nextpoint  >= 0) {
                var bounds = L.latLngBounds(latlng, latlngs[Nextpoint]);
                var Newpoint = bounds.getCenter();
                latlngs.splice(mypoint, 0, Newpoint);
                this._Polyline.setLatLngs(latlngs);
                var newMarker = new L.marker(Newpoint, {icon: this._IconPointOption, draggable: 'true'}).addTo(this._MarkerGroup);
                newMarker.bindPopup(this.BuildPopupContent(newMarker._leaflet_id));
                let me = this
                newMarker
                    .on('click', me.MarkerOnClickHandler.bind(this, newMarker))
                    .on('dragstart', me.MarkerDragStartHandler.bind(this, newMarker))
                    .on('drag', me.MarkerDragHandler.bind(this, newMarker))
                    .on('dragend', me.MarkerDragEndHandler.bind(this, newMarker));
                
                this._Map.closePopup();
            } else {
                alert("Error, no marker before this one")
            }
        } else {
            alert("Error, Marker not found")
        }
    }

    Redrawmarkers() {
        this._MarkerGroup.clearLayers();
        var latlngs = this._Polyline.getLatLngs();
        for (var i = 0; i < latlngs.length; i++) {
            var newMarker = new L.marker(latlngs[i], {icon: this._IconPointOption, draggable: 'true'}).addTo(this._MarkerGroup);
            newMarker.bindPopup(this.BuildPopupContent(newMarker._leaflet_id));
            let me = this
            newMarker
                .on('click', me.MarkerOnClickHandler.bind(this, newMarker))
                .on('dragstart', me.MarkerDragStartHandler.bind(this, newMarker))
                .on('drag', me.MarkerDragHandler.bind(this, newMarker))
                .on('dragend', me.MarkerDragEndHandler.bind(this, newMarker));
            }
    }

    UpdateViewDistance(){
        var Dist = this.CalculDistance()
        document.getElementById("DivDistance").innerText = "Distance: " + Dist +"km"
    }

    CalculDistance(){
        var Dist = 0
        var latlngs = this._Polyline.getLatLngs();
        if (latlngs.length > 0){
            var lastpoint = latlngs[0];
            // Iterate the polyline's latlngs
            for (var i = 0; i < latlngs.length; i++) {
                Dist += latlngs[i].distanceTo(lastpoint);
                lastpoint = latlngs[i]
            }
            Dist = Dist / 1000;
        }
        Dist = Dist.toFixed(2)
        return Dist
    }

    BuildInfoBox(){
        var Dist = this.CalculDistance()
        let DivInfoBox = CoreXBuild.Div("DivInfoBox", "DivInfoBox", "")
        this._DivApp.appendChild(DivInfoBox)
        DivInfoBox.appendChild(CoreXBuild.DivTexte("Distance: " + Dist +"km","DivDistance","TextTrackInfo", "color: white; margin-left: 1%;"))
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
            this._DragpointNb = 0
            this._AllowClick = true
        }
    }
}