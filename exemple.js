const Option = {
    Port:5000,
    Name:"GeoXDev",
    Debug: true,
    SplashScreenFilePath: __dirname + "/Frontend/SplashScreen/SplashScreen.html"
}

require('./index').Start(Option)