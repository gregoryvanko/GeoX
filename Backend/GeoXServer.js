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
        if ((Data.Value.Action != "SaveTrack") || (Data.Value.Action != "Add")){
            this._MyApp.LogAppliInfo("SoApi Data:" + JSON.stringify(Data), User, UserId)
        }
        switch (Data.Action) {
            case "ShowTracksOnMap":
                let ShowTracksOnMap = require("./ShowTracksOnMap")
                if (Data.Value.Action == "GetUserData"){
                    ShowTracksOnMap.CallGetUserData(this._MyApp,  Socket, User, UserId)

                    // Modify Db
                    //let ModifyDb = require("./ModifyDb")
                    //ModifyDb.CalculCenterofAlTracks(this._MyApp)
                    //ModifyDb.AddPublicToAlTracks(this._MyApp)
                    //ModifyDb.AddStartPointToAlTracks(this._MyApp)
                } else if (Data.Value.Action == "GetMapData"){
                    ShowTracksOnMap.CallGetMapData(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "UpdateTrackColor"){
                    ShowTracksOnMap.CallUpdateTrack(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else {
                    this._MyApp.LogAppliError(`Api GeoXServer error, ShowTracksOnMap Action ${Data.Value.Action} not found`, User, UserId)
                    Socket.emit("GeoXError", `Api GeoXServer error, ShowTracksOnMap Action ${Data.Value.Action} not found`)
                }
                break
            case "ManageTrack":
                let ManageTrack = require("./ManageTrack")
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
                } else {
                    this._MyApp.LogAppliError(`Api GeoXServer error, ManageTrack Action ${Data.Value.Action} not found`, User, UserId)
                    Socket.emit("GeoXError", `Api GeoXServer error, ManageTrack Action ${Data.Value.Action} not found`)
                }
                break
            case "SearchTracksOnMap":
                let SearchTracksOnMap = require("./SearchTracksOnMap")
                if (Data.Value.Action == "GetUserGroup"){
                    SearchTracksOnMap.CallGetUserGroup(this._MyApp,  Socket, User, UserId)
                } else if(Data.Value.Action == "GetMarkers"){
                    SearchTracksOnMap.CallGetMarkers(this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "SaveTrack"){
                    SearchTracksOnMap.CallSaveTrack(Data.Value.TrackId, Data.Value.Name, Data.Value.Group, Data.Value.Public, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetTrack"){
                    SearchTracksOnMap.CallGetTrack(Data.Value.TrackId, this._MyApp,  Socket, User, UserId)
                } else {
                    this._MyApp.LogAppliError(`Api GeoXServer error, SearchTracksOnMap Action ${Data.Value.Action} not found`, User, UserId)
                    Socket.emit("GeoXError", `Api GeoXServer error, SearchTracksOnMap Action ${Data.Value.Action} not found`)
                }
                break
            case "CreateTracksOnMap":
                let CreateTracksOnMap = require('./CreateTracksOnMap.js')
                if (Data.Value.Action == "GetUserGroup"){
                    CreateTracksOnMap.CallGetUserGroup(this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "GetMapData"){
                    CreateTracksOnMap.CallGetMapData(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "SaveTrack"){
                    CreateTracksOnMap.CallSaveTrack(Data.Value.Data, this._MyApp,  Socket, User, UserId)
                } else {
                    this._MyApp.LogAppliError(`Api GeoXServer error, SearchTracksOnMap Action ${Data.Value.Action} not found`, User, UserId)
                    Socket.emit("GeoXError", `Api GeoXServer error, SearchTracksOnMap Action ${Data.Value.Action} not found`)
                }
                break
            default:
                this._MyApp.LogAppliError(`Api GeoXServer error, Action ${Data.Action} not found`, User, UserId)
                Socket.emit("GeoXError", `Api GeoXServer error, Action ${Data.Action} not found`)
            break
        }
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
}
module.exports.GeoXServer = GeoXServer