const Mongoose = require("@gregvanko/nanox").Mongoose

let TracksSchema = new Mongoose.Schema(
    {
        Name: String,
        Group: String,
        Color: String,
        Date: Date,
        ExteriorPoint: 
        {
            MinLat : Number,
            MaxLat : Number,
            MinLong : Number,
            MaxLong : Number
        },
        GeoJsonData: Object,
        GpxData : String,
        Length : Number,
        Owner : String,
        Center: 
        {
            Lat: Number,
            Long : Number
        },
        Public : Boolean,
        StartPoint:
        {
            Lat: Number,
            Lng : Number
        },
        Elevation : [],
        Description : String,
        InfoElevation : 
        {
            ElevMax : Number,
            ElevMin : Number,
            ElevCumulP : Number,
            ElevCumulM : Number
        },
        Image : String

    },
    { collection:'Tracks'});
    
module.exports = Mongoose.model('Tracks', TracksSchema)