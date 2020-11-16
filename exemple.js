let GeoX = require('./index').GeoX
const Name = "GeoXDev"
const Port = 5000
const Debug = true
let MyApp = new GeoX(Name, Port, Debug)
MyApp.Start()