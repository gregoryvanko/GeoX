class GeoXCreateTrack {

    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        // App en full screen 
        this._DivApp.style.padding = "0%"
        this._DivApp.style.margin = "0% AUTO"
        
        this._MapId = "mapid"
        this._InitLat = "50.709446"
        this._InitLong = "4.543413"
        this._Map = null
        this._Polyline = null
        this._MarkerGroup = null
        this._DragpointNb = 0
        this._DragPolyline = null
        this._DragPolylineNb = 0
        this._AllowClick = true
        this._TrackId = null
        this._TrackName = "Rixensart"
        this._TrackGroup = "Planned"
        this._TrackPublic = true
        this._TrackMarkers = []
        this._AutoRouteBehavior = true
        this.CityFound = false
        this._UserGroup = null
        this._GroupSelected = null
        this._NoTrack = "No Folder selected"
        this._DataMap = null
        this._LayerGroup = null

        this._IconPointOption = L.icon({
            iconUrl: Icon.MarkerBleu(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });

        // ElevationBox
        this._ElevationBox = null
        this._GpsPointer = null
    }

    Initiation(){
        // Show Action Button
        GlobalDisplayAction('On')
        // Execute before quit
        GlobalExecuteBeforeQuit(this.DeleteMap.bind(this))
        // Clear Action List
        GlobalClearActionList()
        // Clear view
        this._DivApp.innerHTML=""
        // SocketIO
        let SocketIo = GlobalGetSocketIo()
        SocketIo.on('GeoXError', (Value) => {this.Error(Value)})
        SocketIo.on('CreateTracksOnMap', (Value) => {this.MessageRecieved(Value)})
        // Get User Group
        let CallToServer = new Object()
        CallToServer.Action = "GetUserGroup"
        GlobalSendSocketIo("GeoX", "CreateTracksOnMap", CallToServer)
        // Start view
        this.Start()
    }

    MessageRecieved(Value){
        if (Value.Action == "SetUserGroup"){
            this._UserGroup = Value.Data
        } else if (Value.Action == "SetMapData" ){
            this._DataMap = Value.Data
            this.ModifyTracksOnMap()
        } else if (Value.Action == "TrackSaved" ){
            // Delete save window
            CoreXWindow.DeleteWindow()
            // Delete Map
            this.DeleteMap()
            // Go To Home
            GlobalStart()
        } else if (Value.Action == "SetTrackFromGeoJson" ) {
            this.AddTrackToModifyOnMap(Value.Data)
        } else if (Value.Action == "SetElevation" ) {
            this._ElevationBox.UpdateGraph(Value.Data)
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

    Start(){
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        let Conteneur = CoreXBuild.DivFlexColumn()
        this._DivApp.appendChild(Conteneur)
        Conteneur.style.height = "70vh"
        Conteneur.style.justifyContent = "center"
        // Texte
        Conteneur.appendChild(CoreXBuild.DivTexte("Choose your location", "", "SousTitre", ""))
        // dropdown Pays
        let divdropdown = CoreXBuild.Div("", "DivDropDownPays", "")
        Conteneur.appendChild(divdropdown)
        let DropDown = document.createElement("select")
        DropDown.setAttribute("id", "InputCountry")
        DropDown.setAttribute("class", "Text MapGroupDropDown")
        let option1 = document.createElement("option")
        option1.setAttribute("value", "Belgique")
        option1.innerHTML = "Belgique"
        DropDown.appendChild(option1)
        let option2 = document.createElement("option")
        option2.setAttribute("value", "France")
        option2.innerHTML = "France"
        DropDown.appendChild(option2)
        divdropdown.appendChild(DropDown)
        // Input City
        let DivInput = CoreXBuild.Div("", "InputCity", "")
        Conteneur.appendChild(DivInput)
        let InputCity = CoreXBuild.Input("InputCity", "", "Input Text", "padding: 4%;", "text", "InputCity", "City")
        DivInput.appendChild(InputCity)
        InputCity.autocomplete = "off"
        let me = this
        autocomplete({
            input: document.getElementById("InputCity"),
            minLength: 3,
            debounceWaitMs: 200,
            emptyMsg: 'No suggestion',
            fetch: function(text, update) {
                if (document.getElementById("InputCountry").value == "Belgique"){
                    fetch(`https://www.odwb.be/api/records/1.0/search/?dataset=code-postaux-belge&q=${text}`).then((response) => {
                        response.json().then((data) =>{
                            var suggestions = []
                            data.records.forEach(element => {
                                var MyObject = new Object()
                                MyObject.label = element.fields.column_2
                                MyObject.Lat = element.fields.column_4
                                MyObject.Long = element.fields.column_3
                                suggestions.push(MyObject)
                            });
                            update(suggestions);
                        })
                    })
                } else if (document.getElementById("InputCountry").value == "France") {
                    fetch(`https://datanova.laposte.fr/api/records/1.0/search/?dataset=laposte_hexasmal&q=${text}`).then((response) => {
                        response.json().then((data) =>{
                            var suggestions = []
                            data.records.forEach(element => {
                                var MyObject = new Object()
                                MyObject.label = element.fields.nom_de_la_commune
                                MyObject.Lat = element.fields.coordonnees_gps[0]
                                MyObject.Long = element.fields.coordonnees_gps[1]
                                suggestions.push(MyObject)
                            });
                            update(suggestions);
                        })
                    })
                } else {
                    var suggestions = []
                    update(suggestions);
                }
            },
            onSelect: function(item) {
                document.getElementById("InputCity").value = item.label
                me._InitLat = item.Lat
                me._InitLong = item.Long
                me.CityFound = true
                me._TrackName = item.label.charAt(0).toUpperCase() + item.label.slice(1)
            },
            customize: function(input, inputRect, container, maxHeight) {
                if (container.childNodes.length == 1){
                    if (container.childNodes[0].innerText == 'No suggestion'){
                        input.style.backgroundColor = "lightcoral"
                    } else {
                        input.style.backgroundColor = "white"
                    }
                } else {
                    input.style.backgroundColor = "white"
                }
            },
            disableAutoSelect: false
        });
        InputCity.addEventListener("keyup", function(event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
              event.preventDefault()
              me.FindCityLatLong()
            }
        });
        // Boutton
        let ButtonGo = CoreXBuild.Button("&#8680",this.FindCityLatLong.bind(this),"Titre Button")
        Conteneur.appendChild(ButtonGo)
        ButtonGo.style.padding = "0px"
        ButtonGo.style.borderRadius = "50%"
        ButtonGo.style.width = "8vh"
        ButtonGo.style.height = "8vh"
        // Error text
        Conteneur.appendChild(CoreXBuild.DivTexte("", "SearchError", "Text", "color:red; height:4vh;"))
    }

    async FindCityLatLong(){
        let city = document.getElementById("InputCity").value
        if (city == "") {
            // On centre sur rixensart
            this.LoadViewMap("50.709446", "4.543413")
        } else {
            if (this.CityFound){
                this.LoadViewMap(this._InitLat, this._InitLong)
            } else {
                document.getElementById("SearchError").innerText = "City not found...!"
            }
        }
    }

    LoadViewMap(Lat, Long){
        // mettre le backgroundColor du body à Black pour la vue Iphone
        if (L.Browser.mobile){document.body.style.backgroundColor= "black"}
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Add dropdown groupe
        if (this._UserGroup.length > 0){
            // Ajout du drop down avec le nom des groupes des map
            let divdropdown = CoreXBuild.Div("", "DivMapGroupDropDown", "")
            this._DivApp.appendChild(divdropdown)
            let DropDown = document.createElement("select")
            DropDown.setAttribute("id", "Group")
            DropDown.setAttribute("class", "Text MapGroupDropDown")
            let optionS = document.createElement("option")
            optionS.setAttribute("value", this._NoTrack)
            optionS.innerHTML = this._NoTrack
            DropDown.appendChild(optionS)
            this._UserGroup.forEach(element => {
                let option = document.createElement("option")
                option.setAttribute("value", element)
                option.innerHTML = element
                DropDown.appendChild(option)
            });
            DropDown.onchange = this.NewGroupSelected.bind(this)
            divdropdown.appendChild(DropDown)
            this._GroupSelected = this._NoTrack
        }
        // Ajout du div qui va contenir la map
        this._DivApp.appendChild(CoreXBuild.Div(this._MapId, "", "height: 100vh; width: 100%"))
        // Parametre de la carte
        let CenterPoint = {Lat: Lat, Long: Long}
        let Zoom = 14
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
        // Creation du groupe de layer
        this._LayerGroup = new L.LayerGroup()
        this._LayerGroup.addTo(this._Map)

        this._Polyline = L.polyline([]).arrowheads({frequency: '50px', size: '10m', fill: true}).addTo(this._Map)

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
        // Construction de la vue text info box
        this.BuildInfoBox()
        // ElevationBox
        this._ElevationBox = new ElevationBox(this._DivApp, this.DrawElevationPointOnMap.bind(this), this.HideElevationPointOnMap.bind(this))
    }

    async OnMapClick(e) {
        // Creation d'un nouveau marker et l'ajouter à la carte
        await this.CreateNewPoint(e.latlng.lat, e.latlng.lng)
        // Update du calcul de la distance
        this.UpdateElevation()
        // Centrer la carte sur le nouveau point
        this._Map.setView((e.latlng));
    }

    async CreateNewPoint(Lat, Lng){
        let latlng = {lat: Lat, lng: Lng}
        // Creation d'un nouveau marker et l'ajouter à la carte
        var newMarker = new L.marker(latlng, {icon: this._IconPointOption, draggable: 'true',}).addTo(this._MarkerGroup)
        // Enregistement du marker 
        await this.CreateNewTrackPoint(newMarker._leaflet_id, latlng)
        // Ajout du popup sur le marker
        newMarker.bindPopup(this.BuildPopupContent(newMarker._leaflet_id))
        // Ajout des event du le popup du marker
        let me = this
        newMarker
            .on('click', me.MarkerOnClickHandler.bind(this, newMarker))
            .on('dragstart', me.MarkerDragStartHandler.bind(this, newMarker))
            .on('drag', me.MarkerDragHandler.bind(this, newMarker))
            .on('dragend', me.MarkerDragEndHandler.bind(this, newMarker));
    }

    async CreateNewTrackPoint(LeafletId, LatLng){
        var mypoint = new Object()
        mypoint.LatLng = LatLng
        mypoint.LeafletId = LeafletId
        if (this._AutoRouteBehavior){
            if (this._TrackMarkers.length >=1){
                mypoint.SubPoints= await this.GetRoute(this._TrackMarkers[this._TrackMarkers.length -1].LatLng,LatLng)
            } else {
                mypoint.SubPoints = null
            }
        } else {
            mypoint.SubPoints = null
        }
        if (this._TrackMarkers.length >=1){
            mypoint.AutoRoute = this._AutoRouteBehavior
        } else {
            mypoint.AutoRoute = false
        }
        // Enregistement du point dans _TrackMarkers
        this._TrackMarkers.push(mypoint)
        // Ajout du point et des subpoints dans _Polyline
        if (mypoint.SubPoints == null){
            this._Polyline.addLatLng(L.latLng(LatLng))
        } else {
            for (let Subpoint in mypoint.SubPoints){
                this._Polyline.addLatLng(L.latLng(mypoint.SubPoints[Subpoint]))
            }
            this._Polyline.addLatLng(L.latLng(LatLng))
        }
    }

    BuildPopupContent(myid){
        let Div = document.createElement("div")
        Div.setAttribute("Class", "MarkerPopupContent")
        // Bouton delete
        let ButtonDelete = document.createElement("button")
        ButtonDelete.setAttribute("Class", "ButtonPopup TextSmall")
        ButtonDelete.innerHTML = "&#128465"
        ButtonDelete.onclick = this.Deletepoint.bind(this, myid)
        Div.appendChild(ButtonDelete)
        // Si le marker n'est pas le premier markeur
        if (this._TrackMarkers[0].LeafletId != myid){
            // Si le marker n'est pas en autoroute
            const currentmarker = this._TrackMarkers.find( x => x.LeafletId == myid)
            if (! currentmarker.AutoRoute){
                // Button insert
                let ButtonInsert = document.createElement("button")
                ButtonInsert.setAttribute("Class", "ButtonPopup TextSmall")
                ButtonInsert.innerHTML = "&#128205"
                ButtonInsert.onclick = this.Insertpoint.bind(this, myid)
                Div.appendChild(ButtonInsert)
                // Button SetMarkerToAuto
                let ButtonSetMarkerToAuto = document.createElement("button")
                ButtonSetMarkerToAuto.setAttribute("Class", "ButtonPopup TextSmall")
                ButtonSetMarkerToAuto.innerHTML = "&#128171"
                ButtonSetMarkerToAuto.onclick = this.SetMarkerToAuto.bind(this, myid)
                Div.appendChild(ButtonSetMarkerToAuto)
            } else {
                // Boutton SetMarkerToManual
                let ButtonSetMarkerToManual = document.createElement("button")
                ButtonSetMarkerToManual.setAttribute("Class", "ButtonPopup TextSmall")
                ButtonSetMarkerToManual.innerHTML = "&#128207"
                ButtonSetMarkerToManual.onclick = this.SetMarkerToManual.bind(this, myid)
                Div.appendChild(ButtonSetMarkerToManual)
            }
        }
        return Div
    }

    MarkerOnClickHandler(newMarker){
        newMarker.openPopup()
    }

    MarkerDragStartHandler(newMarker){
        this._Map.closePopup()
        this._AllowClick = false
        this._DragpointNb = this._TrackMarkers.findIndex(x => x.LeafletId == newMarker._leaflet_id)
        this._DragPolyline = L.polyline([],{color: 'black', weight: '3', dashArray: '20, 20', dashOffset: '0'}).addTo(this._Map)
        // Si le point que l'on bouge est le premmier point
        if (this._TrackMarkers[0].LeafletId == newMarker._leaflet_id){
            this._DragPolylineNb = 0
            this._DragPolyline.addLatLng(L.latLng(this._TrackMarkers[this._DragpointNb].LatLng))
            this._DragPolyline.addLatLng(L.latLng(this._TrackMarkers[this._DragpointNb+1].LatLng))
        // Si le point que l'on bouge est le dernier point
        } else if (this._TrackMarkers[this._TrackMarkers.length -1].LeafletId == newMarker._leaflet_id){
            this._DragPolylineNb = 1
            this._DragPolyline.addLatLng(L.latLng(this._TrackMarkers[this._DragpointNb-1].LatLng))
            this._DragPolyline.addLatLng(L.latLng(this._TrackMarkers[this._DragpointNb].LatLng))
        // si le point que l'on bouge est le dernier point
        } else {
            this._DragPolylineNb = 1
            this._DragPolyline.addLatLng(L.latLng(this._TrackMarkers[this._DragpointNb-1].LatLng))
            this._DragPolyline.addLatLng(L.latLng(this._TrackMarkers[this._DragpointNb].LatLng))
            this._DragPolyline.addLatLng(L.latLng(this._TrackMarkers[this._DragpointNb+1].LatLng))
        }
    }

    MarkerDragHandler(newMarker){
        this._AllowClick = false
        // Move _DragPolyline
        var latlngs = this._DragPolyline.getLatLngs()
        var latlng = newMarker.getLatLng();
        latlngs.splice(this._DragPolylineNb, 1, latlng)
        this._DragPolyline.setLatLngs(latlngs)
    }

    async MarkerDragEndHandler(newMarker){
        let NewLatLng = newMarker.getLatLng()
        // On retire la _DragPolyline
        this._Map.removeLayer(this._DragPolyline)
        // On enregistre le nouveau point
        this._TrackMarkers[this._DragpointNb].LatLng = NewLatLng
        // si le marker est en mode autoroute
        if (this._TrackMarkers[this._DragpointNb].AutoRoute){
            this._TrackMarkers[this._DragpointNb].SubPoints= await this.GetRoute(this._TrackMarkers[this._DragpointNb -1].LatLng, NewLatLng)
            // si le markeur n'est pas le dernier
            if (this._DragpointNb + 1 < this._TrackMarkers.length){
                // Si le marker suivant est en mode autoroute
                if (this._TrackMarkers[this._DragpointNb + 1].AutoRoute){
                    this._TrackMarkers[this._DragpointNb + 1].SubPoints= await this.GetRoute(NewLatLng, this._TrackMarkers[this._DragpointNb + 1].LatLng)
                }
            }
        } else {
            // si le markeur n'est pas le dernier
            if (this._DragpointNb + 1 < this._TrackMarkers.length){
                // Si le marker suivant est en mode autoroute
                if (this._TrackMarkers[this._DragpointNb + 1].AutoRoute){
                    this._TrackMarkers[this._DragpointNb + 1].SubPoints= await this.GetRoute(NewLatLng, this._TrackMarkers[this._DragpointNb + 1].LatLng)
                }
            }
        }
        // Redraw track
        this.RedrawTrack()
        let me = this
        setTimeout(()=>{ me._AllowClick = true}, 300);
    }

    async Deletepoint(myid) {
        let i = this._TrackMarkers.findIndex(x => x.LeafletId == myid)
        // remove marker for map
        this._MarkerGroup.removeLayer(myid)
        // si le markeur n'est pas le dernier
        if (i +1 < this._TrackMarkers.length){
            // Si le marker suivant est en mode autoroute
            if (this._TrackMarkers[i + 1].AutoRoute){
                this._TrackMarkers[i + 1].SubPoints= await this.GetRoute(this._TrackMarkers[i - 1].LatLng, this._TrackMarkers[i + 1].LatLng)
            }
        }
        // Supprimer le marker de _TrackMarkers
        this._TrackMarkers.splice(i, 1)
        if (this._TrackMarkers.length > 0){
            // Creer un nouveau popup pour le premier marker (que le delete boutton)
            var FirsttMarker = this._MarkerGroup.getLayer(this._TrackMarkers[0].LeafletId)
            FirsttMarker.bindPopup(this.BuildPopupContent(FirsttMarker._leaflet_id))
        }
        // Redraw track
        this.RedrawTrack()
    }

    Insertpoint(myid){
        let arrayid = this._TrackMarkers.findIndex(x => x.LeafletId == myid)
        let arrayidnextpoint = arrayid -1
        if (arrayidnextpoint >=0){
            var CurrentMarker = this._MarkerGroup.getLayer(myid)
            var latlng = CurrentMarker.getLatLng();
            var bounds = L.latLngBounds(latlng, this._TrackMarkers[arrayidnextpoint].LatLng)
            var Newpoint = bounds.getCenter()
            // Ajouter un nouveau point a _TrackMarkers
            var newMarker = new L.marker(Newpoint, {icon: this._IconPointOption, draggable: 'true'}).addTo(this._MarkerGroup)
            // Ajouter le nouveau point dans this._TrackMarkers
            var mypoint = new Object()
            mypoint.LatLng = Newpoint
            mypoint.LeafletId = newMarker._leaflet_id
            mypoint.SubPoints = null
            mypoint.AutoRoute = false
            this._TrackMarkers.splice(arrayid, 0, mypoint)
            // Ajout du popup sur le marker
            newMarker.bindPopup(this.BuildPopupContent(newMarker._leaflet_id))
            // Ajout des event du le popup du marker
            let me = this
            newMarker
                .on('click', me.MarkerOnClickHandler.bind(this, newMarker))
                .on('dragstart', me.MarkerDragStartHandler.bind(this, newMarker))
                .on('drag', me.MarkerDragHandler.bind(this, newMarker))
                .on('dragend', me.MarkerDragEndHandler.bind(this, newMarker));
            
            // Redraw track
            this.RedrawTrack()
        }
    }

    async SetMarkerToAuto(myid){
        let i = this._TrackMarkers.findIndex(x => x.LeafletId == myid)
        // ajouter le mode autoroute
        this._TrackMarkers[i].AutoRoute = true
        // ajouter les subpoints
        this._TrackMarkers[i].SubPoints = await this.GetRoute(this._TrackMarkers[i-1].LatLng, this._TrackMarkers[i].LatLng)
        // Redraw track
        this.RedrawTrack()
        // Creer un nouveau popup
        var CurrentMarker = this._MarkerGroup.getLayer(myid)
        CurrentMarker.bindPopup(this.BuildPopupContent(CurrentMarker._leaflet_id))
    }

    SetMarkerToManual(myid){
        let i = this._TrackMarkers.findIndex(x => x.LeafletId == myid)
        // retirer le mode autoroute
        this._TrackMarkers[i].AutoRoute = false
        // Supprimer les subpoints
        this._TrackMarkers[i].SubPoints = null
        // Redraw track
        this.RedrawTrack()
        // Creer un nouveau popup
        var CurrentMarker = this._MarkerGroup.getLayer(myid)
        CurrentMarker.bindPopup(this.BuildPopupContent(CurrentMarker._leaflet_id))
    }

    RedrawTrack() {
        this._Map.closePopup()
        var AllLatLng = []
        if (this._TrackMarkers.length > 0){
            for (let i in this._TrackMarkers){
                if (this._TrackMarkers[i].AutoRoute ){
                    if (this._TrackMarkers[i].SubPoints){
                        for (let Subpoint in this._TrackMarkers[i].SubPoints){
                            AllLatLng.push(this._TrackMarkers[i].SubPoints[Subpoint])
                        }
                    }
                }
                AllLatLng.push(this._TrackMarkers[i].LatLng)
            }
        }
        this._Polyline.setLatLngs(AllLatLng)
        // Update distance
        this.UpdateElevation()
    }

    UpdateElevation(){
        // Get localisation of track points
        let latlngs = this._Polyline.getLatLngs()
        // Show waiting text
        this._ElevationBox.UpdateText("Waiting data...")
        // Send to server
        let CallToServer = new Object()
        CallToServer.Action = "GetElevation"
        CallToServer.Data = latlngs
        GlobalSendSocketIo("GeoX", "CreateTracksOnMap", CallToServer)
    }

    DrawElevationPointOnMap(latlng){
        if (this._GpsPointer == null){
            this._GpsPointer = L.circleMarker([50.709446,4.543413], {radius: 8, weight:4,color: 'white', fillColor:'red', fillOpacity:1}).addTo(this._Map)
        }
        this._GpsPointer.setLatLng(latlng)
    }

    HideElevationPointOnMap(){
        if (this._GpsPointer){
            this._Map.removeLayer(this._GpsPointer)
            this._GpsPointer = null
        }
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
        Dist = Dist.toFixed(3)
        return Dist
    }

    BuildInfoBox(){
        let DivInfoBox = CoreXBuild.Div("DivInfoBox", "DivInfoBox", "")
        this._DivApp.appendChild(DivInfoBox)

        // Toggle MultiLine to OneLine
        let DivToogle = CoreXBuild.Div("","", "width: 100%; display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center; margin: 1vh 0vh;")
        DivInfoBox.appendChild(DivToogle)
        DivToogle.appendChild(CoreXBuild.DivTexte("Auto:", "", "TextTrackInfo", "color: white; margin-left: 1%; margin-right: 1vh;"))
        let ToogleAuto = CoreXBuild.ToggleSwitch("ToggleAuto", this._AutoRouteBehavior,25)
        DivToogle.appendChild(ToogleAuto)
        ToogleAuto.addEventListener('change', (event) => {
            if (event.target.checked) {
                this._AutoRouteBehavior = true
            } else {
                this._AutoRouteBehavior = false
            }
        })
        // Save button
        DivInfoBox.appendChild(CoreXBuild.Button("Save", this.SaveTrack.bind(this), "ButtonInfoBox"))
    }

    SaveTrack(){
        let latlngs = this._Polyline.getLatLngs();
        if (latlngs.length > 0){
            // Build save window
            let Contener = CoreXBuild.DivFlexColumn("Conteneur")
            
            // Titre
            Contener.appendChild(CoreXBuild.DivTexte("Save Track", "", "Titre", ""))

            // Toggle Modify Existing Track
            let DivToogleModExistingTrack = CoreXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
            Contener.appendChild(DivToogleModExistingTrack)
            DivToogleModExistingTrack.appendChild(CoreXBuild.DivTexte("Modify this track:", "", "", ""))
            DivToogleModExistingTrack.appendChild(CoreXBuild.ToggleSwitch("ToggleExistingTrack", true))
            
            // Div Input
            let DivInput = CoreXBuild.DivFlexColumn("DivInput")
            Contener.appendChild(DivInput)
            // Input Name
            DivInput.appendChild(CoreXBuild.InputWithLabel("InputBoxCoreXWindow", "Track Name:", "Text", "InputTrackName",this._TrackName, "Input Text", "text", "Name",))
            // Input `Group
            DivInput.appendChild(CoreXBuild.InputWithLabel("InputBoxCoreXWindow", "Track Group:", "Text", "InputTrackGroup",this._TrackGroup, "Input Text", "text", "Group",))
            // Toggle Public
            let DivTooglePublic = CoreXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
            DivInput.appendChild(DivTooglePublic)
            DivTooglePublic.appendChild(CoreXBuild.DivTexte("Public Track:", "", "", ""))
            DivTooglePublic.appendChild(CoreXBuild.ToggleSwitch("TogglePublic", this._TrackPublic))

            // Empty space
            Contener.appendChild(CoreXBuild.Div("", "", "height:2vh;"))

            // Div Button
            let DivButton = CoreXBuild.DivFlexRowAr("")
            Contener.appendChild(DivButton)
            // Button save
            DivButton.appendChild(CoreXBuild.Button("Save",this.SendSaveTrack.bind(this),"Text Button ButtonWidth30", "Save"))
            // Button cancel
            DivButton.appendChild(CoreXBuild.Button("Cancel",this.CancelSaveTrack.bind(this),"Text Button ButtonWidth30", "Cancel"))
            // Empty space
            Contener.appendChild(CoreXBuild.Div("", "", "height:2vh;"))

            // Build window
            CoreXWindow.BuildWindow(Contener)
            // Add AutoComplete
            let me = this
            document.getElementById("InputTrackGroup").setAttribute("autocomplete", "off")
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
            // Si on modifie une track existante
            if (this._TrackId != null){
                DivInput.style.display = "none";
                document.getElementById("ToggleExistingTrack").addEventListener('change', function() {
                    if (this.checked) {
                        DivInput.style.display = "none";
                    } else {
                        DivInput.style.display = "flex";
                    }
                });
            } else {
                DivToogleModExistingTrack.style.display = "none";
            }
        }
    }

    SendSaveTrack(){
        if ((document.getElementById("InputTrackName").value != "") && (document.getElementById("InputTrackGroup").value != "")){
            let latlngs = this._Polyline.getLatLngs();
            let timestamp = new Date().toLocaleString('fr-BE');
            let gpxtrack = `<gpx xmlns="https://www.topografix.com/GPX/1/1"  creator="vanko.be" version="1.1" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.topografix.com/GPX/1/1 https://www.topografix.com/GPX/1/1/gpx.xsd">
    <trk><name>${document.getElementById("InputTrackName").value} ${timestamp}</name>
        <trkseg>`
            for (var i = 0; i < latlngs.length; i++) {
                gpxtrack += `
            <trkpt lat="${latlngs[i].lat}" lon="${latlngs[i].lng}"></trkpt>`
            }
            gpxtrack += `
        </trkseg>
    </trk>
</gpx>`
            
            // Data to send
            let Track = new Object()
            Track.Name = document.getElementById("InputTrackName").value 
            Track.Group = document.getElementById("InputTrackGroup").value 
            Track.MultiToOneLine = true
            Track.FileContent = gpxtrack
            Track.Public = document.getElementById("TogglePublic").checked
            Track.Id = this._TrackId
            Track.ModifyExistingTrack = document.getElementById("ToggleExistingTrack").checked
            let CallToServer = new Object()
            CallToServer.Action = "SaveTrack"
            CallToServer.Data = Track
            GlobalSendSocketIo("GeoX", "CreateTracksOnMap", CallToServer)
        } else {
            alert("Enter a name and a group before updating a track")
        }
        
    }

    CancelSaveTrack(){
        CoreXWindow.DeleteWindow()
    }

    async GetRoute(PointA, PointB){
        //const reponse = await fetch(`https://router.project-osrm.org/route/v1/footing/${PointA.lng},${PointA.lat};${PointB.lng},${PointB.lat}?steps=true&geometries=geojson`)
        const data = await this.FetchGetRoute(PointA, PointB).catch(error => {
            alert("Error during fetch of intermediate point : " + error.message)
        });
        var ListOfPoint = []
        if (data){
            data.routes[0].geometry.coordinates.forEach(element => {
                ListOfPoint.push({lat: element[1], lng: element[0]})
            });
        }
        return ListOfPoint
    }

    async FetchGetRoute(PointA, PointB){
        const response = await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/driving/${PointA.lng},${PointA.lat};${PointB.lng},${PointB.lat}?steps=true&geometries=geojson`)
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }
        const data = await response.json()
        return data
    }

    /**
     * Fonction triggered by the dropdown Group
     */
    NewGroupSelected(){
        // get du nom du type
        let DropDownGroupValue = document.getElementById("Group").value
        this._GroupSelected = DropDownGroupValue
        if (DropDownGroupValue != this._NoTrack){
            // Send data to server
            let CallToServer = new Object()
            CallToServer.Action = "GetMapData"
            CallToServer.Data = DropDownGroupValue
            GlobalSendSocketIo("GeoX", "CreateTracksOnMap", CallToServer)
        } else {
            // Remove all tracks
            let me = this
            this._LayerGroup.eachLayer(function (layer) {
                me._LayerGroup.removeLayer(layer);
            })
        }
    }

    /**
     * Ajouter une track a la carte
     * @param {String} TrackId Id de la track
     * @param {String} TrackName Nom de la track
     * @param {Object} GeoJsonData GeoJson Data de la track
     * @param {string} TrackColor Color de la track
     */
    ModifyTracksOnMap(){
        let me = this
        // Remove all tracks
        this._LayerGroup.eachLayer(function (layer) {
            me._LayerGroup.removeLayer(layer);
        })
        // Style for tracks
        var TrackWeight = 3
        if (L.Browser.mobile){
            TrackWeight = 5
        }
        // Style for Marker Start
        var IconPointStartOption = L.icon({
            iconUrl: Icon.MarkerVert(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
        // Style for Marker End
        var IconPointEndOption = L.icon({
            iconUrl: Icon.MarkerRouge(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
        // Add track
        this._DataMap.forEach(Track => {
            // Style for tracks
            var TrackStyle = {
                "color": Track.Color,
                "weight": TrackWeight
            };
            // Add track
            var layerTrack1=L.geoJSON(Track.GeoJsonData, 
                {style: TrackStyle, 
                    filter: function(feature, layer) {if (feature.geometry.type == "LineString") return true}, 
                    arrowheads: {frequency: '100px', size: '15m', fill: true}
                })
                .addTo(this._LayerGroup).bindPopup(Track.Name + "<br>" + Track.Length + "km")
            layerTrack1.id = Track._id
            // Get Start and end point
            var numPts = Track.GeoJsonData.features[0].geometry.coordinates.length;
            var beg = Track.GeoJsonData.features[0].geometry.coordinates[0];
            var end = Track.GeoJsonData.features[0].geometry.coordinates[numPts-1];
            // Marker Start
            var MarkerStart = new L.marker([beg[1],beg[0]], {icon: IconPointStartOption}).addTo(me._LayerGroup)
            MarkerStart.id = Track._id + "start"
            MarkerStart.dragging.disable();
            // Marker End
            var MarkerEnd = new L.marker([end[1],end[0]], {icon: IconPointEndOption}).addTo(me._LayerGroup)
            MarkerEnd.id = Track._id + "end"
            MarkerEnd.dragging.disable();
        });
    }

    InitiationModifyMyTrack(Groups, TrackId, TrackName, TrackGroup, Public){
        // Show Action Button
        GlobalDisplayAction('On')
        // Execute before quit
        GlobalExecuteBeforeQuit(this.DeleteMap.bind(this))
        // Clear Action List
        GlobalClearActionList()
        // Clear view
        this._DivApp.innerHTML=""
        // SocketIO
        let SocketIo = GlobalGetSocketIo()
        SocketIo.on('GeoXError', (Value) => {this.Error(Value)})
        SocketIo.on('CreateTracksOnMap', (Value) => {this.MessageRecieved(Value)})
        // Set Group
        this._UserGroup = Groups
        // Set Track Id
        this._TrackId = TrackId
        // Set Track Name
        this._TrackName = TrackName
        // Set Track Group
        this._TrackGroup = TrackGroup
        // Set Track Public
        this._TrackPublic = Public
        // Set Start view
        let Conteneur = CoreXBuild.DivFlexColumn()
        Conteneur.style.height = "70vh"
        Conteneur.style.justifyContent = "center"
        this._DivApp.appendChild(Conteneur)
        // Texte
        Conteneur.appendChild(CoreXBuild.DivTexte("Get track data...", "", "Text", ""))
        // Get GeoJson Data of track
        let CallToServer = new Object()
        CallToServer.Action = "GetTrackData"
        CallToServer.Data = TrackId
        GlobalSendSocketIo("GeoX", "CreateTracksOnMap", CallToServer)
    }

    AddTrackToModifyOnMap(Data){
        // Afficher la cart centree sur la track a modifier
        this.LoadViewMap(Data.Center.Long, Data.Center.Lat)
        // FitBound
        let FitboundTrack = [ [Data.ExteriorPoint.MaxLong, Data.ExteriorPoint.MinLat], [Data.ExteriorPoint.MaxLong, Data.ExteriorPoint.MaxLat], [ Data.ExteriorPoint.MinLong, Data.ExteriorPoint.MaxLat ], [ Data.ExteriorPoint.MinLong, Data.ExteriorPoint.MinLat], [Data.ExteriorPoint.MaxLong, Data.ExteriorPoint.MinLat]] 
        let me = this
        this._Map.once('moveend', function(){
            // Afficher la track a modifier
            me.DrawTrackToModifyOnMap(Data.GeoJson)
        })
        this._Map.flyToBounds(FitboundTrack,{'duration':1})
    }

    DrawTrackToModifyOnMap(GeoJson){
        GeoJson.features.forEach(feature => {
            if (feature.geometry.type == "LineString"){
                this.DrawTrackToModifyOnMapFirstPoint({lat: feature.geometry.coordinates[0][1], lng: feature.geometry.coordinates[0][0]})
                let tempCoordinate = []
                // Distance entre 2 markeur
                let dist = 0
                // Premier point pour le calcul de la distance
                let from = turf.point([feature.geometry.coordinates[0][0], feature.geometry.coordinates[0][1]]);
                
                for (let index = 1; index < feature.geometry.coordinates.length; index++) {
                    const coordinate = feature.geometry.coordinates[index];
                    const latlng = {lat: coordinate[1], lng: coordinate[0]}
                    let isIntermediatePoint = false

                    let to = turf.point([coordinate[0], coordinate[1]]);
                    dist += turf.distance(from, to)
                    from = to
                    if (dist < 0.5){
                        isIntermediatePoint = true
                    } else {
                        dist = 0
                    }
                    // Si c'est le dernier point on ajoute un marker
                    if ((index +1) == feature.geometry.coordinates.length){
                        isIntermediatePoint = false
                    }
                    

                    if (isIntermediatePoint){
                        tempCoordinate.push(latlng)
                    } else {
                        // Creation d'un nouveau marker et l'ajouter à la carte
                        var newMarker = new L.marker(latlng, {icon: this._IconPointOption, draggable: 'true',}).addTo(this._MarkerGroup)
                        // Enregistement du marker 
                        var mypoint = new Object()
                        mypoint.LatLng = latlng
                        mypoint.LeafletId = newMarker._leaflet_id
                        mypoint.SubPoints = []
                        for (let Subpoint in tempCoordinate){
                            mypoint.SubPoints.push(tempCoordinate[Subpoint])
                            this._Polyline.addLatLng(L.latLng(tempCoordinate[Subpoint]))
                        }
                        mypoint.AutoRoute = true
                        // Enregistement du point dans _TrackMarkers
                        this._TrackMarkers.push(mypoint)
                        // Ajout du popup sur le marker
                        newMarker.bindPopup(this.BuildPopupContent(newMarker._leaflet_id))
                        // Ajout des event du le popup du marker
                        let me = this
                        newMarker
                            .on('click', me.MarkerOnClickHandler.bind(this, newMarker))
                            .on('dragstart', me.MarkerDragStartHandler.bind(this, newMarker))
                            .on('drag', me.MarkerDragHandler.bind(this, newMarker))
                            .on('dragend', me.MarkerDragEndHandler.bind(this, newMarker));
                        tempCoordinate = []
                    }
                }
                // DrawTrack
                this.RedrawTrack()
            }
        });
    }

    DrawTrackToModifyOnMapFirstPoint(latlng){
        // Creation d'un nouveau marker et l'ajouter à la carte
        var newMarker = new L.marker(latlng, {icon: this._IconPointOption, draggable: 'true',}).addTo(this._MarkerGroup)
        // Enregistement du point dans _Polyline
        this._Polyline.addLatLng(L.latLng(latlng))
        // Enregistement du marker 
        var mypoint = new Object()
        mypoint.LatLng = latlng
        mypoint.LeafletId = newMarker._leaflet_id
        mypoint.SubPoints = null
        mypoint.AutoRoute = false
        // Enregistement du point dans _TrackMarkers
        this._TrackMarkers.push(mypoint)
        // Ajout du popup sur le marker
        newMarker.bindPopup(this.BuildPopupContent(newMarker._leaflet_id))
        // Ajout des event du le popup du marker
        let me = this
        newMarker
            .on('click', me.MarkerOnClickHandler.bind(this, newMarker))
            .on('dragstart', me.MarkerDragStartHandler.bind(this, newMarker))
            .on('drag', me.MarkerDragHandler.bind(this, newMarker))
            .on('dragend', me.MarkerDragEndHandler.bind(this, newMarker));
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
            this._InitLat = "50.709446"
            this._InitLong = "4.543413"
            this._Polyline = null
            this._MarkerGroup = null
            this._DragpointNb = 0
            this._DragPolyline = null
            this._DragPolylineNb = 0
            this._AllowClick = true
            this._TrackId = null
            this._TrackName = "Rixensart"
            this._TrackGroup = "Planned"
            this._TrackPublic = true
            this._TrackMarkers = []
            this._AutoRouteBehavior = true
            this.CityFound = false
            this._UserGroup = null
            this._GroupSelected = null
            this._DataMap = null
            this._LayerGroup = null
            this._ElevationBox = null
            this._GpsPointer = null
            // mettre le backgroundColor du body à Black pour la vue Iphone
            if (L.Browser.mobile){document.body.style.backgroundColor= "white"}
        }
    }
}

// Creation de l'application
let MyGeoXCreateTrack = new GeoXCreateTrack(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Create My Tracks", Icon.GeoXCreateTrack(), MyGeoXCreateTrack.Initiation.bind(MyGeoXCreateTrack))