class GpxToImg {
    
    constructor(Gpx=null, Div=null, Imgwidth="600", Imgheight="338"){
        this._Div = Div
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
        // Si la conversion est OK
        if (this._GeoJson.features.length > 0){
            // Si on a un GeoJson avec plusieurs line pour une track on le modifie
            if (this._GeoJson.features[0].geometry.type == "MultiLineString"){
                // Changer le type en LineString
                this._GeoJson.features[0].geometry.type = "LineString"
                // Fusionner les coodronnee
                const listofcoordonate = this._GeoJson.features[0].geometry.coordinates
                let NewListofcoordonate = []
                listofcoordonate.forEach(OneListe => {
                    OneListe.forEach(element => {
                        NewListofcoordonate.push(element)
                    });
                });
                this._GeoJson.features[0].geometry.coordinates = NewListofcoordonate
            }
            return new Promise ((resolve, reject) => {
                let ConvertReponse = {Error: true, ErrorMsg:"GpxToImg : InitError", Gpx: this._Gpx, GeoJson: this._GeoJson, Img: null}
                this.BuildVirutalMap(resolve, reject, ConvertReponse)
            })
        } else {
            return new Promise ((resolve, reject) => {
                let ConvertReponse = {Error: true, ErrorMsg:"GpxToImg : GeoJson not converted from gpx", Gpx: this._Gpx, GeoJson: this._GeoJson, Img: null}
                resolve(ConvertReponse)
            })
        }
    }

    BuildVirutalMap(resolve, reject, ConvertReponse){
        this._Div.appendChild(CoreXBuild.Div(this._MapId, "", `height: ${this._Imgheight}px; width: ${this._Imgwidth}px;`))
        let Openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        })
        let CenterPoint = {Lat: "50.709446", Long: "4.543413"}
        let Zoom = 14
        let MyMap = L.map("MyMAp" , {attributionControl: false, fadeAnimation: false, zoomAnimation: false, zoomControl: false, tapTolerance:40, tap:false, layers: [Openstreetmap]}).setView([CenterPoint.Lat, CenterPoint.Long], Zoom);
        let WeightTrack = (L.Browser.mobile) ? 5 : 3
        var TrackStyle = {
            "color": "blue",
            "weight": WeightTrack
        };
        var layerTrack1=L.geoJSON(this._GeoJson , 
            {
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
            setTimeout(function(){
                me.ConvertMapToImage(MyMap, resolve, reject, ConvertReponse)
            }, 1000);
        })
        // FitBound
        MyMap.fitBounds(layerTrack1.getBounds());
    }

    async ConvertMapToImage(MyMap, resolve, reject, ConvertReponse){
        const width = this._Imgwidth
        const height = this._Imgheight
        const dataURL = await domtoimage.toPng(document.getElementById(this._MapId), { width, height})
        // const imgElement = document.createElement("img");
        // imgElement.src = dataURL;
        // document.body.appendChild(imgElement);

        ConvertReponse.Error = false
        ConvertReponse.ErrorMsg = null
        ConvertReponse.Img = dataURL
        this.DeleteVirtualMap()
        resolve(ConvertReponse)
    }
    
    DeleteVirtualMap(){
        let DivMap = document.getElementById(this._MapId)
        this._Div.removeChild(DivMap)
    }
}