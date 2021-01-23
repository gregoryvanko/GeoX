class GeoXServer{
    constructor(MyApp){
        this._MyApp = MyApp

        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(this._MyApp.MongoUrl ,this._MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        this._MongoTracksCollection = MongoConfig.TracksCollection
    }
  
    /**
    * Socket API de la page TheWhatsBook
    * @param {Object} Data Object envoyé par SocketIO : Data.Action, Data.Value
    * @param {Socket} Socket SocketIO
    * @param {String} User Nom du user
    * @param {String} UserId Id du user
    */
    Api(Data, Socket, User, UserId){
        switch (Data.Action) {
            case "LoadAppData":
                this._MyApp.LogAppliInfo("SoApi GeoXServer Data:" + JSON.stringify(Data), User, UserId)
                //this.LoadAppData(Data.Value, Socket, User, UserId)

                // Modify Db
                let ModifyDb = require("./ModifyDb")
                ModifyDb.AddUserToAlTracks(this._MyApp, User)
                break
            case "LoadMapData":
                this._MyApp.LogAppliInfo("SoApi GeoXServer Data:" + JSON.stringify(Data), User, UserId)
                this.LoadMapData(Data.Value, Socket, User, UserId)
                break
            case "ManageTrack":
                if (Data.Value.Action == "Delete"){
                    this._MyApp.LogAppliInfo("SoApi GeoXServer Data:" + JSON.stringify(Data), User, UserId)
                    this.DeleteTrack(Data.Value, Socket, User, UserId)
                } else if (Data.Value.Action == "Add"){
                    this._MyApp.LogAppliInfo(`SoApi GeoXServer Data:{"Action":" ${Data.Action}","Value":"${Data.Value.Action}}"`, User, UserId)
                    this.AddTrack(Data.Value, Socket, User, UserId)
                } else if (Data.Value.Action == "Update"){
                    this._MyApp.LogAppliInfo(`SoApi GeoXServer Data:{"Action":" ${Data.Action}","Value":"${Data.Value.Action}}"`, User, UserId)
                    this.UpdateTrack(Data.Value, Socket, User, UserId)
                } else if (Data.Value.Action == "Download"){
                    this._MyApp.LogAppliInfo(`SoApi GeoXServer Data:`+ JSON.stringify(Data), User, UserId)
                    this.DownloadTrack(Data.Value.Data, Socket, User, UserId)
                } else {
                    this._MyApp.LogAppliError(`Api GeoXServer error, ManageTrack Action ${Data.Value.Action} not found`, User, UserId)
                    Socket.emit("GeoXError", `Api GeoXServer error, ManageTrack Action ${Data.Value.Action} not found`)
                }
                break
            default:
                this._MyApp.LogAppliError(`Api GeoXServer error, Action ${Data.Action} not found`, User, UserId)
                Socket.emit("GeoXError", `Api GeoXServer error, Action ${Data.Action} not found`)
            break
        }
    }

    /**
     * Load all Data of the App
     * @param {String} CurrentView Name of the current view
     * @param {Socket} Socket SocketIO
     * @param {String} User Nom du user
     * @param {String} UserId Id du user
     */
    async LoadAppData(CurrentView, Socket, User, UserId){
        let Data = {AppData: null, AppGroup: null, AppInitMapData: null}
        // Get all tracks info (but no track data)
        let ReponseAllTracksInfo = await this.PromiseGetAllTracksInfo(User)
        if(!ReponseAllTracksInfo.Error){
            Data.AppData = ReponseAllTracksInfo.Data
        } else {
            this._MyApp.LogAppliError(ReponseAllTracksInfo.ErrorMsg, User, UserId)
            Socket.emit("GeoXError", "GeoXServerApi PromiseGetAllTracksInfo error")
        }
        // Find all different group
        if (Data.AppData.length > 0){
            Data.AppGroup= [...new Set(Data.AppData.map(item => item.Group))] 
        } else {
            Data.AppGroup=[]
        }
          
        // Find all track data of the first group
        if (Data.AppGroup.length > 0){
            // Build Tracks Data
            Data.AppInitMapData = new Object()
            Data.AppInitMapData.ListOfTracks = []
            Data.AppInitMapData.CenterPoint = {Lat:50.709446, Long:4.543413}
            Data.AppInitMapData.Zoom = 8
            // Get Tracks
            let ReponseListOfTracks = await this.PromiseGetTracksData(Data.AppGroup[0], User)
            if(!ReponseListOfTracks.Error){
                Data.AppInitMapData.ListOfTracks = ReponseListOfTracks.Data
            } else {
                this._MyApp.LogAppliError(ReponseListOfTracks.ErrorMsg, User, UserId)
                Socket.emit("GeoXError", "GeoXServerApi PromiseGetTracksData error")
            }
            // Calcul des point extérieur et du centre de toutes les tracks
            if (Data.AppInitMapData.ListOfTracks.length != 0){
                let MinMax = this.MinMaxOfTracks(Data.AppInitMapData.ListOfTracks)
                Data.AppInitMapData.CenterPoint.Long = (MinMax.MinLat + MinMax.MaxLat)/2
                Data.AppInitMapData.CenterPoint.Lat = (MinMax.MinLong + MinMax.MaxLong)/2
                Data.AppInitMapData.FitBounds = [ [MinMax.MaxLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MaxLat], [ MinMax.MinLong, MinMax.MaxLat ], [ MinMax.MinLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MinLat]] 
            }
        } 
        //Send Data
        let StartupData = {StartView:CurrentView, Data: Data}
        Socket.emit("StartApp", StartupData)
        // Log socket action
        this._MyApp.LogAppliInfo(`SoApi send StartApp vue ${CurrentView}`, User, UserId)
    }

    /**
     * Load all the data for all tracks of one group
     * @param {String} GroupName Name of the group of tracks
     * @param {Socket} Socket SocketIO
     * @param {String} User Nom du user
     * @param {String} UserId Id du user
     */
    async LoadMapData(GroupName, Socket, User, UserId){
        // Build Tracks Data
        let Data = new Object()
        Data.ListOfTracks = []
        Data.CenterPoint = {Lat:50.709446, Long:4.543413}
        Data.Zoom = 8
        // Get Tracks
        let ReponseListOfTracks = await this.PromiseGetTracksData(GroupName, User)
        if(!ReponseListOfTracks.Error){
            Data.ListOfTracks = ReponseListOfTracks.Data
        } else {
            this._MyApp.LogAppliError(ReponseListOfTracks.ErrorMsg, User, UserId)
            Socket.emit("GeoXError", "GeoXServerApi PromiseGetTracksData error")
        }
        // Calcul des point extérieur et du centre de toutes les tracks
        if (Data.ListOfTracks.length != 0){
            let MinMax = this.MinMaxOfTracks(Data.ListOfTracks)
            Data.CenterPoint.Long = (MinMax.MinLat + MinMax.MaxLat)/2
            Data.CenterPoint.Lat = (MinMax.MinLong + MinMax.MaxLong)/2
            Data.FitBounds = [ [MinMax.MaxLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MaxLat], [ MinMax.MinLong, MinMax.MaxLat ], [ MinMax.MinLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MinLat]] 
        }
        // Send tracks
        Socket.emit("ModifyTracksOnMap", Data)
        // Log socket action
        this._MyApp.LogAppliInfo("SoApi send ModifyTracksOnMap", User, UserId)
    }

    /**
     * Get Tracks info from DB for one User (promise)
     */
    PromiseGetAllTracksInfo(User){
        return new Promise(resolve => {
            let ReponseTracks = {Error: true, ErrorMsg:"InitError", Data:null}
            const Querry = {[this._MongoTracksCollection.Owner]: User}
            const Projection = { projection:{_id: 1, [this._MongoTracksCollection.Name]: 1, [this._MongoTracksCollection.Group]: 1, [this._MongoTracksCollection.Color]: 1, [this._MongoTracksCollection.Date]: 1, [this._MongoTracksCollection.ExteriorPoint]: 1, [this._MongoTracksCollection.Length]: 1}}
            const Sort = {[this._MongoTracksCollection.Date]: -1}
            this._Mongo.FindSortPromise(Querry, Projection, Sort, this._MongoTracksCollection.Collection).then((reponse)=>{
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
                ReponseTracks.ErrorMsg = "GeoXServerApi PromiseGetAllTracksInfo error: " + erreur
                ReponseTracks.Data = []
                resolve(ReponseTracks)
            })
        })
    }

    /**
     * Get Tracks Data from DB (promise)
     */
    PromiseGetTracksData(GroupName, User){
        return new Promise(resolve => {
            let ReponseTracks = new Object()
            ReponseTracks.Error = true
            ReponseTracks.ErrorMsg = ""
            ReponseTracks.Data = null
            const Querry = {$and: [{[this._MongoTracksCollection.Group]: GroupName},{[this._MongoTracksCollection.Owner]: User}]}
            const Projection = { projection:{[this._MongoTracksCollection.GpxData]: 0}}
            const Sort = {[this._MongoTracksCollection.Date]: -1}
            this._Mongo.FindSortPromise(Querry, Projection, Sort, this._MongoTracksCollection.Collection).then((reponse)=>{
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
                ReponseTracks.ErrorMsg = "GeoXServerApi PromiseGetTracksData error: " + erreur
                ReponseTracks.Data = []
                resolve(ReponseTracks)
            })
        })
    }

    /**
     * Calcul le lat et long min et max de toutes les tracks
     * @param {Array} ListOfTracks liste de toutes les tracks
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
     * Calcul les lat et long min et max d'une track contenue dans un object GeoJson
     * @param {geojson object} geojson Object GeaoJson d'une track
     */
    MinMaxGeoJsonTrack(geojson){
        let reponse = new Object()
        reponse.IsError = false
        reponse.ErrorMsg = "no error"
        reponse.Data = null
        const listofcoordonate = geojson.features[0].geometry.coordinates
        const LineType = geojson.features[0].geometry.type
        let MinLat1 = null
        let MaxLat1 = null
        let MinLong1 = null
        let MaxLong1 = null
        if (LineType == "LineString"){
            listofcoordonate.forEach(element => {
                if(MinLat1 == null){
                    MinLat1 = element[0]
                } else {
                    if(element[0] < MinLat1){MinLat1 = element[0]}
                }
                if(MaxLat1 == null){
                    MaxLat1 = element[0]
                } else {
                    if(element[0] > MaxLat1){MaxLat1 = element[0]}
                }
                if(MinLong1 == null){
                    MinLong1 = element[1]
                } else {
                    if(element[1] < MinLong1){MinLong1 = element[1]}
                }
                if(MaxLong1 == null){
                    MaxLong1 = element[1]
                } else {
                    if(element[1] > MaxLong1){MaxLong1 = element[1]}
                }
            });
        } else if (LineType == "MultiLineString"){
            listofcoordonate.forEach(OneListe => {
                OneListe.forEach(element => {
                    if(MinLat1 == null){
                        MinLat1 = element[0]
                    } else {
                        if(element[0] < MinLat1){MinLat1 = element[0]}
                    }
                    if(MaxLat1 == null){
                        MaxLat1 = element[0]
                    } else {
                        if(element[0] > MaxLat1){MaxLat1 = element[0]}
                    }
                    if(MinLong1 == null){
                        MinLong1 = element[1]
                    } else {
                        if(element[1] < MinLong1){MinLong1 = element[1]}
                    }
                    if(MaxLong1 == null){
                        MaxLong1 = element[1]
                    } else {
                        if(element[1] > MaxLong1){MaxLong1 = element[1]}
                    }
                });
            });
        } else {
            reponse.IsError = true
            reponse.ErrorMsg = "LineType not know in GeoJson file"
        }
        reponse.Data = {MinLat:MinLat1, MaxLat:MaxLat1, MinLong:MinLong1, MaxLong:MaxLong1}
        return reponse
    }

    /**
     * Delete d'une track
     * @param {Object} Value {Data: Id of track to delete, FromCurrentView: name of the current view}
     * @param {Socket} Socket SocketIO
     * @param {String} User Nom du user
     * @param {String} UserId Id du user
     */
    DeleteTrack(Value, Socket, User, UserId){
        this._Mongo.DeleteByIdPromise(Value.Data, this._MongoTracksCollection.Collection).then((reponse)=>{
            // Log
            this._MyApp.LogAppliInfo("Track deleted", User, UserId)
            // Load App Data
            this.LoadAppData(Value.FromCurrentView, Socket, User, UserId)
        },(erreur)=>{
            this._MyApp.LogAppliError("GeoXServerApi DeleteTrack DB error : " + erreur, User, UserId)
            Socket.emit("GeoXError", "GeoXServerApi DeleteTrack error")
        })
    }

    /**
     * 
     * @param {Object} Value {Data: DataTrack to add, FromCurrentView: name of the current view}
     * @param {Socket} Socket SocketIO
     * @param {String} User Nom du user
     * @param {String} UserId Id du user
     */
    AddTrack(Value, Socket, User, UserId){
        const Track = Value.Data
        let GeoJson = this.ConvertGpxToGeoJson(Track.FileContent)
        const MultiToOneLine = Track.MultiToOneLine
        // Si on a un GeoJson avec plusieurs line pour une track on le modifie
        if ((MultiToOneLine) && (GeoJson.features[0].geometry.type == "MultiLineString")){
            // Changer le type en LineString
            GeoJson.features[0].geometry.type = "LineString"
            // Fusionner les coodronnee
            const listofcoordonate = GeoJson.features[0].geometry.coordinates
            let NewListofcoordonate = []
            listofcoordonate.forEach(OneListe => {
                OneListe.forEach(element => {
                    NewListofcoordonate.push(element)
                });
            });
            GeoJson.features[0].geometry.coordinates = NewListofcoordonate
        }
        let TrackData = new Object()
        TrackData.Name = Track.Name
        TrackData.Group = Track.Group
        TrackData.Color = "#0000FF"
        TrackData.Date = new Date()
        let ReponseMinMaxGeoJsonTrack = this.MinMaxGeoJsonTrack(GeoJson)
        if (ReponseMinMaxGeoJsonTrack.IsError){
            this._MyApp.LogAppliError("GeoXServerApi AddTrack MinMaxGeoJsonTrack error : " + ReponseMinMaxGeoJsonTrack.ErrorMsg, User, UserId)
            Socket.emit("GeoXError", "GeoXServerApi AddTrack MinMaxGeoJsonTrack :" + ReponseMinMaxGeoJsonTrack.ErrorMsg)
        } else {
            TrackData.ExteriorPoint = ReponseMinMaxGeoJsonTrack.Data
            TrackData.GeoJsonData = GeoJson
            TrackData.GpxData = Track.FileContent
            TrackData.Length = this.CalculateTrackLength(GeoJson)
    
            let DataToMongo = TrackData
            this._Mongo.InsertOnePromise(DataToMongo, this._MongoTracksCollection.Collection).then((reponseCreation)=>{
                // Log
                this._MyApp.LogAppliInfo("New track saved", User, UserId)
                // Load App Data
                this.LoadAppData(Value.FromCurrentView, Socket, User, UserId)
            },(erreur)=>{
                this._MyApp.LogAppliError("GeoXServerApi AddTrack DB error : " + erreur, User, UserId)
                Socket.emit("GeoXError", "GeoXServerApi AddTrack DB error")
            })
        }
    }

    /**
     * Convertir un fichier GPX en GeoJson
     * @param {String} FilePathandName path et name du fichier Gpx
     */
    ConvertGpxToGeoJson(FileContent){
        var tj = require('@mapbox/togeojson')
        var DOMParser = require('xmldom').DOMParser
        var Mygpx = new DOMParser().parseFromString(FileContent)
        var converted = tj.gpx(Mygpx)
        return converted
    }

    /**
     * update d'une track
     * @param {Object} Value {Data: Object Track {Id: Id de la track a updater, Name: Nom de la track, Group: group de la track, Color: Color de la track}}
     * @param {Socket} Socket SocketIO
     * @param {String} User Nom du user
     * @param {String} UserId Id du user
     */
    UpdateTrack(Value, Socket, User, UserId){
        let Track = Value.Data
        let DataToDb = new Object()
        if(Track.Name){DataToDb[this._MongoTracksCollection.Name]= Track.Name}
        if(Track.Group){DataToDb[this._MongoTracksCollection.Group]= Track.Group}
        if (Track.Color){DataToDb[this._MongoTracksCollection.Color]= Track.Color}
        
        this._Mongo.UpdateByIdPromise(Track.Id, DataToDb, this._MongoTracksCollection.Collection).then((reponse)=>{
            if (reponse.matchedCount == 0){
                this._MyApp.LogAppliError("GeoXServerApi UpdateTrack Track Id not found", User, UserId)
                Socket.emit("GeoXError", "GeoXServerApi UpdateTrack Track Id not found")
            } else {
                // Log
                this._MyApp.LogAppliInfo("Track Updated", User, UserId)
                // Load App Data
                if (Value.FromCurrentView != null){
                    this.LoadAppData(Value.FromCurrentView, Socket, User, UserId)
                }
            }
        },(erreur)=>{
            this._MyApp.LogAppliError("GeoXServerApi UpdateTrack DB error : " + erreur, User, UserId)
            Socket.emit("GeoXError", "GeoXServerApi UpdateTrack DB error")
        })
    }

    /**
     * Calcule la longeur en Km d'une track
     * @param {GeoJson} GeoJson GeoJson object de la track
     */
    CalculateTrackLength(GeoJson){
        var Turf = require('@turf/length').default
        let distance = Math.round((Turf(GeoJson) + Number.EPSILON) * 1000) / 1000
        return distance
    }

    DownloadTrack(Value, Socket, User, UserId){
        let MongoObjectId = require('@gregvanko/corex').MongoObjectId
        var Projection = {}
        if (Value.Type == "gpx"){
            Projection = { projection:{[this._MongoTracksCollection.GpxData]: 1}}
        } else {
            Projection = { projection:{[this._MongoTracksCollection.GeoJsonData]: 1}}
        }
        const Sort = {[this._MongoTracksCollection.Date]: -1}
        const Querry = {'_id': new MongoObjectId(Value.Id)}
        this._Mongo.FindSortPromise(Querry, Projection, Sort, this._MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                this._MyApp.LogAppliError("GeoXServerApi DownloadTrack Track Id not found", User, UserId)
                Socket.emit("GeoXError", "GeoXServerApi DownloadTrack Track Id not found")
            } else {
                // Log
                this._MyApp.LogAppliInfo("Track Downloaded", User, UserId)
                let Data = new Object()
                Data.Type = Value.Type
                if (Value.Type == "gpx"){
                    Data.File = reponse[0][this._MongoTracksCollection.GpxData]
                } else {
                    Data.File = JSON.stringify(reponse[0][this._MongoTracksCollection.GeoJsonData])
                }
                
                // Send tracks
                Socket.emit("DownloadFile", Data)
            }

        },(erreur)=>{
            this._MyApp.LogAppliError("GeoXServerApi DownloadTrack DB error : " + erreur, User, UserId)
            Socket.emit("GeoXError", "GeoXServerApi DownloadTrack DB error")
        })
    }

    /**
     * Fonction executee lors d'un appel a la route GET getmap
     * @param {req} req request html GET
     * @param {res} res response html GET
     */
    RouteGetMap(req, res){
        // https://dev.gregvanko.com/getmap/?trackid=5fc12c5ebe87dc3b01725bd1&trackid=5fc12c0abe87dc3b01725bcb
        let ListOfTrackId = req.query["trackid"]
        if (ListOfTrackId) {
            this.GetMapDataById(ListOfTrackId, res)
        } else {
            res.send("No trackid defined in url query")
        }
    }

    /**
     * Construction de la page HTML avec les tracks a montrer
     * @param {Object} DataMap Object contenant les data des map
     */
    BuildHtmlGetMap(DataMap){
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
        reponse += fs.readFileSync(__dirname + "/../Frontend/App/MarkerIcon.js", 'utf8')
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
    async GetMapDataById(ListOfTrackId, res){
        // Build Tracks Data
        let Data = new Object()
        Data.IsError = false
        Data.ErrorMsg = "No Error"
        Data.ListOfTracks = []
        Data.CenterPoint = {Lat:50.709446, Long:4.543413}
        Data.FitBounds = null
        Data.Zoom = 8
        // Get Tracks
        let ReponseListOfTracks = await this.PromiseGetTracksByIdFromDb(ListOfTrackId)
        if(!ReponseListOfTracks.Error){
            Data.ListOfTracks = ReponseListOfTracks.Data
        } else {
            this._MyApp.LogAppliError(ReponseListOfTracks.ErrorMsg)
            Data.IsError = true
            Data.ErrorMsg = ReponseListOfTracks.ErrorMsg
        }
        if (Data.IsError){
            res.send("Error: " + Data.ErrorMsg)
        } else {
        // Calcul des point extérieur et du centre de toutes les tracks
            if (Data.ListOfTracks.length != 0){
                let MinMax = this.MinMaxOfTracks(Data.ListOfTracks)
                Data.CenterPoint.Long = (MinMax.MinLat + MinMax.MaxLat)/2
                Data.CenterPoint.Lat = (MinMax.MinLong + MinMax.MaxLong)/2
                Data.FitBounds = [ [MinMax.MaxLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MaxLat], [ MinMax.MinLong, MinMax.MaxLat ], [ MinMax.MinLong, MinMax.MinLat], [MinMax.MaxLong, MinMax.MinLat]] 
            }
            res.send(this.BuildHtmlGetMap(Data))
        }
    }

    /**
     * Rechercher les track par Id en DB
     * @param {String of Array} ListOfTrackId liste des ID des tracks a trouver en DB
     */
    PromiseGetTracksByIdFromDb(ListOfTrackId){
        return new Promise(resolve => {
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
                const Projection = { projection:{[this._MongoTracksCollection.GpxData]: 0}}
                const Sort = {[this._MongoTracksCollection.Date]: -1}
                this._Mongo.FindSortPromise(Querry, Projection, Sort, this._MongoTracksCollection.Collection).then((reponse)=>{
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
  }
  
module.exports.GeoXServer = GeoXServer