class GeoXMap {
    constructor(DivApp){
        this._DivApp = DivApp
        this._MapId = "mapid"
        this._Map = null
        this._LayerGroup = null

        // Add Leaflet Links
        this.AddLeafletLinks()
        
    }

    /**
     * Add Leaflet links
     */
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

    /**
     * Load de la vue liste of group
     * @param {Array} Groups liste of group
     */
    LoadViewGroup(Groups){
        if (Groups == null){
            let DataMap = null
            this.LoadViewMap(DataMap)
        } else if (Groups.length == 1){
            this.SendLoadMapData(Groups[0])
        } else {
            // Clear Conteneur
            this._DivApp.innerHTML = ""
            // Contener
            let Contener = CoreXBuild.DivFlexColumn("Conteneur")
            this._DivApp.appendChild(Contener)
            // Titre
            Contener.appendChild(CoreXBuild.DivTexte("Group of Tracks", "", "Titre", ""))
            // Conteneur de la liste des tracks
            let AppConteneur = CoreXBuild.Div("AppConteneur", "AppConteneur", "")
            Contener.appendChild(AppConteneur)
            AppConteneur.appendChild(CoreXBuild.DivTexte("Select the group of tracks to show in your map:", "", "Text", "text-align: left; margin-top:2vh; margin-bottom:2vh;"))
            // Div pour le titre des colonnes
            let BoxGroup = CoreXBuild.DivFlexColumn("")
            AppConteneur.appendChild(BoxGroup)
            Groups.forEach(GroupName => {
                BoxGroup.appendChild(CoreXBuild.Button(GroupName,this.SendLoadMapData.bind(this, GroupName),"Text ButtonMapGroup"))
            });
        }

    }

    /**
     * Send to serveur commande LoadMapData
     * @param {String} Group Name of the group
     */
    SendLoadMapData(Group){
        GlobalSendSocketIo("GeoX", "LoadMapData", Group)
    }

    /**
     * Load de la vue Map
     * @param {Object} DataMap Object contenant toutes les data d'une map
     */
    LoadViewMap(DataMap){
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Ajout du div qui va contenir la map
        this._DivApp.appendChild(CoreXBuild.Div(this._MapId, "", "height: 98vh; width: 100%"))
        // Parametre de la carte
        let CenterPoint = null
        let zoom = null
        let FitBounds=null
        if (DataMap == null){
            CenterPoint = {Lat: 50.709446, Long: 4.543413}
            zoom= 8
        } else {
            CenterPoint = DataMap.CenterPoint
            zoom = DataMap.Zoom
            FitBounds = DataMap.FitBounds
        }
        // Creation de la carte
        this._Map = L.map(this._MapId , {zoomControl: false}).setView([CenterPoint.Lat, CenterPoint.Long], zoom);
        L.control.zoom({position: 'bottomright'}).addTo(this._Map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(this._Map)
        // Creation du groupe de layer
        this._LayerGroup = new L.LayerGroup()
        this._LayerGroup.addTo(this._Map)
        // Zoom in
        if (FitBounds != null){
            this._Map.flyToBounds(FitBounds,{'duration':4} )
            let me = this
            this._Map.once('moveend', function() {
                DataMap.ListOfTracks.forEach(Track => {
                    me.AddTrack(Track._id, Track.Name, Track.GeoJsonData)
                });
            });
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
        }
    }

    /**
     * Ajouter une track a la carte
     * @param {String} TrackId Id de la track
     * @param {String} TrackName Nom de la track
     * @param {Object} GeoJsonData GeoJson Data de la track
     * @param {string} TrackColor Color de la track
     */
    AddTrack(TrackId, TrackName, GeoJsonData, TrackColor="Blue"){
        var TrackStyle = {
            "color": TrackColor,
            "weight": 3
        };
        var layerTrack1=L.geoJSON(GeoJsonData, {style: TrackStyle}).addTo(this._LayerGroup).bindPopup(TrackName)
        layerTrack1.id = TrackId
    }

    /**
     * Supprimer une track de la carte
     * @param {String} TrackId Id de la track a supprimer de la carte
     */
    RemoveTrack(TrackId){
        this._LayerGroup.eachLayer(function (layer) {
            if (layer.id == TrackId){
                layerGroup.removeLayer(layer);
            }
        })
    }
}