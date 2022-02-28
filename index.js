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
   // Add route ExternalApi
   NanoXAddRoute("/externalapi", require("./Backend/Route/RouteExternalApi"))
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