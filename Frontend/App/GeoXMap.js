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
     * Load de la vue Map
     * @param {Object} DataMap Object contenant toutes les data d'une map
     */
    LoadViewMap(GeoXData){
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Ajout du div qui va contenir la map
        this._DivApp.appendChild(CoreXBuild.Div(this._MapId, "", "height: 98vh; width: 100%"))
        // Ajout du drop down avec le nom des groupes des map
        let divdropdown = CoreXBuild.Div("", "DivMapGroupDropDown", "")
        this._DivApp.appendChild(divdropdown)
        let DropDown = document.createElement("select")
        DropDown.setAttribute("id", "Group")
        DropDown.setAttribute("class", "Text MapGroupDropDown")
        // liste des differents type
        GeoXData.AppGroup.forEach(element => {
            let option = document.createElement("option")
            option.setAttribute("value", element)
            option.innerHTML = element
            DropDown.appendChild(option)
        });
        DropDown.onchange = this.NewGroupSelected.bind(this)
        divdropdown.appendChild(DropDown)
        // Parametre de la carte
        let CenterPoint = null
        let zoom = null
        let FitBounds=null
        if (GeoXData.AppInitMapData != null ){
            CenterPoint = GeoXData.AppInitMapData.CenterPoint
            zoom = GeoXData.AppInitMapData.Zoom
            FitBounds = GeoXData.AppInitMapData.FitBounds
        } else {
            CenterPoint = {Lat: 50.709446, Long: 4.543413}
            zoom= 8
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
        let me = this
        setTimeout(function(){
            me.ModifyTracksOnMap(GeoXData.AppInitMapData)
        }, 500);
    }

    /**
     * Fonction triggered by the dropdown Group
     */
    NewGroupSelected(){
        // get du nom du type
        let DropDownGroupValue = document.getElementById("Group").value
        this.SendLoadMapData(DropDownGroupValue)
    }

    /**
     * Send to serveur commande LoadMapData
     * @param {String} Group Name of the group
     */
    SendLoadMapData(Group){
        GlobalSendSocketIo("GeoX", "LoadMapData", Group)
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
    ModifyTracksOnMap(DataMap){
        let me = this
        // Remove all tracks
        this._LayerGroup.eachLayer(function (layer) {
            me._LayerGroup.removeLayer(layer);
        })
        // Style for tracks
        var TrackStyle = {
            "color": "Blue",
            "weight": 3
        };
        // Zoom in and add tracks
        if (DataMap.FitBounds != null){
            this._Map.flyToBounds(DataMap.FitBounds,{'duration':2} )
            this._Map.once('moveend', function() {
                DataMap.ListOfTracks.forEach(Track => {
                    var layerTrack1=L.geoJSON(Track.GeoJsonData, {style: TrackStyle}).addTo(me._LayerGroup).bindPopup(Track.Name)
                    layerTrack1.id = Track._id
                });
            });
        }
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