function CallRouteGetMap(req, res, MyApp){
    let ListOfTrackId = req.query["trackid"]
    if (ListOfTrackId) {
        GetMapDataById(ListOfTrackId, res, MyApp)
    } else {
        res.send("No trackid defined in url query")
    }
}

/**
 * Construction de la page HTML avec les tracks a montrer
 * @param {Object} DataMap Object contenant les data des map
 */
function BuildHtmlGetMap(DataMap){
    let fs = require('fs')
    var reponse = ""
    reponse +=`
    <!doctype html>
    <html>
        <head>
            <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'/>
            <meta name="apple-mobile-web-app-capable" content="yes">
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
            <meta name="apple-mobile-web-app-title" content="GeoX">
            <link rel="apple-touch-icon" href="apple-icon.png">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>GeoX</title>
            <style>
                body{
                    margin: 0;
                    padding: 0;
                    -webkit-tap-highlight-color: transparent;
                    -webkit-touch-callout: none; 
                    -webkit-user-select: none;   
                    -khtml-user-select: none;    
                    -moz-user-select: none;      
                    -ms-user-select: none;      
                    user-select: none;  
                    cursor: default;
                    font-family: 'Myriad Set Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    font-synthesis: none;
                    letter-spacing: normal;
                    text-rendering: optimizelegibility;
                    width: 100%;
                    height: 100%;
                }
                `
    reponse += fs.readFileSync(__dirname + "/../Frontend/App/0-leaflet.css", 'utf8')
    reponse +=`
                .leaflet-retina .leaflet-control-layers-toggle {
                    background-image: url("https://unpkg.com/leaflet@1.7.1/dist/images/layers-2x.png");
                }
            </style>
            <script>`
    reponse += fs.readFileSync(__dirname + "/../Frontend/App/0-leaflet.js", 'utf8')
    reponse += fs.readFileSync(__dirname + "/../Frontend/App/1-leaflet.geometryutil.js", 'utf8')
    reponse += fs.readFileSync(__dirname + "/../Frontend/App/2-leaflet-arrowheads.js", 'utf8')
    reponse += fs.readFileSync(__dirname + "/../Frontend/App/App_0-Icon.js", 'utf8')
    reponse += `
            </script>
        </head>
        <body>
            <div id="mapid" style="height: 100vh; width: 100%"></div>
        </body>
        <script>
            let ListeOfTracks = `+ JSON.stringify(DataMap) + `
            let CenterPoint = ListeOfTracks.CenterPoint
            let zoom= ListeOfTracks.Zoom
            FitBounds = ListeOfTracks.FitBounds
            // Creation de la carte
            var MyMap = null
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
            if (FitBounds == null){
                MyMap = L.map("mapid", {zoomControl: false, layers: [Openstreetmap]}).setView([CenterPoint.Lat, CenterPoint.Long], zoom);
            } else {
                MyMap = L.map("mapid" , {zoomControl: false, layers: [Openstreetmap]}).fitBounds(FitBounds);
            }
            L.control.zoom({position: 'bottomright'}).addTo(MyMap);
            L.control.layers(baseLayers,null,{position: 'bottomright'}).addTo(MyMap);

            // Creation du groupe de layer
            var MyLayerGroup = new L.LayerGroup()
            MyLayerGroup.addTo(MyMap)
            let me = this
            // Ajout des tracks sur la map
            setTimeout(function(){
                //MyMap.flyToBounds(FitBounds,{'duration':2} )
                ListeOfTracks.ListOfTracks.forEach(Track => {
                    // Style for tracks
                    var TrackWeight = 3
                    if (L.Browser.mobile){
                        TrackWeight = 6
                    }
                    var TrackStyle = {
                        "color": Track.Color,
                        "weight": TrackWeight
                    };
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
                    var layerTrack1=L.geoJSON(Track.GeoJsonData, {style: TrackStyle, arrowheads: {frequency: '80px', size: '18m', fill: true}}).addTo(MyLayerGroup).bindPopup(Track.Name + "<br>" + Track.Length + "km")
                    layerTrack1.id = Track._id
                    // Get Start and end point
                    var numPts = Track.GeoJsonData.features[0].geometry.coordinates.length;
                    var beg = Track.GeoJsonData.features[0].geometry.coordinates[0];
                    var end = Track.GeoJsonData.features[0].geometry.coordinates[numPts-1];
                    // Marker Start
                    var MarkerStart = new L.marker([beg[1],beg[0]], {icon: IconPointStartOption}).addTo(MyLayerGroup)
                    MarkerStart.id = Track._id + "start"
                    MarkerStart.dragging.disable();
                    // Marker End
                    var MarkerEnd = new L.marker([end[1],end[0]], {icon: IconPointEndOption}).addTo(MyLayerGroup)
                    MarkerEnd.id = Track._id + "end"
                    MarkerEnd.dragging.disable();
                });
            }, 500);
        </script>
    </html>`
    return reponse
}

