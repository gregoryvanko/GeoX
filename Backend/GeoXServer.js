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
        if ((Data.Value.Action != "SaveTrack") && (Data.Value.Action != "Add") && (Data.Value.Action != "GetElevation") && (Data.Value.Action != "ModifyDB")){
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
                    ModuleGeoX.CallSaveTrack(Data.Value.TrackId, Data.Value.Name, Data.Value.Group, Data.Value.Public, Data.Value.Description, this._MyApp,  Socket, User, UserId)
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
                    ModuleAdminManageTrack.CallGetData(this._MyApp,  Socket, User, UserId)

                    //***Modification de la DB
                    //let ModifyDB = require("./ModifyDb")
                    //ModifyDB.AddElevationToAlTracks(this._MyApp)
                } else if (Data.Value.Action == "GetTrackInfo"){
                    ModuleAdminManageTrack.CallGetTrackInfo(Data.Value.Data,this._MyApp,  Socket, User, UserId)
                } else if (Data.Value.Action == "ModifyDB"){
                    let ModuleModifyDb = require("./ModifyDb")
                    if (Data.Value.Data.SubAction == "GetGpx"){
                        ModuleModifyDb.GetGpx(this._MyApp, Data.Value.Data.Id, Socket)
                    }
                    if (Data.Value.Data.SubAction == "SaveImg"){
                        ModuleModifyDb.SaveImg(this._MyApp, Data.Value.Data.Id, Data.Value.Data.Img, Socket)
                    }
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
     * Fonction executee lors d'un appel a la route GET PageOfPost
     * @param {req} req request html GET
     * @param {res} res response html GET
     */
    GetPageOfPost(req, res){
        let MyRouteGetPageOfPost = require("./RouteGetPageOfPost")
        MyRouteGetPageOfPost.CallRouteGetPageOfPost(req, res, this._MyApp)
    }

    // GetDataOfPost(req, res){
    //     let MyRouteGetDataOfPost = require("./RouteGetDataOfPost")
    //     MyRouteGetDataOfPost.CallRouteGetDataOfPost(req, res, this._MyApp)
    // }

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

    async ApiGetAllPost(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetPostData: " + JSON.stringify(Data), User, UserId)
        let Shared = require("./Shared")
        let ReponsePostFromDb = await Shared.PromiseGetPostFromDb(this._MyApp, parseInt(Data.Page), Data.Filter, User, UserId)
        if(ReponsePostFromDb.Error){
            this._MyApp.LogAppliError(ReponsePostFromDb.ErrorMsg, "GetPageOfPost", "GetPageOfPost")
            Res.status("500").json(ReponsePostFromDb.ErrorMsg)
        } else {
            Res.status("200").json(ReponsePostFromDb)
        }
    }
    
    async ApiGetPostData(Data, Res, User, UserId){
        // Get Post data
        this._MyApp.LogAppliInfo("ApiGetPostData " + JSON.stringify(Data), User, UserId)
        let Shared = require("./Shared")
        let ReponseDataOfPostFromDb = await Shared.PromiseGetDataOfPostFromDb(this._MyApp, Data.PostId)
        if(ReponseDataOfPostFromDb.Error){
            this._MyApp.LogAppliError(ReponseDataOfPostFromDb.ErrorMsg, "GetDataOfPost", "GetDataOfPost")
            Res.status("500").json(ReponseDataOfPostFromDb)
        } else {
            Res.status("200").json(ReponseDataOfPostFromDb)
        }
    }

    ApiGetTrackData(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetTrackData: " + JSON.stringify(Data), User, UserId)
        let Shared = require("./Shared")
        Shared.ApiGetTrackData(this._MyApp, Data, Res, User, UserId)
    }

    ApiSaveTrack(Data, Res, User, UserId){
        let Shared = require("./Shared")
        if (Data.SaveType == "ById"){
            this._MyApp.LogAppliInfo("ApiSaveTrack: " + JSON.stringify(Data), User, UserId)
            Shared.ApiSaveTrackById(this._MyApp, Data, Res, User, UserId)
        } else {
            Res.json({Error: true, ErrorMsg: "SaveType not found: " + Data.SaveType, Data: ""})
            this._MyApp.LogAppliError(`ApiSaveTrack error, SaveType ${Data.SaveType} not found`, User, UserId)
        }
    }

    async ApiGetAllGroups(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetAllGroups", User, UserId)
        let Shared = require("./Shared")
        let ReponseUserGroup = await Shared.PromiseGetUserGroup(this._MyApp, User)
        if(!ReponseUserGroup.Error){
            Res.json({Error: false, ErrorMsg: "", Data:ReponseUserGroup.Data})
        } else {
            Res.json({Error: true, ErrorMsg: "ApiGetAllGroups error: " + ReponseUserGroup.ErrorMsg, Data: ""})
            this._MyApp.LogAppliError("ApiGetAllGroups error: " + ReponseUserGroup.ErrorMsg, User, UserId)
        }
    }

    ApiGetAllMarkers(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiGetAllMarkers " + JSON.stringify(Data), User, UserId)

        let numberofitem = 10
        let cursor = Data.Page * numberofitem

        let MongoR = require('@gregvanko/corex').Mongo
        Mongo = new MongoR(this._MyApp.MongoUrl ,this._MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        MongoTracksCollection = MongoConfig.TracksCollection

        let Query = {[MongoTracksCollection.Public]: true}
        if (Data.Filter != null){
            if ((Data.Filter.DistanceMin != 1) || (Data.Filter.DistanceMax != 200) || (Data.Filter.HideMyTrack != false)){
                if (Data.Filter.HideMyTrack){
                    Query = {
                        $and:[
                            {[MongoTracksCollection.Public]: true},
                            {[MongoTracksCollection.Length]:{$gte: Data.Filter.DistanceMin}},
                            {[MongoTracksCollection.Length]:{$lte: Data.Filter.DistanceMax}},
                            {[MongoTracksCollection.Owner]: { $ne: User }}
                        ]}
                } else {
                    Query = {
                        $and:[
                            {[MongoTracksCollection.Public]: true},
                            {[MongoTracksCollection.Length]:{$gte: Data.Filter.DistanceMin}},
                            {[MongoTracksCollection.Length]:{$lte: Data.Filter.DistanceMax}}
                        ]}
                }
            }
        }
        const Projection = {projection:{_id: 1, [MongoTracksCollection.Name]: 1, [MongoTracksCollection.Date]: 1, [MongoTracksCollection.Length]: 1, [MongoTracksCollection.Description]: 1, [MongoTracksCollection.InfoElevation]: 1, [MongoTracksCollection.StartPoint]: 1}}
        const Sort = {[MongoTracksCollection.Date]: -1}
        Mongo.FindSortLimitSkipPromise(Query, Projection, Sort, numberofitem, cursor, MongoTracksCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: "", Data:[]})
            } else {
                Res.json({Error: false, ErrorMsg: "", Data:reponse})
            }
        },(erreur)=>{
            Res.json({Error: true, ErrorMsg: "ApiGetAllMarkers error: " + erreur, Data: ""})
            this._MyApp.LogAppliError("ApiGetAllMarkers error: " + erreur, User, UserId)
        })
    }
}
module.exports.GeoXServer = GeoXServer