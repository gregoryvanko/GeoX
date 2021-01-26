class GeoXSearchTracksOnMap {
    constructor(DivApp){
        this._DivApp = DivApp
        this._CurrentView = null
        this._MapId = "mapid"
        this._MapBoundPadding = -0.02
        this._ZoomValueToShowTrack = 12
        this._InitLat = "50.709446"
        this._InitLong = "4.543413"
        this._Map = null
        this._MarkerGroup = null
        this._IconPointOption = L.icon({
            iconUrl: MarkerIcon.MarkerBleu(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
    }

    MessageRecieved(Value){
        if (Value.Action == "SetAllTracksInfo" ){
            this.AddMarkerOrTrackOnMap(Value.Data)
        } else {
            console.log("error, Action not found: " + Value.Action)
        }
    }

    LoadView(CurrentView){
        // Enregister la current view
        this._CurrentView = CurrentView
        // mettre le backgroundColor du body à Black pour la vue Iphone
        document.body.style.backgroundColor= "black"
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
        this._MarkerGroup = L.layerGroup().addTo(this._Map)
        // Add event listener on map
        this._Map.on('zoomend', this.CallServerGetTracksInfo.bind(this))
        this._Map.on('dragend', this.CallServerGetTracksInfo.bind(this))

        // Create Waiting Box
        this.WaitingBoxCreate()
        // Get all centerPoint of tracks
        this.CallServerGetTracksInfo()
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

    GetCornerOfMap(){
        let Corner = new Object()
        Corner.NW = this._Map.getBounds().pad(this._MapBoundPadding).getNorthWest()
        Corner.NE = this._Map.getBounds().pad(this._MapBoundPadding).getNorthEast()
        Corner.SE = this._Map.getBounds().pad(this._MapBoundPadding).getSouthEast()
        Corner.SW = this._Map.getBounds().pad(this._MapBoundPadding).getSouthWest()
        return Corner
    }

    CallServerGetTracksInfo(){
        // Show waiting box
        this.WaitingBoxShow()
        // Data to send
        let CallToServer = new Object()
        CallToServer.Action = "GetTracksInfo"
        CallToServer.Data = this.GetCornerOfMap()
        CallToServer.FromCurrentView = this._CurrentView
        // Call Server
        GlobalSendSocketIo("GeoX", "SearchTracksOnMap", CallToServer)
    }

    AddMarkerOrTrackOnMap(ListeOfTracks){
        // Remove all markers
        let me = this
        this._MarkerGroup.eachLayer(function (layer) {
            me._MarkerGroup.removeLayer(layer);
        })
        // On affiche les marker ou les tracks en fonction du zoom
        if (this._Map.getZoom() < this._ZoomValueToShowTrack){
            // Creation d'un nouveau marker par track et l'ajouter à la carte
            ListeOfTracks.forEach(Track => {
                var newMarker = new L.marker(L.latLng([Track.Center.Long,Track.Center.Lat]), {icon: this._IconPointOption}).addTo(this._MarkerGroup)
            });
        } else {
            // Creation des track et les ajouter à la carte
            // Style for tracks
            let TrackWeight = 3
            if (L.Browser.mobile){TrackWeight = 5}
            // Style for Marker Start
            var IconPointStartOption = L.icon({
                iconUrl: MarkerIcon.MarkerVert(),
                iconSize:     [40, 40],
                iconAnchor:   [20, 40],
                popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
            });
            // Style for Marker End
            var IconPointEndOption = L.icon({
                iconUrl: MarkerIcon.MarkerRouge(),
                iconSize:     [40, 40],
                iconAnchor:   [20, 40],
                popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
            });
            ListeOfTracks.forEach(Track => {
                var TrackStyle = {
                    "color": Track.Color,
                    "weight": TrackWeight
                };
                var layerTrack1=L.geoJSON(Track.GeoJsonData, {style: TrackStyle, arrowheads: {frequency: '100px', size: '15m', fill: true}}).addTo(this._MarkerGroup)
                layerTrack1.id = Track._id
                layerTrack1.Type= "Track"
                // Get Start and end point
                var numPts = Track.GeoJsonData.features[0].geometry.coordinates.length;
                var beg = Track.GeoJsonData.features[0].geometry.coordinates[0];
                var end = Track.GeoJsonData.features[0].geometry.coordinates[numPts-1];
                // Marker Start
                var MarkerStart = new L.marker([beg[1],beg[0]], {icon: IconPointStartOption}).addTo(this._MarkerGroup)
                MarkerStart.id = Track._id + "start"
                MarkerStart.Type = "Marker"
                MarkerStart.dragging.disable();
                // Marker End
                var MarkerEnd = new L.marker([end[1],end[0]], {icon: IconPointEndOption}).addTo(this._MarkerGroup)
                MarkerEnd.id = Track._id + "end"
                MarkerEnd.Type = "Marker"
                MarkerEnd.dragging.disable();
            });
        }
        // Hide waiting Box
        this.WaitingBoxHide()
    }

    // DrawCornerOfMap(Corner){
    //     let BoundsOfMap = L.polyline([]).addTo(this._Map)
    //     BoundsOfMap.addLatLng(L.latLng(Corner.NW))
    //     BoundsOfMap.addLatLng(L.latLng(Corner.NE))
    //     BoundsOfMap.addLatLng(L.latLng(Corner.SE))
    //     BoundsOfMap.addLatLng(L.latLng(Corner.SW))
    //     BoundsOfMap.addLatLng(L.latLng(Corner.NW))
    // }

    /**
     * Suppression d'une carte
     */
    DeleteMap(){
        this._CurrentView = null
        if (this._Map && this._Map.remove) {
            this._Map.off();
            this._Map.remove();
            this._Map = null
            let mapDiv = document.getElementById(this._MapId)
            if(mapDiv) mapDiv.parentNode.removeChild(mapDiv)
            this._InitLat = "50.709446"
            this._InitLong = "4.543413"
            this._MarkerGroup = null
            // mettre le backgroundColor du body à Black pour la vue Iphone
            document.body.style.backgroundColor= "white"
        }
    }

}