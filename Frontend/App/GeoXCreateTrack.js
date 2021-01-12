class GeoXCreateTrack {
    constructor(DivApp){
        this._DivApp = DivApp
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
        this._TrackName = "Rixensart"
        this._TrackMarkers = []
        this._AutoRouteBehavior = true
        this.CityFound = false
        this._GeoXData = null
        this._GroupSelected = null
        this._NoTrack = "No Track"
        this._DataMap = null
        this._LayerGroup = null

        this._IconPointOption = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconSize:     [18, 30],
            iconAnchor:   [9, 30],
            popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
        });
    }

    Start(GeoXData = null){
        // Save data
        this._GeoXData = GeoXData
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
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Add dropdown groupe
        if (this._GeoXData.AppGroup.length > 0){
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
            this._GeoXData.AppGroup.forEach(element => {
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
    }

    async OnMapClick(e) {
        // Creation d'un nouveau marker et l'ajouter à la carte
        var newMarker = new L.marker(e.latlng, {icon: this._IconPointOption, draggable: 'true',}).addTo(this._MarkerGroup)
        // Enregistement du marker 
        await this.CreateNewTrackPoint(newMarker._leaflet_id, e.latlng)
        // Ajout du popup sur le marker
        newMarker.bindPopup(this.BuildPopupContent(newMarker._leaflet_id))
        // Ajout des event du le popup du marker
        let me = this
        newMarker
            .on('click', me.MarkerOnClickHandler.bind(this, newMarker))
            .on('dragstart', me.MarkerDragStartHandler.bind(this, newMarker))
            .on('drag', me.MarkerDragHandler.bind(this, newMarker))
            .on('dragend', me.MarkerDragEndHandler.bind(this, newMarker));

        // Update du calcul de la distance
        this.UpdateViewDistance()
        // Centrer la carte sur le nouveau point
        this._Map.setView((e.latlng));
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
        this.UpdateViewDistance()
    }

    UpdateViewDistance(){
        var Dist = this.CalculDistance()
        if (Dist < 1){
            Dist = Dist * 1000
            Dist = Dist.toString() + "m"
        } else {
            Dist = Dist.toString() + "Km"
        }
        document.getElementById("DivDistance").innerText = "Distance: " + Dist
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
        var Dist = this.CalculDistance()
        if (Dist < 1){
            Dist = Dist * 1000
            Dist = Dist.toString() + "m"
        } else {
            Dist = Dist.toString() + "Km"
        }
        let DivInfoBox = CoreXBuild.Div("DivInfoBox", "DivInfoBox", "")
        this._DivApp.appendChild(DivInfoBox)
        DivInfoBox.appendChild(CoreXBuild.DivTexte("Distance: " + Dist,"DivDistance","TextTrackInfo", "color: white; margin-left: 1%;"))
        // Toggle MultiLine to OneLine
        let DivToogle = CoreXBuild.Div("","", "width: 100%; display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center; margin: 1vh 0vh;")
        DivInfoBox.appendChild(DivToogle)
        DivToogle.appendChild(CoreXBuild.DivTexte("Auto:", "", "TextTrackInfo", "color: white; margin-left: 1%"))
        let ToogleAuto = CoreXBuild.ToggleSwitch("ToggleAuto", this._AutoRouteBehavior, "26")
        DivToogle.appendChild(ToogleAuto)
        ToogleAuto.addEventListener('change', (event) => {
            if (event.target.checked) {
                this._AutoRouteBehavior = true
            } else {
                this._AutoRouteBehavior = false
            }
        })
        DivInfoBox.appendChild(CoreXBuild.Button("Save", this.SaveTrack.bind(this), "ButtonInfoBox"))
    }

    SaveTrack(){
        var latlngs = this._Polyline.getLatLngs();
            if (latlngs.length > 0){
            var timestamp = new Date().toLocaleString('fr-BE');
            var gpxtrack = `
<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
    <gpx xmlns="https://www.topografix.com/GPX/1/1"  creator="vanko.be" version="1.1" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.topografix.com/GPX/1/1 https://www.topografix.com/GPX/1/1/gpx.xsd">
        <trk><name>${this._TrackName} ${timestamp}</name>
            <trkseg>`
            for (var i = 0; i < latlngs.length; i++) {
                gpxtrack += `
                <trkpt lat="${latlngs[i].lat}" lon="${latlngs[i].lng}"></trkpt>`
            }
            gpxtrack += `
            </trkseg>
        </trk>
    </gpx>`
            let Track = new Object()
            Track.Name = this._TrackName
            Track.Group = "Plannifié"
            Track.MultiToOneLine = false
            Track.FileContent = gpxtrack
            // Data to send
            let Data = new Object()
            Data.Action = "Add"
            Data.Data = Track
            Data.FromCurrentView = "LoadViewMap"
            GlobalSendSocketIo("GeoX", "ManageTrack", Data)
        }
    }

    async GetRoute(PointA, PointB){
        //const reponse = await fetch(`https://router.project-osrm.org/route/v1/footing/${PointA.lng},${PointA.lat};${PointB.lng},${PointB.lat}?steps=true&geometries=geojson`)
        const reponse = await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/driving/${PointA.lng},${PointA.lat};${PointB.lng},${PointB.lat}?steps=true&geometries=geojson`)
        const data = await reponse.json()
        var ListOfPoint = []
        data.routes[0].geometry.coordinates.forEach(element => {
            ListOfPoint.push({lat: element[1], lng: element[0]})
        });
        return ListOfPoint
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
            GlobalSendSocketIo("GeoX", "LoadMapData", DropDownGroupValue)
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
    ModifyTracksOnMap(DataMap){
        this._DataMap = DataMap
        // Remove all tracks
        let me = this
        this._LayerGroup.eachLayer(function (layer) {
            me._LayerGroup.removeLayer(layer);
        })
        // Zoom in and add tracks
        this._DataMap.ListOfTracks.forEach(Track => {
            var TrackWeight = 3
            if (L.Browser.mobile){TrackWeight = 6}
            // Style for tracks
            var TrackStyle = {
                "color": Track.Color,
                "weight": TrackWeight
            };
            // Add track
            var layerTrack1=L.geoJSON(Track.GeoJsonData, {style: TrackStyle, arrowheads: {frequency: '100px', size: '15m', fill: true}}).addTo(this._LayerGroup).bindPopup(Track.Name + "<br>" + Track.Length + "km")
            layerTrack1.id = Track._id
        });
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
            this._TrackMarkers = []
            this._AutoRouteBehavior = true
            this.CityFound = false
            this._GeoXData = null
            this._GroupSelected = null
            this._DataMap = null
            this._LayerGroup = null
        }
    }
}