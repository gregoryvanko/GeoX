class GeoLocalisation{
    constructor(Located, Error){
        this._Located = Located
        this._Error = Error
        this._MyInterval = null
        this._LocalisationOptions = {
            enableHighAccuracy: true,
            maximumAge        : 0,
            timeout           : 10000
        };
    }

    StartLocalisation(){
        this.GetLocalisation()
        this._MyInterval = setInterval(this.GetLocalisation.bind(this), 3000);
    }

    StopLocalisation(){
        if (this._MyInterval){
            //var d = new Date();
            //console.log(d.toLocaleTimeString() + " StopLocalisation")
            clearInterval(this._MyInterval)
            this._MyInterval = null
        }
    }

    GetLocalisation(){
        navigator.geolocation.getCurrentPosition(this.GpsSuccess.bind(this), this.GpsError.bind(this), this._LocalisationOptions);
    }

    GpsSuccess(position) {
        //var d = new Date();
        //console.log(d.toLocaleTimeString() + " GpsSuccess")
        var data = new Object()
        data.latlng = [position.coords.latitude, position.coords.longitude]
        data.longitude = position.coords.longitude
        data.latitude = position.coords.latitude
        data.accuracy = position.coords.accuracy
        this._Located(data);
    }
    GpsError(error) {
        let ErrorTxt = ""
        switch(error.code) {
            case error.PERMISSION_DENIED:
                ErrorTxt= "User denied the request for Geolocation.";break;
            case error.POSITION_UNAVAILABLE:
                ErrorTxt= "Location information is unavailable.";break;
            case error.TIMEOUT:
                ErrorTxt= "The request to get user location timed out. ";break;
            case error.UNKNOWN_ERROR:
                ErrorTxt= "An unknown error occurred.";break;
            default:
                ErrorTxt= `Sorry, unknown localisation error code`;
        }
        this._Error(ErrorTxt)
    }
}