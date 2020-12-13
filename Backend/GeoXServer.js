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
                this.LoadAppData(Data.Value, Socket, User, UserId)
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
                }else if (Data.Value.Action == "Update"){
                    this._MyApp.LogAppliInfo(`SoApi GeoXServer Data:{"Action":" ${Data.Action}","Value":"${Data.Value.Action}}"`, User, UserId)
                    this.UpdateTrack(Data.Value, Socket, User, UserId)
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
        let ReponseAppData = await this.PromiseGetAppDataFromDb()
        if(!ReponseAppData.Error){
            Data.AppData = ReponseAppData.Data
        } else {
            this._MyApp.LogAppliError(ReponseAppData.ErrorMsg, User, UserId)
            Socket.emit("GeoXError", "GeoXServerApi PromiseGetAppDataFromDb error")
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
            let ReponseListOfTracks = await this.PromiseGetTracksFromDb(Data.AppGroup[0])
            if(!ReponseListOfTracks.Error){
                Data.AppInitMapData.ListOfTracks = ReponseListOfTracks.Data
            } else {
                this._MyApp.LogAppliError(ReponseListOfTracks.ErrorMsg, User, UserId)
                Socket.emit("GeoXError", "GeoXServerApi PromiseGetTracksFromDb error")
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
        let ReponseListOfTracks = await this.PromiseGetTracksFromDb(GroupName)
        if(!ReponseListOfTracks.Error){
            Data.ListOfTracks = ReponseListOfTracks.Data
        } else {
            this._MyApp.LogAppliError(ReponseListOfTracks.ErrorMsg, User, UserId)
            Socket.emit("GeoXError", "GeoXServerApi PromiseGetTracksFromDb error")
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
     * Get App Data from DB (promise)
     */
    PromiseGetAppDataFromDb(){
        return new Promise(resolve => {
            let ReponseTracks = {Error: true, ErrorMsg:"InitError", Data:null}
            const Querry = {}
            const Projection = { projection:{_id: 1, [this._MongoTracksCollection.Name]: 1, [this._MongoTracksCollection.Group]: 1, [this._MongoTracksCollection.Color]: 1, [this._MongoTracksCollection.Date]: 1, [this._MongoTracksCollection.Length]: 1}}
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
                ReponseTracks.ErrorMsg = "GeoXServerApi PromiseGetAppDataFromDb error: " + erreur
                ReponseTracks.Data = []
                resolve(ReponseTracks)
            })
        })
    }

    /**
     * Get Tracks Data from DB (promise)
     */
    PromiseGetTracksFromDb(GroupName){
        return new Promise(resolve => {
            let ReponseTracks = new Object()
            ReponseTracks.Error = true
            ReponseTracks.ErrorMsg = ""
            ReponseTracks.Data = null
            const Querry = {[this._MongoTracksCollection.Group]: GroupName}
            const Projection = { projection:{[this._MongoTracksCollection.GpxData]: 0}}
            //const Projection = { projection:{_id: 1, [this._MongoTracksCollection.Name]: 1, [this._MongoTracksCollection.Color]: 1, [this._MongoTracksCollection.Group]: 1, [this._MongoTracksCollection.Date]: 1, [this._MongoTracksCollection.ExteriorPoint]: 1, [this._MongoTracksCollection.GeoJsonData]: 1, [this._MongoTracksCollection.Length]: 1 }}
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
                ReponseTracks.ErrorMsg = "GeoXServerApi PromiseGetTracksFromDb error: " + erreur
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
        let listofcoordonate = geojson.features[0].geometry.coordinates
        let MinLat1 = null
        let MaxLat1 = null
        let MinLong1 = null
        let MaxLong1 = null
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
        return {MinLat:MinLat1, MaxLat:MaxLat1, MinLong:MinLong1, MaxLong:MaxLong1}
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
        let Track = Value.Data
        let GeoJson = this.ConvertGpxToGeoJson(Track.FileContent)
        let TrackData = new Object()
        TrackData.Name = Track.Name
        TrackData.Group = Track.Group
        TrackData.Color = "#0000FF"
        TrackData.Date = new Date()
        TrackData.ExteriorPoint = this.MinMaxGeoJsonTrack(GeoJson)
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
        let distance = Math.round((Turf(GeoJson) + Number.EPSILON) * 100) / 100
        return distance
    }

    /**
     * Fonction executant un update du calcul de la longeur pour toutes les track de la DB
     * @param {String} User Nom du user
     * @param {String} UserId Id du user
     */
    UpdateLengthOfAllTracksInDb(User, UserId){
        const Querry = {}
        const Projection = { projection:{}}
        const Sort = {[this._MongoTracksCollection.Date]: -1}
        this._Mongo.FindSortPromise(Querry, Projection, Sort, this._MongoTracksCollection.Collection).then((reponse)=>{
            reponse.forEach(element => {
                let GeoJsonData = element.GeoJsonData
                let id = element._id
                let dist = this.CalculateTrackLength(GeoJsonData)
                let DataToDb = new Object()
                DataToDb[this._MongoTracksCollection.Length]=dist
                this._Mongo.UpdateByIdPromise(id, DataToDb, this._MongoTracksCollection.Collection).then((reponse)=>{
                    if (reponse.matchedCount == 0){
                        this._MyApp.LogAppliError("UpdateTrack Track Id not found", User, UserId)
                    } else {
                        // Log
                        this._MyApp.LogAppliInfo("Track Updated", User, UserId)
                        // Load App Data
                    }
                },(erreur)=>{
                    this._MyApp.LogAppliError("UpdateTrack DB error : " + erreur, User, UserId)
                })
            });
        },(erreur)=>{
            console.log("error: " + erreur)
        })
    }

    /**
     * Fonction executee lors d'un appel a la route GET getmap
     * @param {req} req request html GET
     * @param {res} res response html GET
     */
    RouteGetMap(req, res){
        let ListOfTrackId = req.query["trackid"]
        if (ListOfTrackId) {
            if (typeof ListOfTrackId === 'object'){
                ListOfTrackId.forEach(element => {
                    console.log(element)
                });
                res.send("Object of trackid")
            } else {
                console.log(ListOfTrackId)
                res.send("Une trackid def")
            }
        } else {
            res.send("No trackid defined in url query")
        }
        
    }

  }
  
module.exports.GeoXServer = GeoXServer