class GeoX {
    constructor(Name = "AppName", Port = 4000, Debug = true){
       // Creation de l'application CoreX
       let corex = require('@gregvanko/corex').corex
       this._OptionApplication = {
          AppName: Name,
          Port: Port,
          Secret: "GeoXAppSecret",
          MongoUrl: "mongodb://localhost:27017"
       }
       this._MyApp = new corex(this._OptionApplication)
       this._Debug = Debug
       //let AppTheClientR = require('./Backend/AppTheClient').AppTheClient
       //this._AppTheClient = new AppTheClientR(this._MyApp)
    }
 
    /* Start de l'application */
    Start(){
       // Css de l'application CoreX
       const CSS= {
          FontSize:{
             TexteNomrale:"1.5vw", //--CoreX-font-size
             TexteIphone:"3vw", //--CoreX-Iphone-font-size
             TexteMax:"18px", //--CoreX-Max-font-size
             TitreNormale:"4vw", //--CoreX-Titrefont-size
             TitreIphone:"7vw", //--CoreX-TitreIphone-font-size
             TitreMax:"50px" //--CoreX-TitreMax-font-size
          },
          Color:{
             Normale:"rgb(20, 163, 255)" //--CoreX-color
          },
          AppContent:{
             WidthNormale:"96%",
             WidthIphone:"96%",
             WidthMax:"1100px"
         }
       }
       // Affichier les message de debug du serveur
       this._MyApp.Debug = this._Debug
       // L'application est elle securisee par un login
       this._MyApp.AppIsSecured = true
       // Css de base de l'application
       this._MyApp.CSS = CSS
       // L'application utilise SocketIo
       this._MyApp.Usesocketio = true
       // Chemin vers le dossier contenant les sources Js et CSS de l'app client
       this._MyApp.ClientAppFolder = __dirname + "/Frontend/App"
       // Chemin vers le dossier contenant les sources Js et CSS de l'app Admin
       //this._MyApp.AdminAppFolder = __dirname + "/Frontend/Admin"
       // Chemin vers le dossier contenant les sources Js et CSS Commun
       this._MyApp.CommonAppFolder = __dirname + "/Frontend/Common"
       // Chemin relatif de l'icone
       //this._MyApp.IconRelPath = __dirname + "/apple-icon-192x192.png"
       // Chemin relatif du dossier video
       //this._MyServeurApp.VideoFolder = __dirname + "/Video"
       // Set Tag name du serveur video
       //this._MyServeurApp.VideoTagName = "name"
       // SocketIo
       //this._MyApp.AddSocketIoFct("TheClientApp", this._AppTheClient.Api.bind(this._AppTheClient))
       // Start
       this._MyApp.Start()
       }
 }
 
 module.exports.GeoX = GeoX