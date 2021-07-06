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
        // On Log tout sauve quand on fait un Add Track
        if ((Data.Value.Action != "SaveTrack") && (Data.Value.Action != "Add") && (Data.Value.Action != "GetElevation")){
            this._MyApp.LogAppliInfo("SoApi Data: " + JSON.stringify(Data), User, UserId)
        } else {
            this._MyApp.LogAppliInfo(`SoApi Data: {"Action":"${Data.Action}","Value":{"Action":"${Data.Value.Action}"}}`, User, UserId)
        }
        switch (Data.Action) {
            case "ModuleGeoX":
                let ModuleGeoX = require("./ModuleGeoX")
                if (Data.Value.Action == "GetInitialData"){
                    ModuleGeoX.CallGetInitialData(this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetTracksOfGroup"){
                    ModuleGeoX.CallGetTracksOfGroup(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "UpdateTrackColor"){
                    ModuleGeoX.CallUpdateTrack(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetMarkers"){
                    ModuleGeoX.CallGetMarkers(this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetTrack"){
                    ModuleGeoX.CallGetTrack(Data.Value, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "SaveTrack"){
                    ModuleGeoX.CallSaveTrack(Data.Value.TrackId, Data.Value.Name, Data.Value.Group, Data.Value.Public, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetTrackInfo"){
                    ModuleGeoX.CallGetTrackInfo(Data.Value.Data,this._MyApp,  Socket, User, UserId)
                }else {
                    this._MyApp.LogAppliError(`Api GeoXServer error, ModuleGeoX Action ${Data.Value.Action} not found`, User, UserId)
                    Socket.emit("GeoXError", `Api GeoXServer error, ModuleGeoX Action ${Data.Value.Action} not found`)
                }
                break
            case "ManageTrack":
                let ManageTrack = require("./ModuleManageTrack")
                if (Data.Value.Action == "GetUserData") {
                    ManageTrack.CallGetUserData(this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "Delete"){
                    ManageTrack.CallDeleteTrack(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "Add"){
                    ManageTrack.CallAddTrack(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "Update"){
                    ManageTrack.CallUpdateTrack(Data.Value.Data, this._MyApp, Socket, User, UserId)
                } else if (Data.Value.Action == "Download"){
                    ManageTrack.CallDownloadTrack(Data.Value.Data,this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetTrackInfo"){
                    ManageTrack.CallGetTrackInfo(Data.Value.Data,this._MyApp,  Socket, User, UserId)
                } else {
                    this._MyApp.LogAppliError(`Api GeoXServer error, ManageTrack Action ${Data.Value.Action} not found`, User, UserId)
                    Socket.emit("GeoXError", `Api GeoXServer error, ManageTrack Action ${Data.Value.Action} not found`)
                }
                break
            case "CreateTracksOnMap":
                let CreateTracksOnMap = require('./ModuleCreateTracksOnMap.js')
                if (Data.Value.Action == "GetUserGroup"){
                    CreateTracksOnMap.CallGetUserGroup(this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetMapData"){
                    CreateTracksOnMap.CallGetMapData(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "SaveTrack"){
                    CreateTracksOnMap.CallSaveTrack(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetTrackData"){
                    CreateTracksOnMap.CallGetTrackData(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetElevation"){
                    CreateTracksOnMap.CallGetElevation(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else {
                    this._MyApp.LogAppliError(`Api GeoXServer error, SearchTracksOnMap Action ${Data.Value.Action} not found`, User, UserId)
                    Socket.emit("GeoXError", `Api GeoXServer error, SearchTracksOnMap Action ${Data.Value.Action} not found`)
                }
                break
            case "AdminManageTrack":
                let ModuleAdminManageTrack = require("./ModuleAdminManageTrack")
                if (Data.Value.Action == "GetData") {
                    //ModuleAdminManageTrack.CallGetData(this._MyApp,  Socket, User, UserId)

                    //***Modification de la DB
                    let ModifyDB = require("./ModifyDb")
                    ModifyDB.AddElevationToAlTracks(this._MyApp)
                } else if (Data.Value.Action == "GetTrackInfo"){
                    ModuleAdminManageTrack.CallGetTrackInfo(Data.Value.Data,this._MyApp,  Socket, User, UserId)
                } else {
                    this._MyApp.LogAppliError(`Api GeoXServer error, AdminManageTrack Action ${Data.Value.Action} not found`, User, UserId)
                    Socket.emit("GeoXError", `Api GeoXServer error, AdminManageTrack Action ${Data.Value.Action} not found`)
                }
                break
            default:
                this._MyApp.LogAppliError(`Api GeoXServer error, Action ${Data.Action} not found`, User, UserId)
                Socket.emit("GeoXError", `Api GeoXServer error, Action ${Data.Action} not found`)
            break
        }
    }

    /**
     * Fonction executee lors d'un appel a la route GET Home
     * @param {req} req request html GET
     * @param {res} res response html GET
     */
    RouteGetHome(req, res){
        let MyRouteGetHome = require("./RouteGetHome")
        MyRouteGetHome.CallRouteGetHome(req, res, this._MyApp)
    }

    /**
     * Fonction executee lors d'un appel a la route GET getmap
     * @param {req} req request html GET
     * @param {res} res response html GET
     */
    RouteGetMap(req, res){
        // https://dev.gregvanko.com/getmap/?trackid=5fc12c5ebe87dc3b01725bd1&trackid=5fc12c0abe87dc3b01725bcb
        let MyRouteGetMap = require("./RouteGetMap")
        MyRouteGetMap.CallRouteGetMap(req, res, this._MyApp)
    }

    /**
     * Fonction executee lors de l'action de delete d'un user   
     * @param {String} DeleteUsesrId Id du user que l'on suppprime
     * @param {String} DeleteUserLogin Login du user que l'on delete
     * @param {String} User Login du user qui execute l'action
     * @param {String} UserId Id du user qui execute l'action
     */
    OnDeleteUser(DeleteUsesrId, DeleteUserLogin, User, UserId){
        return new Promise((resolve, reject) => {
            let Query = { [this._MongoTracksCollection.Owner]: DeleteUserLogin }
            this._Mongo.DeleteByQueryPromise(Query, this._MongoTracksCollection.Collection).then((reponse)=>{
                this._MyApp.LogAppliInfo(`delete action done for the user with id: ${DeleteUsesrId} and login:${DeleteUserLogin}`, User, UserId)
                resolve()
            },(erreur)=>{
                this._MyApp.LogAppliError("Error during deleting track of the user: " + erreur, User, UserId)
                reject()
            })           
        })
    }

    GetSplashScreen(){
        let fs = require('fs')
        let HtmlString = fs.readFileSync(__dirname + "/SplashScreen.html", 'utf8')
        HtmlString = HtmlString.replace(/\r?\n|\r/g, " ")
        return HtmlString
    }
}
module.exports.GeoXServer = GeoXServer