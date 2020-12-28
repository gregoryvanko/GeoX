class GeoXMap {
    constructor(DivApp){
        this._DivApp = DivApp
        this._MapId = "mapid"
        this._Map = null
        this._LayerGroup = null
        this._GroupSelected = null
        this._DataMap = null
        this._DataApp = null
        this._CurrentPosShowed = false
        this._GpsPointer = null
        this._wWatchPositionID = null
        // Add Leaflet Links
        //this.AddLeafletLinks()
        
    }

    /**
     * Add Leaflet links
     */
    //AddLeafletLinks(){
        // // Add css for maps
        // var link  = document.createElement('link');
        // link.rel  = 'stylesheet';
        // link.type = 'text/css';
        // link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        // link.integrity='sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=='
        // link.crossOrigin =""
        // // Add css for maps
        // document.head.appendChild(link)
        // var Leafletjs = document.createElement('script')
        // Leafletjs.setAttribute('src','https://unpkg.com/leaflet@1.7.1/dist/leaflet.js')
        // Leafletjs.setAttribute('integrity','sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==')
        // Leafletjs.setAttribute('crossorigin','')
        // document.head.appendChild(Leafletjs)
    //}

    /**
     * Load de la vue Map
     * @param {Object} DataMap Object contenant toutes les data d'une map
     */
    LoadViewMap(GeoXData){
        this._DataApp = GeoXData.AppData
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Ajout du div qui va contenir la map
        this._DivApp.appendChild(CoreXBuild.Div(this._MapId, "", "height: 100vh; width: 100%"))
        if (GeoXData.AppGroup.length > 0){
            // Ajout du drop down avec le nom des groupes des map
            let divdropdown = CoreXBuild.Div("", "DivMapGroupDropDown", "")
            this._DivApp.appendChild(divdropdown)
            let DropDown = document.createElement("select")
            DropDown.setAttribute("id", "Group")
            DropDown.setAttribute("class", "Text MapGroupDropDown")
            GeoXData.AppGroup.forEach(element => {
                let option = document.createElement("option")
                option.setAttribute("value", element)
                option.innerHTML = element
                DropDown.appendChild(option)
            });
            DropDown.onchange = this.NewGroupSelected.bind(this)
            divdropdown.appendChild(DropDown)
            this._GroupSelected = GeoXData.AppGroup[0]
            // Ajout du bouton action left
            this._DivApp.appendChild(CoreXBuild.ButtonLeftAction(this.ShowTrackInfoBox.bind(this), "ButtonShowTrackInfo"))
        }
        // Ajout du bouton en bas a gauche pour geolocaliser
        this._DivApp.appendChild(CoreXBuild.ButtonLeftBottomAction(this.Gpslocalisation.bind(this), "Bottom" , "&#8982"))
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
        var baseLayers = {
            "OpenStreet": Openstreetmap,
            "OpenStreetFrance" : OpenStreetMap_France,
            "Satellite": satellite
        };
        this._Map = L.map(this._MapId , {zoomControl: false, layers: [Openstreetmap]}).setView([CenterPoint.Lat, CenterPoint.Long], zoom);
        L.control.zoom({position: 'bottomright'}).addTo(this._Map);
        L.control.layers(baseLayers,null,{position: 'bottomright'}).addTo(this._Map);
        // Creation du groupe de layer
        this._LayerGroup = new L.LayerGroup()
        this._LayerGroup.addTo(this._Map)
        let me = this
        // Ajout des tracks sur la map
        setTimeout(function(){
            me.ModifyTracksOnMap(GeoXData.AppInitMapData)
        }, 500);
    }

    /**
     * View or hide Current position
     */
    Gpslocalisation(){
        if (this._CurrentPosShowed){
            // Hide current position
            this._CurrentPosShowed = false
            this._Map.removeLayer(this._GpsPointer)
            this._GpsPointer = null
            if (navigator.geolocation){
                navigator.geolocation.clearWatch(this._wWatchPositionID)
                this._wWatchPositionID = null
            }
        } else {
            this._CurrentPosShowed = true
            const MyIcon = L.icon({
                iconUrl: this.GetIconCible(),
                iconSize: [70, 70],
                iconAnchor: [35, 35]
            })
            this._GpsPointer = L.marker([50.709446,4.543413], {icon : MyIcon}).addTo(this._Map)
            this.StartLocalisation()
        }
    }

    StartLocalisation(){
        if (navigator.geolocation) {
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
              };
            this._wWatchPositionID = navigator.geolocation.watchPosition(this.ShowPosition.bind(this),this.ErrorPosition, options)
        } else {
            alert("Geolocation is not supported by this browser.")
        }
    }

    ShowPosition(Position){
        this._GpsPointer.setLatLng([Position.coords.latitude, Position.coords.longitude])
    }
    
    ErrorPosition(err){
        alert('ERROR Position (' + err.code + '): ' + err.message);
    }

    /**
     * Show le box du track info
     */
    ShowTrackInfoBox(){
        // Show track info box
        this.BuildBoxTracksInfo(this._DataApp)
        // hide boutton
        document.getElementById("ButtonShowTrackInfo").style.display = "none";
        // Start transition
        setTimeout(function(){
            let DivBoxTracks = document.getElementById("DivBoxTracks")
            DivBoxTracks.classList.add("DivBoxTracksShow")
        }, 100);
        
    }

    /**
     * Hide du box du track info
     */
    HideTrackInfoBox(){
        // If TracksInfo existe alors on le supprime
        let MyDivBoxTracks = document.getElementById("DivBoxTracks")
        if(MyDivBoxTracks){
            // Show button
            document.getElementById("ButtonShowTrackInfo").style.display = "block";
            //MyDivBoxTracks.style.left = '-20%';
            MyDivBoxTracks.classList.remove("DivBoxTracksShow")
            setTimeout(function(){
                MyDivBoxTracks.parentNode.removeChild(MyDivBoxTracks)
            }, 1500);
        }
    }

    /**
     * Construit la vue du box track info
     * @param {Object} AppData liste des donnees de l'application
     */
    BuildBoxTracksInfo(AppData){
        // Div du box
        let DivBoxTracks = CoreXBuild.Div("DivBoxTracks", "DivBoxTracks", "")
        this._DivApp.appendChild(DivBoxTracks)
        // Add Close button
        DivBoxTracks.appendChild(CoreXBuild.Button ("&#x21E6", this.HideTrackInfoBox.bind(this), "ButtonClose", ""))
        // Div empty
        DivBoxTracks.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Add all tracks of the group
        AppData.forEach(element => {
            if (element.Group == this._GroupSelected){
                let DivBoxTrackInfo = CoreXBuild.Div("", "DivBoxTrackInfo", "")
                DivBoxTracks.appendChild(DivBoxTrackInfo)
                let Conteneur = CoreXBuild.DivFlexRowStart("")
                DivBoxTrackInfo.appendChild(Conteneur)
                let DivTrackinfo = CoreXBuild.Div("", "", "width: 56%; display: -webkit-flex; display: flex; flex-direction: column; justify-content:flex-start;")
                DivTrackinfo.addEventListener('click', this.FitboundOnTrack.bind(this, element))
                Conteneur.appendChild(DivTrackinfo)
                DivTrackinfo.appendChild(CoreXBuild.DivTexte(element.Name,"","TextTrackInfo", "color: white; margin-left: 4%;"))
                let DivSubInfo = CoreXBuild.Div("","","width: 100%; display: -webkit-flex; display: flex; flex-direction: row;  justify-content:space-between;")
                DivTrackinfo.appendChild(DivSubInfo)
                DivSubInfo.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateString(element.Date),"","TextTrackInfo", "color: white; margin-left: 4%;"))
                DivSubInfo.appendChild(CoreXBuild.DivTexte(element.Length + "Km","","TextTrackInfo", "color: white; margin-left: 0%;"))
                let DivButton = document.createElement("div")
                DivButton.setAttribute("style", "margin-left: auto; display: -webkit-flex; display: flex; flex-direction: row; justify-content:flex-end; align-content:center; align-items: center; flex-wrap: wrap;")
                let inputcolor = document.createElement("input")
                inputcolor.setAttribute("id","color" + element._id)
                inputcolor.setAttribute("type","color")
                inputcolor.setAttribute("style","background-color: white;border-radius: 8px; cursor: pointer; width: 34px;")
                inputcolor.value = element.Color
                inputcolor.onchange = (event)=>{this.ChangeTrackColor(event.target.value, element._id)}
                DivButton.appendChild(inputcolor)
                DivButton.appendChild(CoreXBuild.Button ("&#128065", this.ToogleTrack.bind(this, element._id), "ButtonIcon"))
                Conteneur.appendChild(DivButton)
            }
        });
    }

    FitboundOnTrack(track){
        let FitboundTrack = [ [track.ExteriorPoint.MaxLong, track.ExteriorPoint.MinLat], [track.ExteriorPoint.MaxLong, track.ExteriorPoint.MaxLat], [ track.ExteriorPoint.MinLong, track.ExteriorPoint.MaxLat ], [ track.ExteriorPoint.MinLong, track.ExteriorPoint.MinLat], [track.ExteriorPoint.MaxLong, track.ExteriorPoint.MinLat]] 
        this._Map.flyToBounds(FitboundTrack,{'duration':2} )
    }

    /**
     * Fonction triggered by the dropdown Group
     */
    NewGroupSelected(){
        // If TracksInfo existe alors on le supprime
        this.HideTrackInfoBox()
        // get du nom du type
        let DropDownGroupValue = document.getElementById("Group").value
        this._GroupSelected = DropDownGroupValue
        // Send data to server
        GlobalSendSocketIo("GeoX", "LoadMapData", DropDownGroupValue)
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
        this._DataMap = DataMap
        let me = this
        // Remove all tracks
        this._LayerGroup.eachLayer(function (layer) {
            me._LayerGroup.removeLayer(layer);
        })
        // Zoom in and add tracks
        if (this._DataMap.FitBounds != null){
            this._Map.flyToBounds(this._DataMap.FitBounds,{'duration':2} )
            let me = this
            this._Map.once('moveend', function() {
                me._DataMap.ListOfTracks.forEach(Track => {
                    // Style for tracks
                    var TrackStyle = {
                        "color": Track.Color,
                        "weight": 3
                    };
                    // Add track
                    var layerTrack1=L.geoJSON(Track.GeoJsonData, {style: TrackStyle, arrowheads: {frequency: '100px', size: '15m', fill: true}}).addTo(me._LayerGroup).bindPopup(Track.Name)
                    layerTrack1.id = Track._id
                });
            });
        }
    }

    /**
     * Supprimer une track de la carte
     * @param {String} TrackId Id de la track a supprimer de la carte
     */
    ToogleTrack(TrackId){
        // On chercher la track dans le LayerGroup, si on la trouve on la supprime, si on ne la trouve pas on l'ajoute
        let me = this
        let AddTrack = true
        this._LayerGroup.eachLayer(function (layer) {
            if (layer.id == TrackId){
                me._LayerGroup.removeLayer(layer);
                AddTrack = false
            }
        })
        if (AddTrack){
            this._DataMap.ListOfTracks.forEach(Track => {
                if (Track._id == TrackId){
                    var TrackStyle = {
                        "color": Track.Color,
                        "weight": 3
                    };
                    var layerTrack1=L.geoJSON(Track.GeoJsonData, {style: TrackStyle, arrowheads: {frequency: '80px', size: '18m', fill: true}}).addTo(me._LayerGroup).bindPopup(Track.Name)
                    layerTrack1.id = Track._id
                }
            });
        }
    }

    /**
     * Change the color of a track
     * @param {Color} Color New color
     * @param {String} TrackId id of the track to color
     */
    ChangeTrackColor(Color, TrackId){
        this._LayerGroup.eachLayer(function (layer) {
            if (layer.id == TrackId){
                layer.setStyle({color: Color});
            }
        })
        this._DataMap.ListOfTracks.forEach(Track => {
            if (Track._id == TrackId){
                Track.Color = Color
            }
        });
        this._DataApp.forEach(Track => {
            if (Track._id == TrackId){
                Track.Color = Color
            }
        });
        let Track = new Object()
        Track.Id = TrackId
        Track.Color = Color
        // Data to send
        let Data = new Object()
        Data.Action = "Update"
        Data.Data = Track
        Data.FromCurrentView = null
        GlobalSendSocketIo("GeoX", "ManageTrack", Data)
    }

    GetIconCible(){
        return 'data:image/png;base64,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EIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIBAygT+P6t3Hj05TdI1AAAAAElFTkSuQmCC'
    }
}