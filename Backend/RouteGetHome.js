function CallRouteGetHome(req, res, MyApp){
    res.sendFile(__dirname + '/HomePage.html');
}

module.exports.CallRouteGetHome = CallRouteGetHome