let NanoXAddRoute = require("@gregvanko/nanox").NanoXAddRoute

async function Start(Port = 1234, Name = "NanoXDev", Debug = false){

   // NonoX Option
   const OptionNanoX = {
       AppName: Name,
       AppColor: "rgb(20, 163, 255)",
       AppPort: Port,
       AppSecret: "TestNonoXSecret",
       MongoUrl: "mongodb://localhost:27017",
       Debug: Debug,
       IconPath:  __dirname + "/Backend/apple-icon-192x192.png",
       ApiServer: true,
       AllowSignUp: true,
       AppPath: "app",
       NanoXAppOption : {
           SplashScreen : GetSplashScreen(),
           SplashScreenBackgroundColor : "black",
           ShowMenuBar: true,
           MenuBarIstransparent:false,
           ShowNameInMenuBar: true,
           //CssClassForName: "TestClassName",
           ColorMenuBar: "white",
           ColorIconMenuBar: "black",
           HeightMenuBar: "3rem",
           AppFolderClient: __dirname + "/Frontend/App",
           //AppFolderAdmin: __dirname + "/Frontend/Admin",
           UseAppModule: true
       }
   }
   // Initiation de NanoX
   require("@gregvanko/nanox").NanoXInitiation(OptionNanoX)

   // Add route Post
   NanoXAddRoute("/post", require("./Backend/Route/RoutePost"))
   // Add route Track
   NanoXAddRoute("/track", require("./Backend/Route/RouteTrack"))
   // Add route GetMap
   NanoXAddRoute("/getmap", require("./Backend/Route/RouteGetMap"))

   // Build Home page
   require("./Frontend/HomePage/BuildHomePage").BuildAndAddHomePage()

   // Start NanoX
   await require("@gregvanko/nanox").NanoXStart()
}

function GetSplashScreen(){
    let fs = require('fs')
    let HtmlString = fs.readFileSync(__dirname + "/Frontend/SplashScreen/SplashScreen.html", 'utf8')
    HtmlString = HtmlString.replace(/\r?\n|\r/g, " ")
    return HtmlString
}

module.exports.Start = Start


// class GeoX {
//    constructor(Name = "AppName", Port = 4000, Debug = true){
//        // Creation de l'application CoreX
//        let corex = require('@gregvanko/corex').corex
//        this._OptionApplication = {
//           AppName: Name,
//           Port: Port,
//           Secret: "GeoXAppSecret",
//           MongoUrl: "mongodb://localhost:27017"
//        }
//        this._MyApp = new corex(this._OptionApplication)
//        this._Debug = Debug
//        let GeoXServerR = require('./Backend/GeoXServer').GeoXServer
//        this._GeoXServer = new GeoXServerR(this._MyApp)
//    }
 
//     /* Start de l'application */
//    Start(){
//       // Css de l'application CoreX
//       const CSS= {
//           FontSize:{
//              TexteNomrale:"1.5vw", //--CoreX-font-size
//              TexteIphone:"3vw", //--CoreX-Iphone-font-size
//              TexteMax:"18px", //--CoreX-Max-font-size
//              TitreNormale:"4vw", //--CoreX-Titrefont-size
//              TitreIphone:"7vw", //--CoreX-TitreIphone-font-size
//              TitreMax:"50px" //--CoreX-TitreMax-font-size
//           },
//           Color:{
//              Normale:"rgb(20, 163, 255)" //--NanoX-appcolor
//           },
//           AppContent:{
//              WidthNormale:"100%",
//              WidthIphone:"100%",
//              WidthMax:"100%"
//          }
//       }
//       // Affichier les message de debug du serveur
//       this._MyApp.Debug = this._Debug
//       // L'application est elle securisee par un login
//       this._MyApp.AppIsSecured = true
//       // L'application permet elle au user de creer son compte
//       this._MyApp.AllowSignUp= true
//       // Css de base de l'application
//       this._MyApp.CSS = CSS
//       // L'application utilise SocketIo
//       this._MyApp.Usesocketio = false
//       // Chemin vers le dossier contenant les sources Js et CSS de l'app client
//       this._MyApp.ClientAppFolder = __dirname + "/Frontend/App"
//       // Chemin vers le dossier contenant les sources Js et CSS de l'app Admin
//       this._MyApp.AdminAppFolder = __dirname + "/Frontend/Admin"
//       // Chemin vers le dossier contenant les sources Js et CSS Commun
//       this._MyApp.CommonAppFolder = __dirname + "/Frontend/Common"
//       // Chemin relatif de l'icone
//       this._MyApp.IconRelPath = __dirname + "/Backend/apple-icon-192x192.png"

//       // App link
//       this._MyApp.AppLink = "App"

//       // Splash Screen
//       this._MyApp.SplashScreen = this._GeoXServer.GetSplashScreen()
//       this._MyApp.SplashScreenBackgroundColor = "Black"

//       // Function to execute when a user is deleted
//       this._MyApp.OnDeleteUser = this._GeoXServer.OnDeleteUser.bind(this._GeoXServer)

//       // Route Home
//       this._MyApp.AddRouteGet("", this._GeoXServer.RouteGetHome.bind(this._GeoXServer))
//       // Route GetMap
//       this._MyApp.AddRouteGet("getmap", this._GeoXServer.RouteGetMap.bind(this._GeoXServer))
       
//       // Route Api Get page of post
//       this._MyApp.AddRouteGet("getpageofpost/:page", this._GeoXServer.RouteGetPageOfPost.bind(this._GeoXServer))

//       // API
//       this._MyApp.AddApiFct("ApiGetAllPost", this._GeoXServer.ApiGetAllPost.bind(this._GeoXServer), false)
//       this._MyApp.AddApiFct("ApiGetPostData", this._GeoXServer.ApiGetPostData.bind(this._GeoXServer), false)
//       this._MyApp.AddApiFct("ApiGetAllPostMarkers", this._GeoXServer.ApiGetAllPostMarkers.bind(this._GeoXServer), false)
//       this._MyApp.AddApiFct("ApiGetTrackData", this._GeoXServer.ApiGetTrackData.bind(this._GeoXServer), false)
//       this._MyApp.AddApiFct("ApiGetAllGroups", this._GeoXServer.ApiGetAllGroups.bind(this._GeoXServer), false)
//       this._MyApp.AddApiFct("ApiGetAllMyTracks", this._GeoXServer.ApiGetAllMyTracks.bind(this._GeoXServer), false)
//       this._MyApp.AddApiFct("ApiManageTrack", this._GeoXServer.ApiManageTrack.bind(this._GeoXServer), false)
//       this._MyApp.AddApiFct("ApiGetElavation", this._GeoXServer.ApiGetElavation.bind(this._GeoXServer), false)
//       this._MyApp.AddApiFct("ApiGetDataFromApi", this._GeoXServer.ApiGetDataFromApi.bind(this._GeoXServer), false)

//       // API Admin
//       this._MyApp.AddApiFct("ApiAdminGetAllTracks", this._GeoXServer.ApiAdminGetAllTracks.bind(this._GeoXServer), true)
//       this._MyApp.AddApiFct("ApiAdminGetPostData", this._GeoXServer.ApiAdminGetPostData.bind(this._GeoXServer), true)
         
//       // Start
//       this._MyApp.Start()
//    }
//  }
//  module.exports.GeoX = GeoX