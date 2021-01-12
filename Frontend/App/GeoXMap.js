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
        this._GpsPointerTrack = null
        this._GpsRadius = null
        this._GpsLineToPosition = null
        this._WatchPositionID = null
    }

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
        // Add dropdown groupe
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
        }
        // Ajout du bouton action left
        this._DivApp.appendChild(CoreXBuild.ButtonLeftAction(this.ShowTrackInfoBox.bind(this), "ButtonShowTrackInfo"))
        if (GeoXData.AppData.length > 1){
            this.SetButtonShowTrackInfoVisible(true)
        } else {
            this.SetButtonShowTrackInfoVisible(false)
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
        // Creation du groupe de layer
        this._LayerGroup = new L.LayerGroup()
        this._LayerGroup.addTo(this._Map)
        // Ajout des tracks sur la map
        let me = this
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
            this._Map.removeLayer(this._GpsPointerTrack)
            this._GpsPointerTrack = null
            this._Map.removeLayer(this._GpsRadius)
            this._GpsRadius = null
            this._Map.off('locationfound')
            this._Map.off('locationerror')
            this._Map.stopLocate()
            // remove box info
            this.HideDistanceInfoBox()
        } else {
            this._CurrentPosShowed = true
            this._GpsRadius = L.circle([50.709446,4.543413], 1).addTo(this._Map)
            this._GpsPointerTrack = L.circle([50.709446,4.543413], 3, {color: "red", fillColor:'red', fillOpacity:1}).addTo(this._Map)
            this._GpsPointer = L.circleMarker([50.709446,4.543413], {radius: 8, weight:4,color: 'white', fillColor:'#0073f0', fillOpacity:1}).addTo(this._Map)
            // Add box info
            this.ShowDistanceInfoBox()
            this._Map.locate({watch: true, enableHighAccuracy: true})
            this._Map.on('locationfound', this.ShowPosition.bind(this))
            this._Map.on('locationerror', this.ErrorPosition.bind(this))
        }
    }

    ShowDistanceInfoBox(){
        // Div du box
        let DivBoxTracks = CoreXBuild.Div("DivBoxDistance", "DivBoxDistance", "")
        this._DivApp.appendChild(DivBoxTracks)
        // Conteneur
        let Conteneur = CoreXBuild.DivFlexColumn("")
        DivBoxTracks.appendChild(Conteneur)
        // ConteneurTxt
        let ConteneurTxt = CoreXBuild.Div("ConteneurTxt", "", "width: 100%; display:none; justify-content:center;")
        Conteneur.appendChild(ConteneurTxt)
        ConteneurTxt.appendChild(CoreXBuild.DivTexte("","DistanceTxt","TextTrackInfo", "color: white;"))
        // ConteneurData
        let ConteneurData = CoreXBuild.DivFlexRowStart("ConteneurData")
        Conteneur.appendChild(ConteneurData)
        // Pourcentage
        ConteneurData.appendChild(CoreXBuild.DivTexte("0%","DistancePourcent","TextTrackInfo", "color: white; margin-left: 4%; width: 48%;"))
        // Div Distance
        let DivDistane = CoreXBuild.Div("", "", "width: 48%; display: flex; flex-direction:column; justify-content:flex-start;")
        ConteneurData.appendChild(DivDistane)
        DivDistane.appendChild(CoreXBuild.DivTexte("Done: 0km","DistaneDone","TextTrackInfo", "color: white;"))
        DivDistane.appendChild(CoreXBuild.DivTexte("Total: 0km","DistanceTotal","TextTrackInfo", "color: white;"))
    }

    HideDistanceInfoBox(){
        // If TracksInfo existe alors on le supprime
        let DivBoxDistance = document.getElementById("DivBoxDistance")
        if(DivBoxDistance){
            DivBoxDistance.parentNode.removeChild(DivBoxDistance)
        }
    }

    ShowPosition(e){
        var radius = e.accuracy
        this._GpsPointer.setLatLng(e.latlng)
        this._GpsRadius.setLatLng(e.latlng)
        this._GpsRadius.setRadius(radius)
        this.CalculateLivePositionOnTrack(e)
    }
    
    ErrorPosition(err){
        alert('ERROR Position: ' + err.message)
    }

    CalculateLivePositionOnTrack(Gps){
        // get all layer
        var arrayOfLayers = this._LayerGroup.getLayers()
        // Verifier si il n'y a qu'une seule track sur la carte
        if(arrayOfLayers.length == 1){
            var layer = arrayOfLayers[0]._layers
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
                var DistancePourcent =Math.round(((DistandceParcourue/DistranceTotale) * 100 + Number.EPSILON) * 1000) / 1000 
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
                document.getElementById("ConteneurTxt").style.display = "none";
                document.getElementById("ConteneurData").style.display = "flex";
                document.getElementById("DistanceTxt").innerText = ``
                document.getElementById("DistaneDone").innerText = `Done: ${DistandceParcourue}`
                document.getElementById("DistanceTotal").innerText = `Total: ${DistranceTotale}`
                document.getElementById("DistancePourcent").innerText = `${DistancePourcent}%`
                // retirer la ligne entre la track et la position
                if (this._GpsLineToPosition != null){
                    this._Map.removeLayer(this._GpsLineToPosition)
                    this._GpsLineToPosition = null
                }
            } else {
                console.log(snapped.properties.dist)
                var DistandcePosAndTrack = Math.round((snapped.properties.dist + Number.EPSILON) * 1000) / 1000
                if (DistandcePosAndTrack >= 1){
                    DistandcePosAndTrack = DistandcePosAndTrack.toString() + "Km"
                } else {
                    DistandcePosAndTrack = DistandcePosAndTrack * 1000
                    DistandcePosAndTrack = DistandcePosAndTrack.toString()  + "m"
                }
                console.log(DistandcePosAndTrack)
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
            // afficher qu'il plus que un layer
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

    SetButtonShowTrackInfoVisible(Visible){
        if (Visible){
            document.getElementById("ButtonShowTrackInfo").style.display = "block";
        } else {
            document.getElementById("ButtonShowTrackInfo").style.display = "none";
        }
    }

    /**
     * Show le box du track info
     */
    ShowTrackInfoBox(){
        // Show track info box
        this.BuildBoxTracksInfo()
        // hide boutton
        this.SetButtonShowTrackInfoVisible(false)
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
            this.SetButtonShowTrackInfoVisible(true)
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
    BuildBoxTracksInfo(){
        // Div du box
        let DivBoxTracks = CoreXBuild.Div("DivBoxTracks", "DivBoxTracks", "")
        this._DivApp.appendChild(DivBoxTracks)
        // Add Close button
        DivBoxTracks.appendChild(CoreXBuild.Button ("&#x21E6", this.HideTrackInfoBox.bind(this), "ButtonClose", ""))
        // Div empty
        DivBoxTracks.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Add all tracks of the group
        this._DataApp.forEach(element => {
            if (element.Group == this._GroupSelected){
                // Box pour toutes les info d'un track
                let DivBoxTrackInfo = CoreXBuild.Div("", "DivBoxTrackInfo", "")
                DivBoxTracks.appendChild(DivBoxTrackInfo)
                // Conteneur flewRow
                let Conteneur = CoreXBuild.DivFlexRowStart("")
                DivBoxTrackInfo.appendChild(Conteneur)
                // Box pour click sur le nom de la track et pour faire un zoom sur la track
                let DivTrackinfo = CoreXBuild.Div("", "", "cursor: pointer; width: 56%; display: -webkit-flex; display: flex; flex-direction: column; justify-content:flex-start;")
                Conteneur.appendChild(DivTrackinfo)
                DivTrackinfo.addEventListener('click', this.FitboundOnTrack.bind(this, element))
                // Nom de la track
                DivTrackinfo.appendChild(CoreXBuild.DivTexte(element.Name,"","TextTrackInfo", "color: white; margin-left: 4%;"))
                // Conteur sub info des track
                let DivSubInfo = CoreXBuild.Div("","","width: 100%; display: -webkit-flex; display: flex; flex-direction: row;  justify-content:space-between;")
                DivTrackinfo.appendChild(DivSubInfo)
                // Date de la track
                DivSubInfo.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateString(element.Date),"","TextTrackInfo", "color: white; margin-left: 4%;"))
                // Longeur de la track
                DivSubInfo.appendChild(CoreXBuild.DivTexte(element.Length + "Km","","TextTrackInfo", "color: white; margin-left: 0%;"))
                // Box pour les bouttons
                let DivButton = document.createElement("div")
                Conteneur.appendChild(DivButton)
                DivButton.setAttribute("style", "margin-left: auto; display: -webkit-flex; display: flex; flex-direction: row; justify-content:flex-end; align-content:center; align-items: center; flex-wrap: wrap;")
                // Boutton Color track
                let inputcolor = document.createElement("input")
                inputcolor.setAttribute("id","color" + element._id)
                inputcolor.setAttribute("type","color")
                inputcolor.setAttribute("style","background-color: white;border-radius: 8px; cursor: pointer; width: 34px; border: 1px solid black;")
                inputcolor.value = element.Color
                inputcolor.onchange = (event)=>{this.ChangeTrackColor(event.target.value, element.Name, element.Length, element._id)}
                DivButton.appendChild(inputcolor)
                // Button show/hide track
                DivButton.appendChild(CoreXBuild.Button ("&#128065", this.ToogleTrack.bind(this, element._id), "ButtonIcon"))
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
            this._LayerGroup = null
            this._GroupSelected = null
            this._DataMap = null
            this._DataApp = null
            this._CurrentPosShowed = false
            this._GpsPointer = null
            this._GpsPointerTrack = null
            this._GpsRadius = null
            this._GpsLineToPosition = null
            this._WatchPositionID = null
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
        // Si il existe des tracks
        if (this._DataMap.FitBounds != null){
            // Zoom in
            this._Map.flyToBounds(this._DataMap.FitBounds,{'duration':2} )
            let me = this
            this._Map.once('moveend', function() {
                // Add tracks
                me._DataMap.ListOfTracks.forEach(Track => {
                    var TrackWeight = 3
                    if (L.Browser.mobile){
                        TrackWeight = 6
                    }
                    // Style for tracks
                    var TrackStyle = {
                        "color": Track.Color,
                        "weight": TrackWeight
                    };
                    // Add track
                    var layerTrack1=L.geoJSON(Track.GeoJsonData, {style: TrackStyle, arrowheads: {frequency: '100px', size: '15m', fill: true}}).addTo(me._LayerGroup).bindPopup(me.BuildPopupContentTrack(Track.Name, Track.Length, Track._id, Track.Color))
                    layerTrack1.id = Track._id
                });
                // Si on suit la postion, on fait un update du calcul des distance realisee
                if (me._CurrentPosShowed){
                    var coor = me._GpsPointer.getLatLng()
                    var gps = {longitude: coor.lng, latitude: coor.lat}
                    me.CalculateLivePositionOnTrack(gps)
                }
            });
        }
        if (this._DataMap.ListOfTracks.length > 1){
            this.SetButtonShowTrackInfoVisible(true)
        } else {
            this.SetButtonShowTrackInfoVisible(false)
        }
    }

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
                    var TrackWeight = 3
                    if (L.Browser.mobile){
                        TrackWeight = 6
                    }
                    var TrackStyle = {
                        "color": Track.Color,
                        "weight": 3
                    };
                    var layerTrack1=L.geoJSON(Track.GeoJsonData, {style: TrackStyle, arrowheads: {frequency: '80px', size: '18m', fill: true}}).addTo(me._LayerGroup).bindPopup(Track.Name)
                    layerTrack1.id = Track._id
                }
            });
        }

        // Si on suit la postion, on fait un update du calcul des distance realisee
        if (this._CurrentPosShowed){
            var coor = this._GpsPointer.getLatLng()
            var gps = {longitude: coor.lng, latitude: coor.lat}
            this.CalculateLivePositionOnTrack(gps)
        }
    }

    /**
     * Change the color of a track
     * @param {Color} Color New color
     * @param {String} TrackId id of the track to color
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
}