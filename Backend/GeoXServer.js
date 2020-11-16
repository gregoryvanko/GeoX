class GeoXServer{
    constructor(MyApp){
        this._MyApp = MyApp
    }
  
    /**
    * Socket API de la page TheWhatsBook
    * @param {Object} Data Object envoyé par SocketIO : Data.Action, Data.Value
    * @param {Socket} Socket SocketIO
    * @param {String} User Nom du user
    * @param {String} UserId Id du user
    */
    Api(Data, Socket, User, UserId){
        this._MyApp.LogAppliInfo("SoApi GeoXServer Data:" + JSON.stringify(Data), User, UserId)
        switch (Data.Action) {
            case "Start":
                this.Start(Data.Value, Socket, User, UserId)
                break
            default:
                this._MyApp.LogAppliError(`Api GeoXServer error, Action ${Data.Action} not found`, User, UserId)
                Socket.emit("GeoXError", `Api GeoXServer error, Action ${Data.Action} not found`)
            break
        }
    }
  
    /**
    * Message envoyé par le client lors du strat de l'application
    * @param {String} Value Valeur envoyé par le client
    * @param {Socket} Socket SocketIO
    * @param {String} User nom du user
    * @param {String} UserId Id du user
    */
    Start(Value, Socket, User, UserId){
        // Get all GeoJson data from db
        let ListOfGeoJsonData = null
        Socket.emit("StartGeoXApp", ListOfGeoJsonData)
    }
  }
  
module.exports.GeoXServer = GeoXServer