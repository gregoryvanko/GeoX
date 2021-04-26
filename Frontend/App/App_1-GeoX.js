class GeoX {

    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        // App en full screen 
        this._DivApp.style.padding = "0%"
        this._DivApp.style.margin = "0% AUTO"
        
        this._MapId = "mapid"
        this._Map = null
        this._LayerGroup = null
        this._MarkersCluster = null

        this._CurrentPosShowed = false
        this._GpsPointer = null
        this._GpsPointerTrack = null
        this._GpsRadius = null
        this._GpsLineToPosition = null

        // Style for Marker Icon
        this._IconPointOption = L.icon({
            iconUrl: Icon.MarkerBleu(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
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
        // List Of Marker
        this._ListeOfMarkers = []
        // Donnee de construction de la map
        this._InitialMapData = null
        // FitBounds
        this._FitBounds = null
        // InfoBox
        this._InfoBox = null
        // Localisation
        this._GeoLocalisation = null
        // GeoX Track are showed
        this._GeoXTrackShowed = false
        // Padding for corner of map
        this._MapBoundPadding = 0
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
        this._InfoBox = new InfoBox(this._DivApp, this.ToogleTrack.bind(this), this.ClickOnBoxTrack.bind(this), this.ChangeTrackColor.bind(this), this.ClickOnFollowTrack.bind(this), this.CheckboxGroupChange.bind(this), this.ClickOnFollowMarker.bind(this), this.ToogleMarkerOnMap.bind(this), this.ClickSaveGeoXTrackToMyTracks.bind(this), this.GetCornerOfMap.bind(this))
        // Localisation 
        this._GeoLocalisation = new GeoLocalisation(this.ShowPosition.bind(this), this.ErrorPosition.bind(this))
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
        } else if (Value.Action == "SetTracksOfGroup" ){
            // Ajouter les track a _ListOfTrack
            this._ListOfTrack = this._ListOfTrack.concat(Value.Data)
            // Update des track de InfoBox
            this._InfoBox.ListOfTrack = this._ListOfTrack
            // Calcul du Fitbound
            let MinMax = this.MinMaxOfTracks(this._ListOfTrack)
            this._FitBounds = [ [MinMax.MaxLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MaxLat], [ MinMax.MinLong, MinMax.MaxLat ], [ MinMax.MinLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MinLat]]
            // Modifier les track sur la map
            this.ModifyTracksOnMap()
        } else if (Value.Action == "SetAllMarkers" ){
            // Changer le titre du boutton
            document.getElementById("ButtonShowGeoXTracks").innerHTML = "Hide Geox Tracks"
            // Save Marker
            this._ListeOfMarkers = Value.Data
            // Update des Marker de InfoBox
            this._InfoBox.ListeOfMarkers = this._ListeOfMarkers
            // On update l'infobox
            this.UpdateInfoBoxTrackData()
            // On ajoute les marker
            this.AddMarkerOnMap()
            // Changer le statu _GeoXTrackShowed
            this._GeoXTrackShowed = true
        } else if(Value.Action == "SetTrack" ){
            let Track = Value.Data
            Track.Color = "blue"
            if (Value.FollowTrack){
                this.ClickOnFollowTrack(Track, false)
            } else {
                if (Value.WithBound){
                    this.FitboundOnTrack(Track, false)
                } else {
                    this.SetTrackOnMap(Track, false)
                }
            }
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
        this._ListeOfMarkers = []
        this._InitialMapData = null
        this._FitBounds = null
        this._InfoBox = null
        this._CurrentPosShowed = false
        this._GpsPointer = null
        this._GpsPointerTrack = null
        this._GpsRadius = null
        this._GpsLineToPosition = null
        this._GeoLocalisation.StopLocalisation()
        this._GeoLocalisation = null
        this._GeoXTrackShowed = false
        this._MapBoundPadding = 0

        if (this._Map && this._Map.remove) {
            this._Map.off();
            this._Map.remove();
            this._Map = null
            let mapDiv = document.getElementById(this._MapId)
            if(mapDiv) mapDiv.parentNode.removeChild(mapDiv)
            this._LayerGroup = null
            this._MarkersCluster = null
            if (L.Browser.mobile){document.body.style.backgroundColor= "white"}
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
        this._InfoBox.ListOfTrack = this._ListOfTrack
        this._InfoBox.UserGroup = this._UserGroup
        this._DivApp.appendChild(CoreXBuild.ButtonLeftAction(this._InfoBox.InfoBoxToggle.bind(this._InfoBox), "ButtonInfoBoxToggle", `<img src="${Icon.OpenPanel()}" alt="icon" width="25" height="25">`))
        // Ajout du bouton Show GeoX Tracks
        let divButtonShow = CoreXBuild.Div("", "DivCenterTop", "")
        this._DivApp.appendChild(divButtonShow)
        divButtonShow.appendChild(CoreXBuild.Button("Show Geox Tracks", this.ClickShowHideGeoXTracks.bind(this), "Text Button ButtonCenterTop", "ButtonShowGeoXTracks"))

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
        // Build markerClusterGroup
        this._MarkersCluster = L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
                return L.divIcon({ 
                    html: cluster.getChildCount(), 
                    className: 'mycluster', 
                    iconSize: null 
                });
            }
        });
        // Ajout du markerClusterGroup a la map
        this._Map.addLayer(this._MarkersCluster);
        // Map event
        this._Map.on('zoomend', this.UpdateInfoBoxTrackData.bind(this))
        this._Map.on('dragend', this.UpdateInfoBoxTrackData.bind(this))
        // Ajout des tracks sur la map
        let me = this
        setTimeout(function(){
            me.ModifyTracksOnMap()
        }, 500);
    }

    /**
     * Draw track on map
     * @param {Object} Track Object contenant les data d'une track
     * @param {Boolean} MyTrack True si la track est une track du user, false si c'est une track de GeoX
     */
    SetTrackOnMap(Track, MyTrack= true){
        let WeightTrack = this._WeightTrack
        var TrackStyle = {
            "color": Track.Color,
            "weight": WeightTrack
        };
        var layerTrack1 = null
        if (MyTrack){
            layerTrack1=L.geoJSON(Track.GeoJsonData, 
                {
                    style: TrackStyle, 
                    filter: function(feature, layer) {if (feature.geometry.type == "LineString") return true}, 
                    arrowheads: {frequency: '100px', size: '15m', fill: true}
                })
                .bindPopup(this.BuildPopupContentTrack(Track.Name, Track.Length, Track._id, Track.Color))
                .on('mouseover', function(e) {e.target.setStyle({weight: 8})})
                .on('mouseout', function (e){e.target.setStyle({weight:WeightTrack});})
                .addTo(this._LayerGroup)
                layerTrack1.Type= "Track"
        } else {
            layerTrack1=L.geoJSON(Track.GeoJsonData, 
                {
                    style: TrackStyle, 
                    filter: function(feature, layer) {if (feature.geometry.type == "LineString") return true}, 
                    arrowheads: {frequency: '100px', size: '15m', fill: true}
                })
                .bindPopup(this.BuildPopupContentGeoXTrack(Track.Name, Track.Length, Track._id, Track.Color))
                .on('mouseover', function(e) {e.target.setStyle({weight: 8})})
                .on('mouseout', function (e){e.target.setStyle({weight:WeightTrack});})
                .addTo(this._LayerGroup)
                layerTrack1.Type= "GeoXTrack"
        }
        
        layerTrack1.id = Track._id
        
        // Get Start and end point
        var numPts = Track.GeoJsonData.features[0].geometry.coordinates.length;
        var beg = Track.GeoJsonData.features[0].geometry.coordinates[0];
        var end = Track.GeoJsonData.features[0].geometry.coordinates[numPts-1];
        
        if (MyTrack){
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
        } else {
            // que Marker End pour les track GeoX
            var MarkerEnd = new L.marker([end[1],end[0]], {icon: this._IconPointEndOption}).on('click',(e)=>{if(e.originalEvent.isTrusted){this.ToogleMarkerOnMap(Track._id, false)}}).addTo(this._LayerGroup)
            MarkerEnd.id = Track._id + "end"
            MarkerEnd.Type = "GeoXMarker"
            MarkerEnd.dragging.disable();
        }
    }

    /**
     * Fait un FitBound puis draw track on map
     * @param {Object} Track Object contenant les data d'une track
     * @param {Boolean} MyTrack True si la track est une track du user, false si c'est une track de GeoX
     */
    FitboundOnTrack(Track, MyTrack){
        let FitboundTrack = [ [Track.ExteriorPoint.MaxLong, Track.ExteriorPoint.MinLat], [Track.ExteriorPoint.MaxLong, Track.ExteriorPoint.MaxLat], [ Track.ExteriorPoint.MinLong, Track.ExteriorPoint.MaxLat ], [ Track.ExteriorPoint.MinLong, Track.ExteriorPoint.MinLat], [Track.ExteriorPoint.MaxLong, Track.ExteriorPoint.MinLat]] 
        this._Map.flyToBounds(FitboundTrack,{'duration':1})
        let me = this
        this._Map.once('moveend', function(){
            me.SetTrackOnMap(Track, MyTrack)
        })
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
                    me.SetTrackOnMap(Track, true)
                })
            })
        }
    }

    /**
     * Construit le div du popup d'un track du user
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
     * Construit le div du popup d'un track de GeoX community
     * @param {String} Name Nom de la track
     * @param {String} Length longeur de la track
     * @param {String} Id Id de la track
     * @returns Html Div avec contenant l'information de la track
     */
    BuildPopupContentGeoXTrack(Name, Length, Id){
        let Div = document.createElement("div")
        Div.setAttribute("Class", "TrackPopupContent")
        // Nom de la track
        Div.appendChild(CoreXBuild.DivTexte(Name,"","TextSmall", ""))
        // Longueur de la track
        Div.appendChild(CoreXBuild.DivTexte(Length + "km","","TextSmall", ""))
        // Save Track
        Div.appendChild(CoreXBuild.Button (`<img src="${Icon.SaveBlack()}" alt="icon" width="25" height="25">`, this.ClickSaveGeoXTrackToMyTracks.bind(this, Id), "ButtonIcon ButtonIconBlackBorder"))
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

    /**
     * Affiche ou efface une track (ou toutes les tracks)
     * @param {String} TrackId Id de la track (ou null pour toutes les tracks) à montrer/effacer
     */
    ToogleTrack(TrackId){
        let me = this
        // Si TrackId different de null alons cela concerne un track en particulier
        if (TrackId == null){
            if (this._LayerGroup.getLayers().length == 0){
                this._ListOfTrack.forEach(Track => {
                    me.SetTrackOnMap(Track, true)
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
                        this.SetTrackOnMap(Track, true)
                    }
                });
            }
        }
    }

    /**
     * Action effectuee lorsque l'on click sur la box d'un track dans InfoBox
     * L'action est afficher la track si elle n'est pas présente puis zoomer sur la track
     * @param {Object} Track Object contenant les information de la track
     */
    ClickOnBoxTrack (Track, IsMyTrack){
        // Show Track if not on map
        let TracknotOnMap = true
        this._LayerGroup.eachLayer(function (layer) {
            if (layer.id == Track._id){
                TracknotOnMap = false
            }
        })
        if (TracknotOnMap){
            this.SetTrackOnMap(Track, IsMyTrack)
        }
        let FitboundTrack = [ [Track.ExteriorPoint.MaxLong, Track.ExteriorPoint.MinLat], [Track.ExteriorPoint.MaxLong, Track.ExteriorPoint.MaxLat], [ Track.ExteriorPoint.MinLong, Track.ExteriorPoint.MaxLat ], [ Track.ExteriorPoint.MinLong, Track.ExteriorPoint.MinLat], [Track.ExteriorPoint.MaxLong, Track.ExteriorPoint.MinLat]] 
        this._Map.flyToBounds(FitboundTrack,{'duration':2} )
    }

    /**
     * Action effectuee lorsque l'on clique sur le boutton follow de InfoBox
     * @param {Object} Track Object contenant les information de la track
     */
    ClickOnFollowTrack(Track, IsMyTrack){
        let me = this
        // On efface les autres tracks de la map
        this._LayerGroup.eachLayer(function (layer) {
            if (!((layer.id == Track._id) || (layer.id == Track._id + "start") || (layer.id == Track._id + "end"))){
                me._LayerGroup.removeLayer(layer);
            }
        })
        // si InfoBox est affichee, il faut la cacher
        if(this._InfoBox.InfoBowIsShown){
            this._InfoBox.InfoBoxToggle()
        }
        // On cache le bouton InfoBox
        this.SetButtonInfoBoxToggleVisible(false)
        // On cache le boutton ShowGeoXTracks
        this.SetButtonShowGeoXTracksToggleVisible(false)
        // On affiche le menu action
        GlobalDisplayAction('Off')
        // Si la track n'est pas affichée, on l'affiche
        this.ClickOnBoxTrack(Track, IsMyTrack)
        // Start localisation
        this.GpslocalisationToogle()
    }

    /**
     * Action effectuee lorsque l'on clique sur le boutton follow d'un marker
     * @param {String} MarkerId Id du marker à suivre
     */
    ClickOnFollowMarker(MarkerId){
        // Si la track existe on la supprime
        let me = this
        this._LayerGroup.eachLayer(function (layer) {
            if ((layer.id == MarkerId) || (layer.id == MarkerId + "end")){
                me._LayerGroup.removeLayer(layer);
            }
        })
        // Data to send to serveur
        let CallToServer = {Action : "GetTrack", TrackId : MarkerId, WithBound : false, FollowTrack : true}
        // Call Server
        GlobalSendSocketIo("GeoX", "ModuleGeoX", CallToServer)
    }

    /**
     * Affiche ou efface les track d'un group sur la carte
     * @param {String} Group nom du group
     * @param {Boolean} checked Groupe a afficher ou a effacer sur la carte
     */
    CheckboxGroupChange(Group, checked){
        if(checked){
            // Call server to add track of new Group
            let CallToServer = new Object()
            CallToServer.Action = "GetTracksOfGroup"
            CallToServer.Data = Group
            GlobalSendSocketIo("GeoX", "ModuleGeoX", CallToServer)
        } else {
            // Remove track from _ListOfTrack
            this._ListOfTrack = this._ListOfTrack.filter(function( obj ) {
                return obj.Group !== Group;
            });
            // Update de InfoBox
            this._InfoBox.ListOfTrack = this._ListOfTrack
            // Calcul du Fitbound
            let MinMax = this.MinMaxOfTracks(this._ListOfTrack)
            this._FitBounds = [ [MinMax.MaxLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MaxLat], [ MinMax.MinLong, MinMax.MaxLat ], [ MinMax.MinLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MinLat]]
            // Modifier les track sur la map
            this.ModifyTracksOnMap()
        }
    }

    /**
     * Calcule la Lat et Long Min et Max d'un liste de tracks
     * @param {Array} ListOfTracks Liste de toutes les track
     * @returns Object {Minlat, MaxLat, MinLong, MaxLong}
     */
    MinMaxOfTracks(ListOfTracks){
        let reponse = new Object()
        reponse.MinLat = null
        reponse.MaxLat = null
        reponse.MinLong = null
        reponse.MaxLong = null
        ListOfTracks.forEach(element => {
            if(reponse.MinLat == null){
                reponse.MinLat = element.ExteriorPoint.MinLat
            } else {
                if(element.ExteriorPoint.MinLat < reponse.MinLat){reponse.MinLat = element.ExteriorPoint.MinLat}
            }
            if(reponse.MaxLat == null){
                reponse.MaxLat = element.ExteriorPoint.MaxLat
            } else {
                if(element.ExteriorPoint.MaxLat > reponse.MaxLat){reponse.MaxLat = element.ExteriorPoint.MaxLat}
            }
            if(reponse.MinLong == null){
                reponse.MinLong = element.ExteriorPoint.MinLong
            } else {
                if(element.ExteriorPoint.MinLong < reponse.MinLong){reponse.MinLong = element.ExteriorPoint.MinLong}
            }
            if(reponse.MaxLong == null){
                reponse.MaxLong = element.ExteriorPoint.MaxLong
            } else {
                if(element.ExteriorPoint.MaxLong > reponse.MaxLong){reponse.MaxLong = element.ExteriorPoint.MaxLong}
            }
        });
        return reponse
    }

    /**
     * Show / Hide button InfoBoxToggle
     * @param {Boolean} Visible show / Hide
     */
    SetButtonInfoBoxToggleVisible(Visible){
        if (Visible){
            document.getElementById("ButtonInfoBoxToggle").style.display = "block";
        } else {
            document.getElementById("ButtonInfoBoxToggle").style.display = "none";
        }
    }

    /**
     * Update de la position actuelle
     * @param {Object} e GPS Object
     */
    ShowPosition(e){
        if (this._CurrentPosShowed){
            let radius = e.accuracy
            if(this._GpsPointer){this._GpsPointer.setLatLng(e.latlng)}
            if(this._GpsRadius){
                this._GpsRadius.setLatLng(e.latlng)
                this._GpsRadius.setRadius(radius)
            }
            this.CalculateLivePositionOnTrack(e)
        }
    }
    
    /**
     * Show message d'erreur du relevé de la position GPS
     * @param {String} ErrorTxt Message d'erreur
     */
    ErrorPosition(ErrorTxt){
        document.getElementById("ConteneurTxt").style.display = "flex";
        document.getElementById("ConteneurData").style.display = "none";
        document.getElementById("DistanceTxt").innerText = ErrorTxt
    }

    /**
     * View or hide Current position
     */
    GpslocalisationToogle(){
        if (this._CurrentPosShowed){
            // Hide current position
            this._CurrentPosShowed = false
            this._Map.removeLayer(this._GpsPointer)
            this._GpsPointer = null
            this._Map.removeLayer(this._GpsRadius)
            this._GpsRadius = null
            if(this._GpsPointerTrack){
                this._Map.removeLayer(this._GpsPointerTrack)
                this._GpsPointerTrack = null
            }
            if (this._GpsLineToPosition){
                this._Map.removeLayer(this._GpsLineToPosition)
                this._GpsLineToPosition = null
            }
            // Stop Localisation
            this._GeoLocalisation.StopLocalisation()
            // remove box info
            this.HideDistanceInfoBox()
            // On affiche le bouton InfoBox
            this.SetButtonInfoBoxToggleVisible(true)
            // On affiche le bouton ShowGeoXTracks
            this.SetButtonShowGeoXTracksToggleVisible(true)
            // On affiche le menu action
            GlobalDisplayAction('On')
        } else {
            this._CurrentPosShowed = true
            this._GpsRadius = L.circle([50.709446,4.543413], 1).addTo(this._Map)
            this._GpsPointerTrack = L.circle([50.709446,4.543413], 3, {color: "red", fillColor:'red', fillOpacity:1}).addTo(this._Map)
            this._GpsPointer = L.circleMarker([50.709446,4.543413], {radius: 8, weight:4,color: 'white', fillColor:'#0073f0', fillOpacity:1}).addTo(this._Map)
            // Add box info
            this.ShowDistanceInfoBox()
            // Start Localisation
            this._GeoLocalisation.StartLocalisation()
        }
    }

    /**
     * Show de la box avec les info de suivi d'une track
     */
    ShowDistanceInfoBox(){
        // Div du box
        let DivBoxTracks = CoreXBuild.Div("DivBoxDistance", "DivBoxDistance", "")
        this._DivApp.appendChild(DivBoxTracks)
        // Conteneur
        let Conteneur = CoreXBuild.DivFlexRowAr("")
        DivBoxTracks.appendChild(Conteneur)
        // ConteneurTxt
        let ConteneurTxt = CoreXBuild.Div("ConteneurTxt", "", "width: 78%; display:flex; justify-content:center;")
        Conteneur.appendChild(ConteneurTxt)
        ConteneurTxt.appendChild(CoreXBuild.DivTexte("Waiting for GPS position...","DistanceTxt","TextTrackInfo", "color: white; text-align: center;"))
        // ConteneurData
        let ConteneurData = CoreXBuild.DivFlexRowAr("ConteneurData")
        ConteneurData.style.display = "none"
        ConteneurData.style.width = "78%"
        Conteneur.appendChild(ConteneurData)
        // Boutton stop
        let ConteneurStop = CoreXBuild.Div("ConteneurStop", "", "width: 20%; display: flex; flex-direction:column; justify-content:center;")
        Conteneur.appendChild(ConteneurStop)
        ConteneurStop.appendChild(CoreXBuild.Button (`<img src="${Icon.Stop()}" alt="icon" width="30" height="30">`, this.GpslocalisationToogle.bind(this), "ButtonInfoBoxNav", ""))
        // Pourcentage
        let DivProgressRing = CoreXBuild.Div("", "", "width: 38%; display: flex; flex-direction:column; justify-content:flex-start;")
        ConteneurData.appendChild(DivProgressRing)
        DivProgressRing.appendChild(CoreXBuild.ProgressRing({Id:"MyProgressRing", Radius:30, RadiusMobile:30, ScaleText:0.7, TextColor:"white", StrokeColor:"var(--CoreX-color)"}))
        // Div Distance
        let DivDistane = CoreXBuild.Div("", "", "width: 60%; display: flex; flex-direction:column; justify-content:center;")
        ConteneurData.appendChild(DivDistane)
        let DivDone = CoreXBuild.DivFlexRowStart("")
        DivDistane.appendChild(DivDone)
        DivDone.appendChild(CoreXBuild.DivTexte("Done:","","TextTrackInfo", "color: white; text-align:right; width: 40%; margin-right: 1%;"))
        DivDone.appendChild(CoreXBuild.DivTexte("0km","DistaneDone","TextTrackInfo", "color: white; text-align:left; margin-left: 1%;"))
        let DivTotal = CoreXBuild.DivFlexRowStart("")
        DivDistane.appendChild(DivTotal)
        DivTotal.appendChild(CoreXBuild.DivTexte("Total:","","TextTrackInfo", "color: white; text-align:right; width: 40%; margin-right: 1%;"))
        DivTotal.appendChild(CoreXBuild.DivTexte("0km","DistanceTotal","TextTrackInfo", "color: white; text-align:left; margin-left: 1%;"))
        let DivReste = CoreXBuild.DivFlexRowStart("")
        DivDistane.appendChild(DivReste)
        DivReste.appendChild(CoreXBuild.DivTexte("To End:","","TextTrackInfo", "color: white; text-align:right; width: 40%; margin-right: 1%;"))
        DivReste.appendChild(CoreXBuild.DivTexte("0km","DistanceToEnd","TextTrackInfo", "color: white; text-align:left; margin-left: 1%;"))
    }

    /**
     * Hide de la box avec les info de suivi d'une track
     */
    HideDistanceInfoBox(){
        // If TracksInfo existe alors on le supprime
        let DivBoxDistance = document.getElementById("DivBoxDistance")
        if(DivBoxDistance){
            DivBoxDistance.parentNode.removeChild(DivBoxDistance)
        }
    }

    /**
     * Calcul la position actuel sur la track
     * @param {Object} Gps {longitude, latitude} Coordonnee lat et long de la position actuelle
     */
    CalculateLivePositionOnTrack(Gps){
        // get all layer
        var arrayOfLayers = this._LayerGroup.getLayers()
        let MyLayer = arrayOfLayers.filter((x) => {
            if((x.Type== "Track") || (x.Type== "GeoXTrack")){
                return true
            }
        })
        // Verifier si il n'y a qu'une seule track sur la carte
        if(MyLayer.length == 1){
            var layer = MyLayer[0]._layers
            var id = Object.keys(layer)[0]
            var coord = layer[id].feature.geometry.coordinates
            var line = turf.lineString(coord)
            var pt = turf.point([Gps.longitude, Gps.latitude])
            var snapped = turf.nearestPointOnLine(line, pt)
            // Modifier la position du point _GpsPointerTrack
            if (this._GpsPointerTrack){
                this._GpsPointerTrack.setLatLng([snapped.geometry.coordinates[1],snapped.geometry.coordinates[0]])
            } else {
                this._GpsPointerTrack = L.circle([snapped.geometry.coordinates[1],snapped.geometry.coordinates[0]], 3, {color: "red", fillColor:'red', fillOpacity:1}).addTo(this._Map)
            }
            // Si la distance entre la position et la track est plus petite que 40m
            if (snapped.properties.dist < 0.04){
                var DistandceParcourue = Math.round((snapped.properties.location + Number.EPSILON) * 1000) / 1000
                var DistranceTotale = Math.round((turf.length(line) + Number.EPSILON) * 1000) / 1000
                var DistanceToEnd = DistranceTotale - DistandceParcourue
                var DistancePourcent =Math.round(((DistandceParcourue/DistranceTotale) * 100 + Number.EPSILON) * 10) / 10
                if (DistandceParcourue >= 1){
                    DistandceParcourue = DistandceParcourue.toString() + "Km"
                } else {
                    DistandceParcourue = DistandceParcourue * 1000
                    DistandceParcourue = DistandceParcourue.toString()  + "m"
                }
                if (DistranceTotale >= 1){
                    DistranceTotale = DistranceTotale.toString() + "Km"
                } else {
                    DistranceTotale = DistranceTotale * 1000
                    DistranceTotale = DistranceTotale.toString()  + "m"
                }
                if (DistanceToEnd >= 1){
                    DistanceToEnd = DistanceToEnd.toString() + "Km"
                } else {
                    DistanceToEnd = DistanceToEnd * 1000
                    DistanceToEnd = DistanceToEnd.toString()  + "m"
                }
                document.getElementById("ConteneurTxt").style.display = "none";
                document.getElementById("ConteneurData").style.display = "flex";
                document.getElementById("DistanceTxt").innerText = ``
                document.getElementById("DistaneDone").innerText = DistandceParcourue
                document.getElementById("DistanceTotal").innerText = DistranceTotale
                document.getElementById("DistanceToEnd").innerText = DistanceToEnd
                document.getElementById("MyProgressRing").setAttribute('progress', DistancePourcent);
                // retirer la ligne entre la track et la position
                if (this._GpsLineToPosition != null){
                    this._Map.removeLayer(this._GpsLineToPosition)
                    this._GpsLineToPosition = null
                }
            } else {
                var DistandcePosAndTrack = Math.round((snapped.properties.dist + Number.EPSILON) * 1000) / 1000
                if (DistandcePosAndTrack >= 1){
                    DistandcePosAndTrack = DistandcePosAndTrack.toString() + "Km"
                } else {
                    DistandcePosAndTrack = DistandcePosAndTrack * 1000
                    DistandcePosAndTrack = DistandcePosAndTrack.toString()  + "m"
                }
                // afficher que l'on est trop loin
                document.getElementById("ConteneurTxt").style.display = "flex";
                document.getElementById("ConteneurData").style.display = "none";
                document.getElementById("DistanceTxt").innerText = `To fare from the track: ${DistandcePosAndTrack}`
                // afficher la ligne entre la track et la position
                if (this._GpsLineToPosition == null){
                    this._GpsLineToPosition = L.polyline([],{color: 'red', weight: '2', dashArray: '20, 20', dashOffset: '0'}).addTo(this._Map)
                }
                this._GpsLineToPosition.setLatLngs([])
                this._GpsLineToPosition.addLatLng(L.latLng([Gps.latitude,Gps.longitude]))
                this._GpsLineToPosition.addLatLng(L.latLng([snapped.geometry.coordinates[1],snapped.geometry.coordinates[0]]))
            }
        } else {
            // afficher qu'il y a plus que un layer
            document.getElementById("ConteneurTxt").style.display = "flex";
            document.getElementById("ConteneurData").style.display = "none";
            document.getElementById("DistanceTxt").innerText = `Show only one track to follow on map`
            // retirer la ligne entre la track et la position
            if (this._GpsLineToPosition != null){
                this._Map.removeLayer(this._GpsLineToPosition)
                this._GpsLineToPosition = null
            }
            // retirer le _GpsPointerTrack
            if (this._GpsPointerTrack != null){
                this._Map.removeLayer(this._GpsPointerTrack)
                this._GpsPointerTrack = null
            }
        }
    }

    /**
     * Show / Hide button ShowGeoXTracks
     * @param {Boolean} Visible show / Hide
     */
    SetButtonShowGeoXTracksToggleVisible(Visible){
        if (Visible){
            document.getElementById("ButtonShowGeoXTracks").style.display = "block";
        } else {
            document.getElementById("ButtonShowGeoXTracks").style.display = "none";
        }
    }

    /**
     * Click on Show / Hide Geox community Track button
     */
    ClickShowHideGeoXTracks(){
        // Changer le titre du boutton
        document.getElementById("ButtonShowGeoXTracks").innerHTML = "waiting"
        // Si les GeoX track sont affichee on les retire
        if (this._GeoXTrackShowed){
            let me = this
            // On delete les marker si ils existent
            this._MarkersCluster.eachLayer(function(layer) {
                me._MarkersCluster.removeLayer(layer)
            })
            // Remove all tracks
            this._LayerGroup.eachLayer(function (layer) {
                if ((layer.Type== "GeoXTrack")|| (layer.Type== "GeoXMarker")){
                    me._LayerGroup.removeLayer(layer);
                }
            })
            // Save Marker list
            this._ListeOfMarkers = null
            // Update des Marker de InfoBox
            this._InfoBox.ListeOfMarkers = this._ListeOfMarkers
            // If InfoBox showed on l'efface
            this.UpdateInfoBoxTrackData()
            // Changer le statu _GeoXTrackShowed
            this._GeoXTrackShowed = false
            // Changer le titre du boutton
            document.getElementById("ButtonShowGeoXTracks").innerHTML = "Show Geox Tracks"
        } else {
            // Data to send
            let CallToServer = {Action: "GetMarkers"}
            // Call Server
            GlobalSendSocketIo("GeoX", "ModuleGeoX", CallToServer)
        }
    }

    /**
     * Add Marker for GeoX Track
     */
    AddMarkerOnMap(){
        // On delete les marker si ils existent
        let me = this
        this._MarkersCluster.eachLayer(function(layer) {
            me._MarkersCluster.removeLayer(layer)
        })
        // On affiche les marker
        this._ListeOfMarkers.forEach(Marker => {
            let newMarker = new L.marker([Marker.StartPoint.Lat, Marker.StartPoint.Lng], {icon: this._IconPointOption}).on('click',(e)=>{if(e.originalEvent.isTrusted){this.ToogleMarkerOnMap(Marker._id, false)}})
            this._MarkersCluster.addLayer(newMarker);
        });
    }

    /**
     * Hide / Show Geox Track
     * @param {String} TrackId Id of the track to show / hide
     */
    ToogleMarkerOnMap(TrackId, WithBound = false){
        let TrackNotOnMap = true
        let me = this
        this._LayerGroup.eachLayer(function (layer) {
            if ((layer.id == TrackId) || (layer.id == TrackId + "end")){
                me._LayerGroup.removeLayer(layer);
                TrackNotOnMap = false
            }
        })
        // Creation de la track si elle n'est pas sur la map
        if (TrackNotOnMap){
            // Data to send
            let CallToServer = {Action : "GetTrack", TrackId : TrackId, WithBound : WithBound, FollowTrack : false}
            // Call Server
            GlobalSendSocketIo("GeoX", "ModuleGeoX", CallToServer)
        }
    }

    /**
     * Click on save GeoX Track to my track
     * @param {String} TrackId Id of the track to show / hide
     */
    ClickSaveGeoXTrackToMyTracks(TrackId){
        event.stopPropagation()
        this._Map.closePopup()
        this.BuildSaveTrackVue(TrackId)
    }

    /**
     * Build save track view
     * @param {String} TrackId Id de la track a souver
     */
    BuildSaveTrackVue(TrackId){
        let Content = CoreXBuild.DivFlexColumn("")
        // Empty space
        Content.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Titre
        Content.append(CoreXBuild.DivTexte("Save Track", "", "SousTitre"))
        // Input Name
        Content.appendChild(CoreXBuild.InputWithLabel("InputBoxCoreXWondow", "Track Name:", "Text", "InputTrackName","", "Input Text", "text", "Name","",true))
        // Input `Group
        Content.appendChild(CoreXBuild.InputWithLabel("InputBoxCoreXWondow", "Track Group:", "Text", "InputTrackGroup","", "Input Text", "text", "Group","",true))
        // Toggle Public
        let DivTooglePublic = CoreXBuild.Div("","Text InputBoxCoreXWondow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Content.appendChild(DivTooglePublic)
        DivTooglePublic.appendChild(CoreXBuild.DivTexte("Public Track:", "", "", ""))
        DivTooglePublic.appendChild(CoreXBuild.ToggleSwitch("TogglePublic", true))
        // Error Text
        Content.appendChild(CoreXBuild.DivTexte("", "ErrorSaveTrack", "Text", "Color: red; margin-top: 2vh; height: 4vh;"))
        // Div Button
        let DivButton = CoreXBuild.DivFlexRowAr("")
        Content.appendChild(DivButton)
        // Button save
        DivButton.appendChild(CoreXBuild.Button("Save",this.SaveTrackToMyTracks.bind(this, TrackId),"Text Button ButtonWidth30", "SaveTrack"))
        // Button cancel
        DivButton.appendChild(CoreXBuild.Button("Cancel",this.CancelTrackToMyTracks.bind(this),"Text Button ButtonWidth30", "Cancel"))
        // Empty space
        Content.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Open Window
        CoreXWindow.BuildWindow(Content)
        // Add AutoComplete
        let me = this
        autocomplete({
            input: document.getElementById("InputTrackGroup"),
            minLength: 1,
            emptyMsg: 'No suggestion',
            fetch: function(text, update) {
                text = text.toLowerCase();
                var GroupFiltred = me._UserGroup.filter(n => n.toLowerCase().startsWith(text))
                var suggestions = []
                GroupFiltred.forEach(element => {
                    var MyObject = new Object()
                    MyObject.label = element
                    suggestions.push(MyObject)
                });
                update(suggestions);
            },
            onSelect: function(item) {
                document.getElementById("InputTrackGroup").value = item.label;
            }
        });
    }

    /**
     * Cancel Save track view
     */
    CancelTrackToMyTracks(){
        CoreXWindow.DeleteWindow()
    }

    /**
     * Send save GeoX track to my track action
     * @param {String} TrackId Id de la track a sauver
     */
    SaveTrackToMyTracks(TrackId){
        if ((document.getElementById("InputTrackName").value != "") && (document.getElementById("InputTrackGroup").value != "")){
            document.getElementById("ErrorSaveTrack").innerText = ""
            // Data to send
            let CallToServer = new Object()
            CallToServer.Action = "SaveTrack"
            CallToServer.TrackId = TrackId
            CallToServer.Name = document.getElementById("InputTrackName").value 
            CallToServer.Group = document.getElementById("InputTrackGroup").value 
            CallToServer.Public = document.getElementById("TogglePublic").checked 
            // Call Server
            GlobalSendSocketIo("GeoX", "ModuleGeoX", CallToServer)
            // Delete Window
            CoreXWindow.DeleteWindow()
        } else {
            document.getElementById("ErrorSaveTrack").innerText = "Enter a name and a group before saving"
        }
    }

    /**
     * Get Corener of map
     * @returns Object Corener
     */
    GetCornerOfMap(){
        let Corner = new Object()
        Corner.NW = this._Map.getBounds().pad(this._MapBoundPadding).getNorthWest()
        Corner.NE = this._Map.getBounds().pad(this._MapBoundPadding).getNorthEast()
        Corner.SE = this._Map.getBounds().pad(this._MapBoundPadding).getSouthEast()
        Corner.SW = this._Map.getBounds().pad(this._MapBoundPadding).getSouthWest()
        return Corner
    }

    /**
     * Update des InfoBox data concernant les track si l'infobox est montree sur la map
     */
    UpdateInfoBoxTrackData(){
        this._InfoBox.UpdateInfoboxTrackData()
    }

}
// Creation de l'application
let MyGeoX = new GeoX(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Tracks", Icon.GeoXMapIcon(), MyGeoX.Initiation.bind(MyGeoX))