class GpxToImg {
    
    constructor(Gpx = null, Imgwidth = "600px", Imgheight = "338px"){
        this._Imgwidth = Imgwidth
        this._Imgheight = Imgheight
        this._Gpx = Gpx
        this._GeoJson = null
        this._MapId = "MyMAp"
    }

    Convert(){
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(this._Gpx,"text/xml");
        this._GeoJson = toGeoJSON.gpx(xmlDoc)
        return new Promise ((resolve, reject) => {
            let ConvertReponse = {Error: true, ErrorMsg:"GpxToImg : InitError", Gpx: this._Gpx, GeoJson: this._GeoJson, Img: null}
            this.BuildVirutalMap(resolve, reject, ConvertReponse)
            
        })
    }

    BuildVirutalMap(resolve, reject, ConvertReponse){
        document.body.appendChild(CoreXBuild.Div(this._MapId, "", `height: ${this._Imgheight}; width: ${this._Imgwidth}; position: absolute; top: 0px; left: -${this._Imgwidth}`))
        let Openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        })
        let CenterPoint = {Lat: "50.709446", Long: "4.543413"}
        let Zoom = 14
        let MyMap = L.map("MyMAp" , {zoomControl: false, tapTolerance:40, tap:false, layers: [Openstreetmap]}).setView([CenterPoint.Lat, CenterPoint.Long], Zoom);
        let WeightTrack = (L.Browser.mobile) ? 5 : 3
        var TrackStyle = {
            "color": "blue",
            "weight": WeightTrack
        };
        var layerTrack1=L.geoJSON(this._GeoJson , 
            {
                renderer: L.canvas(),
                style: TrackStyle, 
                filter: function(feature, layer) {if (feature.geometry.type == "LineString") return true}, 
                arrowheads: {frequency: '100px', size: '15m', fill: true}
            }).addTo(MyMap)

        var numPts = this._GeoJson.features[0].geometry.coordinates.length;
        var beg = this._GeoJson.features[0].geometry.coordinates[0];
        var end = this._GeoJson.features[0].geometry.coordinates[numPts-1];
        let IconPointStartOption = L.icon({
            iconUrl: Icon.MarkerVert(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
        let IconPointEndOption = L.icon({
            iconUrl: Icon.MarkerRouge(),
            iconSize:     [40, 40],
            iconAnchor:   [20, 40],
            popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        });
        var MarkerStart = new L.marker([beg[1],beg[0]], {icon: IconPointStartOption}).addTo(MyMap)
        var MarkerEnd = new L.marker([end[1],end[0]], {icon: IconPointEndOption}).addTo(MyMap)
        let me = this
        MyMap.once('moveend', function(){
            // Afficher la track a modifier
            me.ConvertMapToImage(MyMap, resolve, reject, ConvertReponse)
        })
        // FitBound
        MyMap.fitBounds(layerTrack1.getBounds());
    }

    ConvertMapToImage(MyMap, resolve, reject, ConvertReponse){
        let me = this
        leafletImage(MyMap, function(err, canvas) {
            // var img = document.createElement('img');
            // var dimensions = MyMap.getSize();
            // img.width = dimensions.x;
            // img.height = dimensions.y;
            // img.src = canvas.toDataURL();
            // let divimg = CoreXBuild.Div("Img", "", "")
            // document.biody.appendChild(divimg)
            // divimg.appendChild(img);

            if (err){
                ConvertReponse.Error = true
                ConvertReponse.ErrorMsg = err
                me.DeleteVirtualMap()
                reject(ConvertReponse)
            } else {
                ConvertReponse.Error = false
                ConvertReponse.ErrorMsg = null
                ConvertReponse.Img = canvas.toDataURL()
                me.DeleteVirtualMap()
                resolve(ConvertReponse)
            }
        });
    }
    
    DeleteVirtualMap(){
        let DivMap = document.getElementById(this._MapId)
        document.body.removeChild(DivMap)
    }
}