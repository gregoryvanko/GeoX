class GeoXMap{
    constructor(DivMapId, InitialMapData= {CenterPoint:{Lat:50.709446, Long:4.543413}, Zoom:8}){
        this._DivMapId = DivMapId
        this._Map = null
        this._InitialMapData = InitialMapData
        this._LayerGroup = null
        this._MarkersCluster = null
        this._OnClickOnMarker = null

        // Style for Marker Icon
        this._IconPointOption = L.icon({
            iconUrl: IconMarker.MarkerBleu(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
        // Style for Marker Start
        this._IconPointStartOption = L.icon({
            iconUrl: IconMarker.MarkerVert(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
        // Style for Marker End
        this._IconPointEndOption = L.icon({
            iconUrl: IconMarker.MarkerRouge(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });

        // Track style
        this._TrackWeight = (L.Browser.mobile) ? 5 : 3
        this._TrackColor = "#0000FF"
    }

    get Map(){
        return this._Map
    }

    set InitialMapData(NewInitialMapData){
        this._InitialMapData = NewInitialMapData
    }

    set OnClickOnMarker(NewOnClickOnMarker){
        this._OnClickOnMarker = NewOnClickOnMarker
    }

    RenderMap(){
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
        this._Map = L.map(this._DivMapId , {zoomControl: false, layers: [Openstreetmap]}).setView([this._InitialMapData.CenterPoint.Lat, this._InitialMapData.CenterPoint.Long], this._InitialMapData.Zoom);
        L.control.zoom({position: 'bottomright'}).addTo(this._Map);
        L.control.layers(baseLayers,null,{position: 'bottomright'}).addTo(this._Map);
        // Creation du groupe de layer
        this._LayerGroup = new L.LayerGroup()
        this._LayerGroup.addTo(this._Map)
    }

    RemoveMap(){
        // Remove Map
        this._Map.off();
        this._Map.remove();
        this._Map = null
        this._LayerGroup = null
        this._MarkersCluster = null
    }

    AddMarkersClusterGroup(){
        // Build markerClusterGroup
        this._MarkersCluster = L.markerClusterGroup({
            maxClusterRadius: 30,
            disableClusteringAtZoom: 16,
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
    }

    AddMarker(Marker){
        let newMarker = new L.marker([Marker.StartPoint.Lat, Marker.StartPoint.Lng], {icon: this._IconPointOption}).on('click',(e)=>{if(e.originalEvent.isTrusted){this.ClickOnMarker(Marker._id, false)}})
        this._MarkersCluster.addLayer(newMarker);
    }

    ClickOnMarker(TrackId){
        if (this._OnClickOnMarker){
            this._OnClickOnMarker(TrackId)
        }
    }

    RemoveAllTracks(){
        let me = this
        this._LayerGroup.eachLayer(function (layer) {
            me._LayerGroup.removeLayer(layer);
        })
    }

    RemoveAllMarkers(){
        let me = this
        this._MarkersCluster.eachLayer(function(layer) {
            me._MarkersCluster.removeLayer(layer)
        })
    }

    AddTrackOnMap(TrackId, GeoJson, FitBounds, color = null){
        let WeightTrack = this._TrackWeight
        let Thecolor = (color == null)? this._TrackColor : color
        var TrackStyle = {
            "color": Thecolor,
            "weight": WeightTrack
        }
        let layerTrack1=L.geoJSON(GeoJson, 
            {
                style: TrackStyle, 
                filter: function(feature, layer) {if (feature.geometry.type == "LineString") return true}, 
                arrowheads: {frequency: '100px', size: '15m', fill: true}
            })
            .on('mouseover', function(e) {e.target.setStyle({weight: 8})})
            .on('mouseout', function (e){e.target.setStyle({weight:WeightTrack});})
            .addTo(this._LayerGroup)
        layerTrack1.Type= "GeoXTrack"
        layerTrack1.id = TrackId
        // Get Start and end point
        let numPts = GeoJson.features[0].geometry.coordinates.length;
        let beg = GeoJson.features[0].geometry.coordinates[0];
        let end = GeoJson.features[0].geometry.coordinates[numPts-1];
        // Add marker Start
        let MarkerStart = new L.marker([beg[1],beg[0]], {icon: this._IconPointStartOption}).addTo(this._LayerGroup)
        MarkerStart.id = TrackId + "start"
        MarkerStart.Type = "GeoXMarker"
        MarkerStart.dragging.disable();
        // Add marker end
        let MarkerEnd = new L.marker([end[1],end[0]], {icon: this._IconPointEndOption}).addTo(this._LayerGroup)
        MarkerEnd.id = TrackId+ "end"
        MarkerEnd.Type = "GeoXMarker"
        MarkerEnd.dragging.disable();

        // FitBounds
        if (FitBounds){
            this._Map.fitBounds(layerTrack1.getBounds())
        }
    }
}