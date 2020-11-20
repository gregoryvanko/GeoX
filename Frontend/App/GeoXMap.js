class GeoXMap {
    constructor(DivApp){
        this._DivApp = DivApp
        this._MapId = "mapid"
        this._Map = null
        this._LayerGroup = null

        // Add Leaflet Links
        this.AddLeafletLinks()
        
    }
    set MapId(val){this._MapId = val;}

    AddLeafletLinks(){
        // Add css for maps
        var link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        link.integrity='sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=='
        link.crossOrigin =""
        // Add css for maps
        document.head.appendChild(link)
        var Leafletjs = document.createElement('script')
        Leafletjs.setAttribute('src','https://unpkg.com/leaflet@1.7.1/dist/leaflet.js')
        Leafletjs.setAttribute('integrity','sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==')
        Leafletjs.setAttribute('crossorigin','')
        document.head.appendChild(Leafletjs)
    }

    BuildViewWatingData(){
        // Contener
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Titre de l'application
        Conteneur.appendChild(CoreXBuild.DivTexte("GeoX", "", "Titre"))
        // on construit le texte d'attente
        Conteneur.appendChild(CoreXBuild.DivTexte("Waiting server data...","","Text", "text-align: center;"))
        // Send status to serveur
        GlobalSendSocketIo("GeoX", "BuildViewMap", "")
    }

    LoadViewMap(Data){
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Ajout du div qui va contenir la map
        this._DivApp.appendChild(CoreXBuild.Div("mapid", "", "height: 98vh; width: 100%"))
        // If receive no data from server
        if (Data.ListOfTracks.length == 0){
            this.CreateMap()
        } else {
            this.CreateMap(Data.CenterPoint, Data.Zoom, Data.FitBounds)
            Data.ListOfTracks.forEach(Track => {
                this.AddTrack(Track._id, Track.Name, Track.GeoJsonData)
            });
        }
    }

    CreateMap(CenterPoint = {Lat: 50.709446, Long: 4.543413}, zoom= 8, FitBounds=null){
        // Creation de la carte
        this._Map = L.map(this._MapId , {zoomControl: false}).setView([CenterPoint.Lat, CenterPoint.Long], zoom);
        L.control.zoom({position: 'bottomright'}).addTo(this._Map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(this._Map)
        if (FitBounds != null){
            this._Map.fitBounds(FitBounds)
        }
        // Creation du groupe de layer
        this._LayerGroup = new L.LayerGroup()
        this._LayerGroup.addTo(this._Map)
    }

    DeleteMap(){
        if (this._Map && this._Map.remove) {
            this._Map.off();
            this._Map.remove();
            this._Map = null
            let mapDiv = document.getElementById('mapid')
            if(mapDiv) mapDiv.parentNode.removeChild(mapDiv)
        }
    }

    AddTrack(TrackId, TrackName, GeoJsonData, TrackColor="Blue"){
        var TrackStyle = {
            "color": TrackColor,
            "weight": 3
        };
        var layerTrack1=L.geoJSON(GeoJsonData, {style: TrackStyle}).addTo(this._LayerGroup).bindPopup(TrackName)
        layerTrack1.id = TrackId
    }

    RemoveTrack(TrackId){
        this._LayerGroup.eachLayer(function (layer) {
            if (layer.id == TrackId){
                layerGroup.removeLayer(layer);
            }
        })
    }
}