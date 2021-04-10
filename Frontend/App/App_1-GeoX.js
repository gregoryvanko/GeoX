class GeoX {

    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        // App en full screen 
        this._DivApp.style.padding = "0%"
        this._DivApp.style.margin = "0% AUTO"
        
        this._MapId = "mapid"
        this._Map = null
        this._LayerGroup = null

        // this._GroupSelected = null
        // this._DataMap = null
        // this._GeoXData = null
        // this._DataApp = null
        // this._CurrentPosShowed = false
        // this._GpsPointer = null
        // this._GpsPointerTrack = null
        // this._GpsRadius = null
        // this._GpsLineToPosition = null
        // this._GeoLocalisation = new GeoLocalisation(this.ShowPosition.bind(this), this.ErrorPosition.bind(this))

        // Style for Marker Start
        this._IconPointStartOption = L.icon({
            iconUrl: Icon.MarkerVert(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
        // Style for Marker End
        this._IconPointEndOption = L.icon({
            iconUrl: Icon.MarkerRouge(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
        // Track style
        this._WeightTrack = (L.Browser.mobile) ? 5 : 3
        // User group 
        this._UserGroup = null
        // List Of Track
        this._ListOfTrack = []
        // Donnee de construction de la map
        this._InitialMapData = null
        // FitBounds
        this._FitBounds = null
        // InfoBox
        this._InfoBox = null
        
    }

    /**
     * Initiation du module
     */
    Initiation(){
        // Show Action Button
        GlobalDisplayAction('On')
        // Execute before quit
        GlobalExecuteBeforeQuit(this.CloseModule.bind(this))
        // Clear Action List
        GlobalClearActionList()
        // Clear view
        this._DivApp.innerHTML=""
        // SocketIO
        let SocketIo = GlobalGetSocketIo()
        SocketIo.on('GeoXError', (Value) => {this.Error(Value)})
        SocketIo.on('GeoX', (Value) => {this.MessageRecieved(Value)})
        // InfoBox
        this._InfoBox = new InfoBox(this._DivApp, this.ToogleTrack.bind(this), this.ClickOnBoxTrack.bind(this), this.ChangeTrackColor.bind(this), this.ClickOnFollowTrack.bind(this))
        // Load Data
        this.LoadViewGetAppData()
    }

    /**
     * Action to take when message recieved from server
     * @param {Object} Value Objet recu du serveur
     */
    MessageRecieved(Value){
        if (Value.Action == "SetInitialData"){
            // Si le user possède au moins un groupe
            if (Value.Data.UserGroup.length > 0){
                this._UserGroup = Value.Data.UserGroup
                this._ListOfTrack = this._ListOfTrack.concat(Value.Data.InitialTracks)
                this._InitialMapData = Value.Data.InitialMapData
                this._FitBounds = Value.Data.FitBounds
                this.LoadViewMap()
            } else {
                document.getElementById("WaitingText").innerHTML = "You don't have any track. Please create add or create a track..."
            }
        } else if (Value.Action == "SetMapData" ){
            // this._DataMap = Value.Data
            // this.ModifyTracksOnMap()
        } else {
            console.log("error, Action not found: " + Value.Action)
        }
    }

    /**
     * Affichage du message d'erreur venant du serveur
     * @param {String} ErrorMsg Message d'erreur envoyé du serveur
     */
    Error(ErrorMsg){
        // Delete map
        this.CloseModule()
        // Clear view
        this._DivApp.innerHTML=""
        // Add conteneur
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Add Error Text
        Conteneur.appendChild(CoreXBuild.DivTexte(ErrorMsg,"","Text", "text-align: center; color: red; margin-top: 20vh;"))
    }

    /**
     * Suppression d'une carte
     */
    CloseModule(){
        this._UserGroup = null
        this._ListOfTrack = []
        this._InitialMapData = null
        this._FitBounds = null
        this._InfoBox = null

        if (this._Map && this._Map.remove) {
            this._Map.off();
            this._Map.remove();
            this._Map = null
            let mapDiv = document.getElementById(this._MapId)
            if(mapDiv) mapDiv.parentNode.removeChild(mapDiv)
            this._LayerGroup = null

            // this._GroupSelected = null
            // this._DataMap = null
            // this._GeoXData = null
            // this._DataApp = null
            // this._CurrentPosShowed = false
            // this._GpsPointer = null
            // this._GpsPointerTrack = null
            // this._GpsRadius = null
            // this._GpsLineToPosition = null
            // if (L.Browser.mobile){document.body.style.backgroundColor= "white"}
            // this._GeoLocalisation.StopLocalisation()
        }
    }

    /**
     * Load des Data de l'application
     */
    LoadViewGetAppData(){
        // Clear view
        this._DivApp.innerHTML=""
        // Contener
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Titre de l'application
        Conteneur.appendChild(CoreXBuild.DivTexte("GeoX", "", "Titre"))
        // on construit le texte d'attente
        Conteneur.appendChild(CoreXBuild.DivTexte("Waiting for server data...","WaitingText","Text", "text-align: center; margin-top: 10vh;"))
        // Send status to serveur
        let CallToServer = new Object()
        CallToServer.Action = "GetInitialData"
        GlobalSendSocketIo("GeoX", "ModuleGeoX", CallToServer)
    }

    /**
     * Load de la vue Map
     */
    LoadViewMap(){
        // mettre le backgroundColor du body à Black pour la vue Iphone
        if (L.Browser.mobile){document.body.style.backgroundColor= "black"}
        
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Ajout du div qui va contenir la map
        this._DivApp.appendChild(CoreXBuild.Div(this._MapId, "", "height: 100vh; width: 100%;"))
        // Ajout du bouton action left
        this._DivApp.appendChild(CoreXBuild.ButtonLeftAction(this._InfoBox.InfoBoxToggle.bind(this._InfoBox, this._UserGroup, this._ListOfTrack), "ButtonInfoBoxToggle", `<img src="${Icon.OpenPanel()}" alt="icon" width="25" height="25">`))
        // Parametre de la carte
        let CenterPoint = this._InitialMapData.CenterPoint
        let zoom = this._InitialMapData.Zoom
        // Creation de la carte
        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        })
        const Openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        })
        const OpenStreetMap_France = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        const OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        const baseLayers = {
            "OpenStreet": Openstreetmap,
            "OpenStreetFrance" : OpenStreetMap_France,
            "OpenTopMap" : OpenTopoMap,
            "Satellite": satellite
        };
        this._Map = L.map(this._MapId , {zoomControl: false, layers: [Openstreetmap]}).setView([CenterPoint.Lat, CenterPoint.Long], zoom);
        L.control.zoom({position: 'bottomright'}).addTo(this._Map);
        L.control.layers(baseLayers,null,{position: 'bottomright'}).addTo(this._Map);
        // Creation du groupe de layer
        this._LayerGroup = new L.LayerGroup()
        this._LayerGroup.addTo(this._Map)
        // Ajout des tracks sur la map
        let me = this
        setTimeout(function(){
            me.ModifyTracksOnMap()
        }, 500);
    }

    /**
     * Ajouter une track a la carte
     */
    ModifyTracksOnMap(){
        let me = this
        // Remove all tracks
        this._LayerGroup.eachLayer(function (layer) {
            me._LayerGroup.removeLayer(layer);
        })
        // Si il existe des tracks
        if (this._ListOfTrack.length > 0 ){
            // Zoom in
            this._Map.flyToBounds(this._FitBounds,{'duration':2} )
            let me = this
            this._Map.once('moveend', function() {
                // Add track
                me._ListOfTrack.forEach(Track => {
                    // Track
                    var TrackStyle = {
                        "color": Track.Color,
                        "weight": me._WeightTrack
                    };
                    var layerTrack1=L.geoJSON(Track.GeoJsonData, 
                        {
                            style: TrackStyle, 
                            filter: function(feature, layer) {if (feature.geometry.type == "LineString") return true}, 
                            arrowheads: {frequency: '100px', size: '15m', fill: true}
                        })
                        .bindPopup(me.BuildPopupContentTrack(Track.Name, Track.Length, Track._id, Track.Color))
                        .on('mouseover', function(e) {e.target.setStyle({weight: 8})})
                        .on('mouseout', function (e){e.target.setStyle({weight:me._WeightTrack});})
                        .addTo(me._LayerGroup)
                    layerTrack1.id = Track._id
                    layerTrack1.Type= "Track"
                    // Get Start and end point
                    var numPts = Track.GeoJsonData.features[0].geometry.coordinates.length;
                    var beg = Track.GeoJsonData.features[0].geometry.coordinates[0];
                    var end = Track.GeoJsonData.features[0].geometry.coordinates[numPts-1];
                    // Marker Start
                    var MarkerStart = new L.marker([beg[1],beg[0]], {icon: me._IconPointStartOption}).addTo(me._LayerGroup)
                    MarkerStart.id = Track._id + "start"
                    MarkerStart.Type = "Marker"
                    MarkerStart.dragging.disable();
                    // Marker End
                    var MarkerEnd = new L.marker([end[1],end[0]], {icon: me._IconPointEndOption}).addTo(me._LayerGroup)
                    MarkerEnd.id = Track._id + "end"
                    MarkerEnd.Type = "Marker"
                    MarkerEnd.dragging.disable();
                })
            })
        }
    }

    /**
     * Construit le div du popup d'un track
     * @param {String} Name Nom de la track
     * @param {String} Length longeur de la track
     * @param {String} Id Id de la track
     * @param {String} Color Color de la track
     * @returns Html Div avec contenant l'information de la track
     */
    BuildPopupContentTrack(Name, Length, Id, Color){
        let Div = document.createElement("div")
        Div.setAttribute("Class", "TrackPopupContent")
        // Nom de la track
        Div.appendChild(CoreXBuild.DivTexte(Name,"","TextSmall", ""))
        // Longueur de la track
        Div.appendChild(CoreXBuild.DivTexte(Length + "km","","TextSmall", ""))
        // Boutton change color
        let inputcolor = document.createElement("input")
        Div.appendChild(inputcolor)
        inputcolor.setAttribute("id","PopupColor" + Id)
        inputcolor.setAttribute("type","color")
        inputcolor.setAttribute("style","background-color: white;border-radius: 8px; cursor: pointer; width: 34px; border: 1px solid black; margin-top: 1vh;")
        inputcolor.value = Color
        inputcolor.onchange = (event)=>{this.ChangeTrackColor(event.target.value, Name, Length, Id)}
        return Div
    }

    /**
     * Change la couleur de la track
     * @param {String} Color nouvelle couleur de la track
     * @param {String} Name Nom de la track
     * @param {String} Length longeur de la track
     * @param {String} TrackId Id de la track
     */
    ChangeTrackColor(Color, Name, Length, TrackId){
        let me = this
        this._LayerGroup.eachLayer(function (layer) {
            if (layer.id == TrackId){
                // Changer la couleur de la track
                layer.setStyle({color: Color});
                // Changer le popup de la track
                layer.bindPopup(me.BuildPopupContentTrack(Name, Length, TrackId, Color))
                // Changer la couleur du boutton change color dans le trackInfo
                let ButtonColorInTrackInfo = document.getElementById("color" + TrackId)
                if (ButtonColorInTrackInfo){
                   ButtonColorInTrackInfo.value = Color
                }
            }
        })
        this._ListOfTrack.forEach(Track => {
            if (Track._id == TrackId){
                Track.Color = Color
                
            }
        });
        // Data to send
        let Data = new Object()
        Data.Action = "UpdateTrackColor"
        Data.Data = {Id : TrackId, Color : Color}
        GlobalSendSocketIo("GeoX", "ModuleGeoX", Data)
    }

    ToogleTrack(TrackId){
        let me = this
        // Si TrackId different de null alons cela concerne un track en particulier
        if (TrackId == null){
            if (this._LayerGroup.getLayers().length == 0){
                this._ListOfTrack.forEach(Track => {
                    var TrackStyle = {
                        "color": Track.Color,
                        "weight": me._WeightTrack
                    };
                    var layerTrack1=L.geoJSON(Track.GeoJsonData, {style: TrackStyle, filter: function(feature, layer) {if (feature.geometry.type == "LineString") return true}, arrowheads: {frequency: '80px', size: '18m', fill: true}})
                    .bindPopup(me.BuildPopupContentTrack(Track.Name, Track.Length, Track._id, Track.Color))
                    .on('mouseover', function(e) {e.target.setStyle({weight: 8})})
                    .on('mouseout', function (e) {e.target.setStyle({weight: me._WeightTrack});})
                    .addTo(this._LayerGroup)
                    layerTrack1.id = Track._id
                    layerTrack1.Type= "Track"
                    // Get Start and end point
                    var numPts = Track.GeoJsonData.features[0].geometry.coordinates.length;
                    var beg = Track.GeoJsonData.features[0].geometry.coordinates[0];
                    var end = Track.GeoJsonData.features[0].geometry.coordinates[numPts-1];
                    // Marker Start
                    var MarkerStart = new L.marker([beg[1],beg[0]], {icon: this._IconPointStartOption}).addTo(this._LayerGroup)
                    MarkerStart.id = Track._id + "start"
                    MarkerStart.Type = "Marker"
                    MarkerStart.dragging.disable();
                    // Marker End
                    var MarkerEnd = new L.marker([end[1],end[0]], {icon: this._IconPointEndOption}).addTo(this._LayerGroup)
                    MarkerEnd.id = Track._id + "end"
                    MarkerEnd.Type = "Marker"
                    MarkerEnd.dragging.disable();
                });
            } else {
                // On efface toute les tracks
                this._LayerGroup.clearLayers()
            }
        } else {
            // On chercher la track dans le LayerGroup, si on la trouve on la supprime, si on ne la trouve pas on l'ajoute
            let AddTrack = true
            this._LayerGroup.eachLayer(function (layer) {
                if ((layer.id == TrackId) || (layer.id == TrackId + "start") || (layer.id == TrackId + "end")){
                    me._LayerGroup.removeLayer(layer);
                    AddTrack = false
                }
            })
            if (AddTrack){
                this._ListOfTrack.forEach(Track => {
                    if (Track._id == TrackId){
                        let TrackStyle = {
                            "color": Track.Color,
                            "weight": me._WeightTrack
                        };
                        let layerTrack1=L.geoJSON(Track.GeoJsonData, {style: TrackStyle, filter: function(feature, layer) {if (feature.geometry.type == "LineString") return true}, arrowheads: {frequency: '80px', size: '18m', fill: true}})
                        .bindPopup(me.BuildPopupContentTrack(Track.Name, Track.Length, Track._id, Track.Color))
                        .on('mouseover', function(e) {e.target.setStyle({weight: 8})})
                        .on('mouseout', function (e) {e.target.setStyle({weight: me._WeightTrack});})
                        .addTo(me._LayerGroup)
                        layerTrack1.id = Track._id
                        layerTrack1.Type= "Track"
                        // Get Start and end point
                        let numPts = Track.GeoJsonData.features[0].geometry.coordinates.length;
                        let beg = Track.GeoJsonData.features[0].geometry.coordinates[0];
                        let end = Track.GeoJsonData.features[0].geometry.coordinates[numPts-1];
                        // Marker Start
                        let MarkerStart = new L.marker([beg[1],beg[0]], {icon: this._IconPointStartOption}).addTo(me._LayerGroup)
                        MarkerStart.id = Track._id + "start"
                        MarkerStart.Type = "Marker"
                        MarkerStart.dragging.disable();
                        // Marker End
                        let MarkerEnd = new L.marker([end[1],end[0]], {icon: this._IconPointEndOption}).addTo(me._LayerGroup)
                        MarkerEnd.id = Track._id + "end"
                        MarkerEnd.Type = "Marker"
                        MarkerEnd.dragging.disable();
                    }
                });
            }
        }
    }

    ClickOnBoxTrack (Track){
        let me = this
        // Show Track if not on map
        let TracknotOnMap = true
        this._LayerGroup.eachLayer(function (layer) {
            if (layer.id == Track._id){
                TracknotOnMap = false
            }
        })
        if (TracknotOnMap){
            this._ListOfTrack.forEach(TheTrack => {
                if (TheTrack._id == Track._id){
                    let TrackStyle = {
                        "color": TheTrack.Color,
                        "weight": me._WeightTrack
                    };
                    let layerTrack1=L.geoJSON(TheTrack.GeoJsonData, {style: TrackStyle, filter: function(feature, layer) {if (feature.geometry.type == "LineString") return true}, arrowheads: {frequency: '80px', size: '18m', fill: true}})
                    .bindPopup(me.BuildPopupContentTrack(TheTrack.Name, TheTrack.Length, TheTrack._id, TheTrack.Color))
                    .on('mouseover', function(e) {e.target.setStyle({weight: 8})})
                    .on('mouseout', function (e) {e.target.setStyle({weight: me._WeightTrack});})
                    .addTo(this._LayerGroup)
                    layerTrack1.id = TheTrack._id
                    layerTrack1.Type= "Track"
                    // Get Start and end point
                    let numPts = TheTrack.GeoJsonData.features[0].geometry.coordinates.length;
                    let beg = TheTrack.GeoJsonData.features[0].geometry.coordinates[0];
                    let end = TheTrack.GeoJsonData.features[0].geometry.coordinates[numPts-1];
                    // Marker Start
                    let MarkerStart = new L.marker([beg[1],beg[0]], {icon: this._IconPointStartOption}).addTo(this._LayerGroup)
                    MarkerStart.id = TheTrack._id + "start"
                    MarkerStart.Type = "Marker"
                    MarkerStart.dragging.disable();
                    // Marker End
                    let MarkerEnd = new L.marker([end[1],end[0]], {icon: this._IconPointEndOption}).addTo(this._LayerGroup)
                    MarkerEnd.id = TheTrack._id + "end"
                    MarkerEnd.Type = "Marker"
                    MarkerEnd.dragging.disable();
                }
            });
        }
        let FitboundTrack = [ [Track.ExteriorPoint.MaxLong, Track.ExteriorPoint.MinLat], [Track.ExteriorPoint.MaxLong, Track.ExteriorPoint.MaxLat], [ Track.ExteriorPoint.MinLong, Track.ExteriorPoint.MaxLat ], [ Track.ExteriorPoint.MinLong, Track.ExteriorPoint.MinLat], [Track.ExteriorPoint.MaxLong, Track.ExteriorPoint.MinLat]] 
        this._Map.flyToBounds(FitboundTrack,{'duration':2} )
    }

    ClickOnFollowTrack(Track){
        debugger
        //ToDo
    }

}
// Creation de l'application
let MyGeoX = new GeoX(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Tracks", Icon.GeoXMapIcon(), MyGeoX.Initiation.bind(MyGeoX))