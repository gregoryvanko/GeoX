class InfoOnTrack {
    constructor(Data, HtmlDiv){
        this._Id = Data._id
        this._Name = Data.Name
        this._Date = Data.Date
        this._ExteriorPoint = Data.ExteriorPoint
        this._GeoJsonData = Data.GeoJsonData
        this._Length = Data.Length
        this._Center = Data.Center
        this._StartPoint = Data.StartPoint
        this._Elevation = Data.Elevation
        this._HtmlDiv = document.getElementById(HtmlDiv)
        this._Map = null
        this._MapId = "mapid"
        this._LayerGroup = null
        this._WeightTrack = (L.Browser.mobile) ? 5 : 3
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

        this.LoadView()

    }

    LoadView(){
        this._HtmlDiv.innerHTML=""
        // Titre
        this._HtmlDiv.appendChild(CoreXBuild.DivTexte(this._Name,"","TitreInfoOneTrack", "width: 100%;"))
        // Div Data
        let DivData = CoreXBuild.Div("DivData","DivInfoOneTrack", "width: 100%;")
        this._HtmlDiv.appendChild(DivData)
        DivData.appendChild(CoreXBuild.DivTexte("Waiting server data...","","Text", ""))
        // Div Carte
        let DivCarte = CoreXBuild.Div("DivCarte","DivInfoOneTrack", "padding: 0vh; width: 100%;")
        this._HtmlDiv.appendChild(DivCarte)
        // Ajout du div qui va contenir la map
        DivCarte.appendChild(CoreXBuild.Div(this._MapId, "", "height: 50vh; width: 100%"))
        this.DrawMap()
        // Div Elevation
        let DivElevation = CoreXBuild.Div("DivElevation","DivInfoOneTrack", "width: 100%;")
        this._HtmlDiv.appendChild(DivElevation)
        DivElevation.appendChild(CoreXBuild.DivTexte("Waiting server data...","","Text", ""))
    }

    DrawMap(){
        // Parametre de la carte
        let CenterPoint = {Lat: this._Center.Lat, Long: this._Center.Long}
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

        let WeightTrack = this._WeightTrack
        var TrackStyle = {
            "color": "blue",
            "weight": WeightTrack
        };
        var layerTrack1=L.geoJSON(this._GeoJsonData , 
            {
                style: TrackStyle, 
                filter: function(feature, layer) {if (feature.geometry.type == "LineString") return true}, 
                arrowheads: {frequency: '100px', size: '15m', fill: true}
            })
            .addTo(this._LayerGroup)
        layerTrack1.Type= "Track"
        layerTrack1.id = this._Id
        
        
        // Get Start and end point
        var numPts = this._GeoJsonData.features[0].geometry.coordinates.length;
        var beg = this._GeoJsonData.features[0].geometry.coordinates[0];
        var end = this._GeoJsonData.features[0].geometry.coordinates[numPts-1];
        
        // Marker Start
        var MarkerStart = new L.marker([beg[1],beg[0]], {icon: this._IconPointStartOption}).addTo(this._LayerGroup)
        MarkerStart.id = this._Id + "start"
        MarkerStart.Type = "Marker"
        MarkerStart.dragging.disable();
        // Marker End
        var MarkerEnd = new L.marker([end[1],end[0]], {icon: this._IconPointEndOption}).addTo(this._LayerGroup)
        MarkerEnd.id = this._Id + "end"
        MarkerEnd.Type = "Marker"
        MarkerEnd.dragging.disable();
        // FitBound
        this._Map.fitBounds(layerTrack1.getBounds());
    }
}