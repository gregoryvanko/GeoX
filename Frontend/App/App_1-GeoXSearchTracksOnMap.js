class GeoXSearchTracksOnMap {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        // App en full screen 
        this._DivApp.style.padding = "0%"
        this._DivApp.style.margin = "0% AUTO"

        this._MapId = "mapid"
        this._MapBoundPadding = 0
        this._ListeOfMarkers = null
        this._ListeOfTracksOnMap = []
        this._InitLat = "50.709446"
        this._InitLong = "4.543413"
        this._Map = null
        this._TrackGroup = null
        this._MyGroups = []
        this._WeightTrack = (L.Browser.mobile) ? 5 : 3
        this._TrackStyle = {"color": "blue", "weight": this._WeightTrack}
        this._Arrowheads = {frequency: '100px', size: '15m', fill: true}
        this._IconPointOption = L.icon({
            iconUrl: Icon.MarkerBleu(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
        this._IconPointStartOption = L.icon({
            iconUrl: Icon.MarkerVert(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
        this._IconPointEndOption = L.icon({
            iconUrl: Icon.MarkerRouge(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
    }

    Initiation(){
        // Show Action Button
        GlobalDisplayAction('On')
        GlobalClearActionList(this.DeleteMap.bind(this))
        // Clear view
        this._DivApp.innerHTML=""
        // SocketIO
        let SocketIo = GlobalGetSocketIo()
        SocketIo.on('GeoXError', (Value) => {this.Error(Value)})
        SocketIo.on('SearchTracksOnMap', (Value) => {this.MessageRecieved(Value)})
        // Load Data
        this.LoadViewGetAppData()
    }

    MessageRecieved(Value){
        if (Value.Action == "SetUserGroup"){
            this._MyGroups = Value.Data
            this.LoadView()
        } else if (Value.Action == "SetAllMarkers" ){
            this._ListeOfMarkers = Value.Data
            this.TrackInfoBoxUpdate()
            this.AddMarkerOnMap()
        } else if(Value.Action == "SetTrack" ){
            this.SetTrackOnMap(Value.Data)
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
        this.DeleteMap()
        // Clear view
        this._DivApp.innerHTML=""
        // Add conteneur
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Add Error Text
        Conteneur.appendChild(CoreXBuild.DivTexte(ErrorMsg,"","Text", "text-align: center; color: red; margin-top: 20vh;"))
    }

    /** Load des Data de l'application */
    LoadViewGetAppData(){
        // Clear view
        this._DivApp.innerHTML=""
        // Contener
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Titre de l'application
        Conteneur.appendChild(CoreXBuild.DivTexte("GeoX", "", "Titre"))
        // on construit le texte d'attente
        Conteneur.appendChild(CoreXBuild.DivTexte("Waiting server data...","","Text", "text-align: center; margin-top: 10vh;"))
        // Send status to serveur
        let CallToServer = new Object()
        CallToServer.Action = "GetUserGroup"
        GlobalSendSocketIo("GeoX", "SearchTracksOnMap", CallToServer)
    }

    LoadView(){
        // Clear view
        this._DivApp.innerHTML=""
        // mettre le backgroundColor du body à Black pour la vue Iphone
        if (L.Browser.mobile){document.body.style.backgroundColor= "black"}
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Ajout du div qui va contenir la map
        this._DivApp.appendChild(CoreXBuild.Div(this._MapId, "", "height: 100vh; width: 100%;"))
        // Parametre de la carte
        let CenterPoint = {Lat: this._InitLat, Long: this._InitLong}
        let zoom = 8
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
        this._Map = L.map(this._MapId , {zoomControl: false, layers: [Openstreetmap]}).setView([CenterPoint.Lat, CenterPoint.Long], zoom);
        L.control.zoom({position: 'bottomright'}).addTo(this._Map);
        L.control.layers(baseLayers,null,{position: 'bottomright'}).addTo(this._Map);
        // Add layer
        this._TrackGroup = L.layerGroup().addTo(this._Map)
        // Map event
        this._Map.on('zoomend', this.TrackInfoBoxUpdate.bind(this))
        this._Map.on('dragend', this.TrackInfoBoxUpdate.bind(this))
        // Create Waiting Box
        this.WaitingBoxCreate()
        // Create Track Info Box
        this.TrackInfoBoxCreate()
        // Get all Markers
        this.CallServerGetMarkers()
    }

    WaitingBoxCreate(){
        // Div du box
        let DivBoxTracks = CoreXBuild.Div("DivBoxInfoTxt", "DivBoxInfoTxt", "")
        this._DivApp.appendChild(DivBoxTracks)
        // Texte
        DivBoxTracks.appendChild(CoreXBuild.DivTexte("Waiting for data...","","Text", "color: white; text-align: center;"))
    }

    WaitingBoxShow(){
        document.getElementById("DivBoxInfoTxt").style.display = "flex"
    }

    WaitingBoxHide(){
        setTimeout(()=>{document.getElementById("DivBoxInfoTxt").style.display = "none"}, 200)
    }

    TrackInfoBoxCreate(){
        // Div du box
        let DivTrackInfoBox = CoreXBuild.Div("DivTrackInfoBox", "DivBoxTracks", "padding: 1vh; -webkit-box-sizing: border-box;-moz-box-sizing: border-box; box-sizing: border-box;")
        if (L.Browser.mobile){
            // Ajout du bouton action left
            this._DivApp.appendChild(CoreXBuild.ButtonLeftAction(this.TrackInfoBoxShow.bind(this), "ButtonShowTrackInfo", `<img src="${Icon.OpenPanel()}" alt="icon" width="25" height="25">`))
            // show boutton action set track info visible
            this.SetButtonShowTrackInfoVisible(true)
            // Add Close Panel Panel button
            DivTrackInfoBox.appendChild(CoreXBuild.Button (`<img src="${Icon.ClosePanel()}" alt="icon" width="30" height="30">`, this.TrackInfoBoxHide.bind(this), "ButtonClosePanel", ""))
            // Div empty
            DivTrackInfoBox.appendChild(CoreXBuild.Div("", "", "height:4vh;"))
        } else {
            // Show TrackInfoBox
            DivTrackInfoBox.classList.add("DivBoxTracksShow")
        }
        let DivTrackInfoBoxContent = CoreXBuild.Div("DivTrackInfoBoxContent", "", "display: -webkit-flex; display: flex; flex-direction: column; justify-content:start; align-content:center; align-items: center; -webkit-box-sizing: border-box;-moz-box-sizing: border-box; box-sizing: border-box; width: 100%;")
        DivTrackInfoBox.appendChild(DivTrackInfoBoxContent)
        // Add text no Track
        DivTrackInfoBoxContent.append(CoreXBuild.DivTexte("No Track", "", "TextTrackInfo", "color: white"))
        // Add event for transition end
        DivTrackInfoBox.addEventListener('transitionend',this.TrackInfoBoxTransitionEnd.bind(this))
        // Add track info box in DivApp
        this._DivApp.appendChild(DivTrackInfoBox)
    }

    TrackInfoBoxTransitionEnd(){
        if (!document.getElementById("DivTrackInfoBox").classList.contains("DivBoxTracksShow")){
            // show boutton action set track info visible
            this.SetButtonShowTrackInfoVisible(true)
        }
    }

    TrackInfoBoxShow(){
        // hide boutton
        this.SetButtonShowTrackInfoVisible(false)
        document.getElementById("DivTrackInfoBox").classList.add("DivBoxTracksShow")
    }

    TrackInfoBoxHide(){
        document.getElementById("DivTrackInfoBox").classList.remove("DivBoxTracksShow")
    }

    SetButtonShowTrackInfoVisible(Visible){
        if (Visible){
            document.getElementById("ButtonShowTrackInfo").style.display = "block";
        } else {
            document.getElementById("ButtonShowTrackInfo").style.display = "none";
        }
    }

    TrackInfoBoxUpdate(){
        // Clear du track info box
        let DivTrackInfoBox = document.getElementById("DivTrackInfoBoxContent")
        DivTrackInfoBox.innerHTML = ""
        if (this._ListeOfMarkers.length == 0){
            // on affiche un message No Track
            DivTrackInfoBox.append(CoreXBuild.DivTexte("No Track", "", "TextTrackInfo", "color: white"))
        } else {
            let NoTraclShowed = true
            let Corner = this.GetCornerOfMap()
            let polyCorner = turf.polygon([[
                [Corner.NW.lat, Corner.NW.lng],
                [Corner.NE.lat, Corner.NE.lng],
                [Corner.SE.lat, Corner.SE.lng],
                [Corner.SW.lat, Corner.SW.lng],
                [Corner.NW.lat, Corner.NW.lng]]]);
            // On affiche les track
            this._ListeOfMarkers.forEach(Marker => {
                let point = turf.point([Marker.StartPoint.Lat, Marker.StartPoint.Lng]);
                if (turf.booleanWithin(point, polyCorner)){
                    NoTraclShowed = false
                    // Box pour toutes les info d'un track
                    let DivBoxTrackInfoConteneur = CoreXBuild.DivFlexRowStart("")
                    DivTrackInfoBox.append(DivBoxTrackInfoConteneur)
                    DivBoxTrackInfoConteneur.classList.add("DivBoxTrackInfo")
                    DivBoxTrackInfoConteneur.style.cursor = "pointer"
                    //DivBoxTrackInfoConteneur.style.boxSizing= "border-box"
                    DivBoxTrackInfoConteneur.addEventListener('click', this.ToogleOneTrackOnMap.bind(this, Marker._id))
                    // Nom de la track
                    DivBoxTrackInfoConteneur.appendChild(CoreXBuild.DivTexte(Marker.Name,"","TextTrackInfo", "color: white; width: 40%; margin-left: 2%;"))
                    // Longeur de la track
                    DivBoxTrackInfoConteneur.appendChild(CoreXBuild.DivTexte(Marker.Length.toFixed(1) + "Km","","TextTrackInfo", "color: white; width: 30%; margin-left: 1vh;"))
                    // Save Marker
                    DivBoxTrackInfoConteneur.appendChild(CoreXBuild.Button (`<img src="${Icon.SaveBlack()}" alt="icon" width="25" height="25">`, this.ClickSaveTrackToMyTracks.bind(this, Marker._id), "ButtonIcon"))
                }
            });
            if (NoTraclShowed){
                // on affiche un message No Track
                DivTrackInfoBox.append(CoreXBuild.DivTexte("No Track in this area", "", "TextTrackInfo", "color: white"))
            }
        }
    }

    GetCornerOfMap(){
        let Corner = new Object()
        Corner.NW = this._Map.getBounds().pad(this._MapBoundPadding).getNorthWest()
        Corner.NE = this._Map.getBounds().pad(this._MapBoundPadding).getNorthEast()
        Corner.SE = this._Map.getBounds().pad(this._MapBoundPadding).getSouthEast()
        Corner.SW = this._Map.getBounds().pad(this._MapBoundPadding).getSouthWest()
        return Corner
    }

    CallServerGetMarkers(){
        // Show waiting box
        this.WaitingBoxShow()
        // Data to send
        let CallToServer = new Object()
        CallToServer.Action = "GetMarkers"
        // Call Server
        GlobalSendSocketIo("GeoX", "SearchTracksOnMap", CallToServer)
    }

    AddMarkerOnMap(){
        // Build markerClusterGroup
        let markersCluster = L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
                return L.divIcon({ 
                    html: cluster.getChildCount(), 
                    className: 'mycluster', 
                    iconSize: null 
                });
            }
        });
        // On affiche les marker
        this._ListeOfMarkers.forEach(Marker => {
            let newMarker = new L.marker([Marker.StartPoint.Lat, Marker.StartPoint.Lng], {icon: this._IconPointOption}).on('click',(e)=>{if(e.originalEvent.isTrusted){this.ToogleOneTrackOnMap(Marker._id)}})
            markersCluster.addLayer(newMarker);
        });
        // Ajout du markerClusterGroup a la map
        this._Map.addLayer(markersCluster);
        // Hide waiting Box
        this.WaitingBoxHide()
    }

    CalculMinDistanceBetweenTrackBoundAndScreen(Track){
        let North = this._Map.getBounds().pad(this._MapBoundPadding).getNorth()
        let South = this._Map.getBounds().pad(this._MapBoundPadding).getSouth()
        let West = this._Map.getBounds().pad(this._MapBoundPadding).getWest()
        let East = this._Map.getBounds().pad(this._MapBoundPadding).getEast()

        let TrackNorth = Track.ExteriorPoint.MaxLong
        let TrackSouth = Track.ExteriorPoint.MinLong
        let TrackWest = Track.ExteriorPoint.MinLat
        let TrackEast = Track.ExteriorPoint.MaxLat

        let min = 0
        if((North - TrackNorth) < 0){min = -1}
        if((East - TrackEast) < 0){min = -2}
        if((South - TrackSouth) > 0){min = -3}
        if((West - TrackWest) > 0){min = -4}
        return min
    }

    CallServerGetTrack(TrackId){
        // Data to send
        let CallToServer = new Object()
        CallToServer.Action = "GetTrack"
        CallToServer.TrackId = TrackId
        // Call Server
        GlobalSendSocketIo("GeoX", "SearchTracksOnMap", CallToServer)
    }

    ToogleOneTrackOnMap(TrackId){
        let TrackNotOnMap = true
        // Remove the track if this track is on the map
        this._ListeOfTracksOnMap.forEach(Track => {
            if (Track._id == TrackId){
                TrackNotOnMap = false
                // Remove track of ListeOfTracksOnMap
                this._ListeOfTracksOnMap = this._ListeOfTracksOnMap.filter((item)=>{return item._id != Track._id})
                // Remove track of layer
                let me = this
                this._TrackGroup.eachLayer(function (layer) {
                    if ((layer.id == TrackId) || (layer.id == TrackId + "end")){
                        me._TrackGroup.removeLayer(layer);
                    }
                })
            }
        });
        // Creation de la track si elle n'est pas sur la map
        if (TrackNotOnMap){
            this.CallServerGetTrack(TrackId)
        }
    }

    SetTrackOnMap(Track){
        let MinDistance = this.CalculMinDistanceBetweenTrackBoundAndScreen(Track) 
        if (MinDistance < 0){
            // Execute FitBound and after shox track
            this.FitboundOnTrack(Track)
        } else {
            // No FitBound but show track
            this.DrawTrack(Track)
        }
    }

    FitboundOnTrack(Track){
        let FitboundTrack = [ [Track.ExteriorPoint.MaxLong, Track.ExteriorPoint.MinLat], [Track.ExteriorPoint.MaxLong, Track.ExteriorPoint.MaxLat], [ Track.ExteriorPoint.MinLong, Track.ExteriorPoint.MaxLat ], [ Track.ExteriorPoint.MinLong, Track.ExteriorPoint.MinLat], [Track.ExteriorPoint.MaxLong, Track.ExteriorPoint.MinLat]] 
        this._Map.flyToBounds(FitboundTrack,{'duration':1})
        let me = this
        this._Map.once('moveend', function(){
            me.DrawTrack(Track)
        })
    }

    DrawTrack(Track){
        let WeightTrack = this._WeightTrack
        var layerTrack1=L.geoJSON(Track.GeoJsonData, {style: this._TrackStyle, arrowheads: this._Arrowheads})
        .bindPopup(this.BuildPopupContentTrack(Track))
        .on('mouseover', function(e) {e.target.setStyle({weight: 8})})
        .on('mouseout', function (e) {e.target.setStyle({weight: WeightTrack });})
        .addTo(this._TrackGroup);

        layerTrack1.id = Track._id
        layerTrack1.Type= "Track"
        // Get End point
        let end = null
        if (Track.GeoJsonData.features[0].geometry.type == "LineString"){
            let numPts = Track.GeoJsonData.features[0].geometry.coordinates.length;
            end = Track.GeoJsonData.features[0].geometry.coordinates[numPts-1];
        } else {
            if (Track.GeoJsonData.features[0].geometry.coordinates[0][0]){
                let numPts1 = Track.GeoJsonData.features[0].geometry.coordinates.length;
                let numPts = Track.GeoJsonData.features[0].geometry.coordinates[numPts1-1].length;
                end = Track.GeoJsonData.features[0].geometry.coordinates[numPts1-1][numPts - 1];
            }
        }
        if (end != null){
            // Marker End
            var MarkerEnd = new L.marker([end[1],end[0]], {icon: this._IconPointEndOption})
            .on('click', (e)=>{if (e.originalEvent.isTrusted){this.ToogleOneTrackOnMap(Track._id)}})
            .addTo(this._TrackGroup);

            MarkerEnd.id = Track._id + "end"
            MarkerEnd.Type = "Marker"
            MarkerEnd.dragging.disable()
        } else {
            console.log("Error during drawing last Marker of track : " +Track.Name)
        }

        // Draw Tracks Bound
        //this.DrawTracksBound(Track)

        // Add this track on ListeOfTracksOnMap
        this._ListeOfTracksOnMap.push(Track)
    }

    BuildPopupContentTrack(Track){
        let Div = document.createElement("div")
        Div.setAttribute("Class", "TrackPopupContent")
        // Nom de la track
        Div.appendChild(CoreXBuild.DivTexte(Track.Name,"","TextSmall", ""))
        // Longueur de la track
        Div.appendChild(CoreXBuild.DivTexte(Track.Length + "km","","TextSmall", ""))
        // Save Track
        Div.appendChild(CoreXBuild.Button (`<img src="${Icon.SaveBlack()}" alt="icon" width="25" height="25">`, this.ClickSaveTrackToMyTracks.bind(this, Track._id), "ButtonIcon ButtonIconBlackBorder"))
        return Div
    }

    ClickSaveTrackToMyTracks(TrackId){
        event.stopPropagation()
        this._Map.closePopup()
        this.BuildSaveTrackVue(TrackId)
    }

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
                var GroupFiltred = me._MyGroups.filter(n => n.toLowerCase().startsWith(text))
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

    CancelTrackToMyTracks(){
        CoreXWindow.DeleteWindow()
    }

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
            GlobalSendSocketIo("GeoX", "SearchTracksOnMap", CallToServer)
            // Delete Window
            CoreXWindow.DeleteWindow()
        } else {
            document.getElementById("ErrorSaveTrack").innerText = "Enter a name and a group before saving"
        }
    }

    DrawCornerOfMap(Corner){
        let BoundsOfMap = L.polyline([]).addTo(this._Map)
        BoundsOfMap.addLatLng(L.latLng(Corner.NW))
        BoundsOfMap.addLatLng(L.latLng(Corner.NE))
        BoundsOfMap.addLatLng(L.latLng(Corner.SE))
        BoundsOfMap.addLatLng(L.latLng(Corner.SW))
        BoundsOfMap.addLatLng(L.latLng(Corner.NW))
    }
    DrawTracksBound(Track){
        let BoundsOfMap = L.polyline([]).addTo(this._Map)
        BoundsOfMap.addLatLng({lat: Track.ExteriorPoint.MinLong, lng: Track.ExteriorPoint.MinLat})
        BoundsOfMap.addLatLng({lat: Track.ExteriorPoint.MaxLong, lng: Track.ExteriorPoint.MinLat})
        BoundsOfMap.addLatLng({lat: Track.ExteriorPoint.MaxLong, lng: Track.ExteriorPoint.MaxLat})
        BoundsOfMap.addLatLng({lat: Track.ExteriorPoint.MinLong, lng: Track.ExteriorPoint.MaxLat})
        BoundsOfMap.addLatLng({lat: Track.ExteriorPoint.MinLong, lng: Track.ExteriorPoint.MinLat})
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
            this._ListeOfMarkers = null
            this._ListeOfTracksOnMap = []
            this._InitLat = "50.709446"
            this._InitLong = "4.543413"
            this._TrackGroup = null
            this._MyGroups = []
            // mettre le backgroundColor du body à Black pour la vue Iphone
            if (L.Browser.mobile){document.body.style.backgroundColor= "white"}
        }
    }
}

// Creation de l'application
let MyGeoXSearchTracksOnMap = new GeoXSearchTracksOnMap(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Search Tracks in GeoX", Icon.GeoXSearchTracksOnMap(), MyGeoXSearchTracksOnMap.Initiation.bind(MyGeoXSearchTracksOnMap))