/**
 * Get data of map by Id
 * @param {String or Array} ListOfTrackId liste des Id des tracks a trouver en DB
 * @param {res} res res
 */
async function GetMapDataById(ListOfTrackId, res, MyApp){
    // Build Tracks Data
    let Data = new Object()
    Data.IsError = false
    Data.ErrorMsg = "No Error"
    Data.ListOfTracks = []
    Data.CenterPoint = {Lat:50.709446, Long:4.543413}
    Data.FitBounds = null
    Data.Zoom = 8
    // Get Tracks
    let ReponseListOfTracks = await PromiseGetTracksByIdFromDb(ListOfTrackId, MyApp)
    if(ReponseListOfTracks.Error){
        MyApp.LogAppliError(ReponseListOfTracks.ErrorMsg)
        Data.IsError = true
        Data.ErrorMsg = ReponseListOfTracks.ErrorMsg
    } else {
        Data.ListOfTracks = ReponseListOfTracks.Data
    }
    if (Data.IsError){
        res.send("Error: " + Data.ErrorMsg)
    } else {
        // Calcul des point extérieur et du centre de toutes les tracks
        if (Data.ListOfTracks.length != 0){
            let Shared = require("./Shared")
            let MinMax = Shared.MinMaxOfTracks(Data.ListOfTracks)
            Data.CenterPoint.Long = (MinMax.MinLat + MinMax.MaxLat)/2
            Data.CenterPoint.Lat = (MinMax.MinLong + MinMax.MaxLong)/2
            Data.FitBounds = [ [MinMax.MaxLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MaxLat], [ MinMax.MinLong, MinMax.MaxLat ], [ MinMax.MinLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MinLat]] 
        }
        res.send(BuildHtmlGetMap(Data))
    }
}

/**
 * Rechercher les track par Id en DB
 * @param {String of Array} ListOfTrackId liste des ID des tracks a trouver en DB
 */
function PromiseGetTracksByIdFromDb(ListOfTrackId, MyApp){
    return new Promise(resolve => {
        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(MyApp.MongoUrl ,MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection

        let ReponseTracks = new Object()
        ReponseTracks.Error = true
        ReponseTracks.ErrorMsg = ""
        ReponseTracks.Data = null

        let searchindb = false
        let MongoObjectId = require('@gregvanko/corex').MongoObjectId
        var Querry = null
        if (typeof ListOfTrackId === 'object'){
            let list = []
            ListOfTrackId.forEach(element => {
                try {
                    list.push({'_id': new MongoObjectId(element)}) 
                } catch (error) {
                    // Error in new MongoObjectId
                }
            });
            if (list.length > 0){
                Querry= {$or:list}
                searchindb = true
            } else {
                ReponseTracks.ErrorMsg = "List of TrackId not good"
            }
        } else {
            try {
                Querry = {'_id': new MongoObjectId(ListOfTrackId)}
                searchindb = true
            } catch (error) {
                ReponseTracks.ErrorMsg = "List of TrackId not good"
            }
        }
        if (searchindb){
            const Projection = { projection:{[MongoTracksCollection.GpxData]: 0}}
            const Sort = {[MongoTracksCollection.Date]: -1}
            Mongo.FindSortPromise(Querry, Projection, Sort, MongoTracksCollection.Collection).then((reponse)=>{
                if(reponse.length == 0){
                    ReponseTracks.Error = false
                    ReponseTracks.ErrorMsg = null
                    ReponseTracks.Data = []
                } else {
                    ReponseTracks.Error = false
                    ReponseTracks.ErrorMsg = null
                    ReponseTracks.Data = reponse
                }
                resolve(ReponseTracks)
            },(erreur)=>{
                ReponseTracks.Error = true
                ReponseTracks.ErrorMsg = "GeoXServerApi PromiseGetTracksByIdFromDb error: " + erreur
                ReponseTracks.Data = []
                resolve(ReponseTracks)
            })
        } else {
            resolve(ReponseTracks)
        }
    })
}

module.exports.CallRouteGetMap = CallRouteGetMap