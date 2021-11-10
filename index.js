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
       let GeoXServerR = require('./Backend/GeoXServer').GeoXServer
       this._GeoXServer = new GeoXServerR(this._MyApp)
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
             WidthNormale:"100%",
             WidthIphone:"100%",
             WidthMax:"100%"
         }
       }
       // Affichier les message de debug du serveur
       this._MyApp.Debug = this._Debug
       // L'application est elle securisee par un login
       this._MyApp.AppIsSecured = true
       // L'application permet elle au user de creer son compte
       this._MyApp.AllowSignUp= true
       // Css de base de l'application
       this._MyApp.CSS = CSS
       // L'application utilise SocketIo
       this._MyApp.Usesocketio = true
       // Chemin vers le dossier contenant les sources Js et CSS de l'app client
       this._MyApp.ClientAppFolder = __dirname + "/Frontend/App"
       // Chemin vers le dossier contenant les sources Js et CSS de l'app Admin
       this._MyApp.AdminAppFolder = __dirname + "/Frontend/Admin"
       // Chemin vers le dossier contenant les sources Js et CSS Commun
       this._MyApp.CommonAppFolder = __dirname + "/Frontend/Common"
       // Chemin relatif de l'icone
       this._MyApp.IconRelPath = __dirname + "/Backend/apple-icon-192x192.png"

       // App link
       this._MyApp.AppLink = "App"

       // Splash Screen
       this._MyApp.SplashScreen = this._GeoXServer.GetSplashScreen()
       this._MyApp.SplashScreenBackgroundColor = "Black"

       // Function to execute when a user is deleted
       this._MyApp.OnDeleteUser = this._GeoXServer.OnDeleteUser.bind(this._GeoXServer)

       // SocketIo
       this._MyApp.AddSocketIoFct("GeoX", this._GeoXServer.Api.bind(this._GeoXServer))

       // Route Home
       this._MyApp.AddRouteGet("", this._GeoXServer.RouteGetHome.bind(this._GeoXServer))
       // Route GetMap
       this._MyApp.AddRouteGet("getmap", this._GeoXServer.RouteGetMap.bind(this._GeoXServer))
       // Route Get page of post
       this._MyApp.AddRouteGet("getpageofpost/:page", this._GeoXServer.GetPageOfPost.bind(this._GeoXServer))
       // Route Get post Data
       this._MyApp.AddRouteGet("getdataofpost/:post", this._GeoXServer.GetDataOfPost.bind(this._GeoXServer))

      // API
      this._MyApp.AddApiFct("GetTrackData", this._GeoXServer.GetTrackDataApi.bind(this), false)
      this._MyApp.AddApiFct("SaveTrack", this._GeoXServer.SaveTrackApi.bind(this), false)
         
      // Start
      this._MyApp.Start()
   }
 }
 
 module.exports.GeoX = GeoX