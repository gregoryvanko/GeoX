const Option = {
    Port:5000,
    Name:"GeoXDev",
    Debug: true,
    SplashScreenFilePath: __dirname + "/Frontend/SplashScreen/SplashScreen.html",
    MongoDbUrl: "mongodb://mongodev:27017"
}

require('./index').Start(Option)