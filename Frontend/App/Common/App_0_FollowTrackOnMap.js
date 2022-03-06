/**
 * Cette classe construit une map dans la div IdDivMap, affiche la track TrackData et affiche le point GPS du user
 * Cette classe depend des classes GeoLocalisation et GeoXMap
 */
class FollowTrackOnMap {

    constructor(IdDivMap, TrackData){
        this._IdDivMap = IdDivMap
        this._TrackId = TrackData.TrackId
        this._TrackGeoJson = TrackData.TrackGeoJson

        this._MapFollow = null
        this._GpsRadius = null
        this._GpsPointerTrack = null
        this._GpsPointer = null
        this._GpsLineToPosition = null

        this._GeoLocalisation = null
    }

    Start(){
        try {
            this.BuildMap()
            this.AddTrackToMap()
            this.BuildPositionMarker()
            this.ShowDistanceInfoBox()
            this._GeoLocalisation = new GeoLocalisation(this.ShowPosition.bind(this), this.ErrorPosition.bind(this))
            this._GeoLocalisation.StartLocalisation()
        } catch (error) {
            alert(error)
            this.OnStop()
        }
        
    }

    BuildMap(){
        this._MapFollow = new GeoXMap(this._IdDivMap) 
        this._MapFollow.RenderMap()
    }

    AddTrackToMap(){
        this._MapFollow.RemoveAllTracks()
        this._MapFollow.AddTrackOnMap(this._TrackId, this._TrackGeoJson, true, null)
    }

    BuildPositionMarker(){
        this._GpsRadius = L.circle([50.709446,4.543413], 1).addTo(this._MapFollow.Map)
        this._GpsPointerTrack = L.circle([50.709446,4.543413], 3, {color: "red", fillColor:'red', fillOpacity:1}).addTo(this._MapFollow.Map)
        this._GpsPointer = L.circleMarker([50.709446,4.543413], {radius: 8, weight:4,color: 'white', fillColor:'#0073f0', fillOpacity:1}).addTo(this._MapFollow.Map)
    }

    /**
     * Show de la box avec les info de suivi d'une track
     */
    ShowDistanceInfoBox(){
        // Div du box
        let DivBoxTracks = NanoXBuild.Div("DivBoxDistance", "DivBoxDistance")
        document.getElementById(this._IdDivMap).appendChild(DivBoxTracks)
        // Conteneur
        let Conteneur = NanoXBuild.DivFlexRowSpaceAround(null, null, "width: 100%")
        DivBoxTracks.appendChild(Conteneur)
        // ConteneurTxt
        let ConteneurTxt = NanoXBuild.Div("ConteneurTxt", null, "width: 78%; display:flex; justify-content:center;")
        Conteneur.appendChild(ConteneurTxt)
        ConteneurTxt.appendChild(NanoXBuild.DivText("Waiting for GPS position...","DistanceTxt","TextTrackInfo", "color: white; text-align: center;"))
        // ConteneurData
        let ConteneurData = NanoXBuild.DivFlexRowSpaceAround("ConteneurData", null, "width: 100%")
        ConteneurData.style.display = "none"
        ConteneurData.style.width = "86%"
        Conteneur.appendChild(ConteneurData)
        // Boutton stop
        let ConteneurStop = NanoXBuild.Div("ConteneurStop", null, "width: 12%; display: flex; flex-direction:column; justify-content:center;")
        Conteneur.appendChild(ConteneurStop)
        ConteneurStop.appendChild(NanoXBuild.Button (`<img src="${Icon.Stop()}" alt="icon" width="30" height="30">`, this.StopFollowTrack.bind(this), null, "ButtonInfoBoxNav"))
        // Pourcentage
        let DivProgressRing = NanoXBuild.Div(null, null, "width: 28%; display: flex; flex-direction:column; justify-content:flex-start;")
        ConteneurData.appendChild(DivProgressRing)
        DivProgressRing.appendChild(NanoXBuild.ProgressRing({Id:"MyProgressRing", Radius:30, RadiusMobile:30, TextColor:"white", ProgressColor:"var(--NanoX-appcolor)"}))
        // Div Distance
        let DivDistane = NanoXBuild.Div(null, null, "width: 70%; display: flex; flex-direction:column; justify-content:center;")
        ConteneurData.appendChild(DivDistane)
        let DivDone = NanoXBuild.DivFlexRowStart(null, null, "width: 100%;")
        DivDistane.appendChild(DivDone)
        DivDone.appendChild(NanoXBuild.DivText("Done:","","TextTrackInfo", "color: white; text-align:right; width: 40%; margin-right: 1%;"))
        DivDone.appendChild(NanoXBuild.DivText("0km","DistaneDone","TextTrackInfo", "color: white; text-align:left; margin-left: 1%;"))
        let DivTotal = NanoXBuild.DivFlexRowStart(null, null, "width: 100%;")
        DivDistane.appendChild(DivTotal)
        DivTotal.appendChild(NanoXBuild.DivText("Total:","","TextTrackInfo", "color: white; text-align:right; width: 40%; margin-right: 1%;"))
        DivTotal.appendChild(NanoXBuild.DivText("0km","DistanceTotal","TextTrackInfo", "color: white; text-align:left; margin-left: 1%;"))
        let DivReste = NanoXBuild.DivFlexRowStart(null, null, "width: 100%;")
        DivDistane.appendChild(DivReste)
        DivReste.appendChild(NanoXBuild.DivText("To End:","","TextTrackInfo", "color: white; text-align:right; width: 40%; margin-right: 1%;"))
        DivReste.appendChild(NanoXBuild.DivText("0km","DistanceToEnd","TextTrackInfo", "color: white; text-align:left; margin-left: 1%;"))
    }

    /**
     * Hide de la box avec les info de suivi d'une track
     */
    HideDistanceInfoBox(){
        // If TracksInfo existe alors on le supprime
        let DivBoxDistance = document.getElementById("DivBoxDistance")
        if(DivBoxDistance){
            DivBoxDistance.parentNode.removeChild(DivBoxDistance)
        }
    }

    StopFollowTrack(){
        // Stop Localisation
        if (this._GeoLocalisation != null){
            this._GeoLocalisation.StopLocalisation()
            this._GeoLocalisation = null
        }
        // Remove marker
        this._MapFollow.RemoveAllTracks()
        this._MapFollow.Map.removeLayer(this._GpsPointer)
        this._GpsPointer = null
        this._MapFollow.Map.removeLayer(this._GpsRadius)
        this._GpsRadius = null
        if(this._GpsPointerTrack){
            this._MapFollow.Map.removeLayer(this._GpsPointerTrack)
            this._GpsPointerTrack = null
        }
        if (this._GpsLineToPosition){
            this._MapFollow.Map.removeLayer(this._GpsLineToPosition)
            this._GpsLineToPosition = null
        }
        // remove box info
        this.HideDistanceInfoBox()
        // Remove map
        this._MapFollow.RemoveMap()
        this._MapFollow = null
        // Execute external fonction on Stop
        this.OnStop()
    }

    /**
     * Fonction executer lors de l'arret du suivi d'une track
     * Cette fonction peut etre overwrited lors de la cration de l'instance de la class
     */
    OnStop(){
        alert("Stop Following Track")
    }

    /**
     * Update de la position actuelle
     * @param {Object} e GPS Object
     */
    ShowPosition(e){
        let radius = e.accuracy
        if(this._GpsPointer){this._GpsPointer.setLatLng(e.latlng)}
        if(this._GpsRadius){
            this._GpsRadius.setLatLng(e.latlng)
            this._GpsRadius.setRadius(radius)
        }
        this.CalculateLivePositionOnTrack(e)
    }
    
    /**
     * Show message d'erreur du relevé de la position GPS
     * @param {String} ErrorTxt Message d'erreur
     */
    ErrorPosition(ErrorTxt){
        document.getElementById("ConteneurTxt").style.display = "flex";
        document.getElementById("ConteneurData").style.display = "none";
        document.getElementById("DistanceTxt").innerText = ErrorTxt
    }

    /**
     * Calcul la position actuel sur la track
     * @param {Object} Gps {longitude, latitude} Coordonnee lat et long de la position actuelle
     */
    CalculateLivePositionOnTrack(Gps){
        var coord = this._TrackGeoJson.features[0].geometry.coordinates
        var line = turf.lineString(coord)
        var pt = turf.point([Gps.longitude, Gps.latitude])
        var snapped = turf.nearestPointOnLine(line, pt)
        // Modifier la position du point _GpsPointerTrack
        if (this._GpsPointerTrack){
            this._GpsPointerTrack.setLatLng([snapped.geometry.coordinates[1],snapped.geometry.coordinates[0]])
        } else {
            this._GpsPointerTrack = L.circle([snapped.geometry.coordinates[1],snapped.geometry.coordinates[0]], 3, {color: "red", fillColor:'red', fillOpacity:1}).addTo(this._MapFollow.Map)
        }
        // Si la distance entre la position et la track est plus petite que 40m
        if (snapped.properties.dist < 0.04){
            var DistandceParcourue = Math.round((snapped.properties.location + Number.EPSILON) * 1000) / 1000
            var DistranceTotale = Math.round((turf.length(line) + Number.EPSILON) * 1000) / 1000
            var DistanceToEnd = DistranceTotale - DistandceParcourue
            DistanceToEnd = DistanceToEnd.toFixed(3)
            var DistancePourcent =Math.round(((DistandceParcourue/DistranceTotale) * 100 + Number.EPSILON) * 10) / 10
            if (DistandceParcourue >= 1){
                DistandceParcourue = DistandceParcourue.toString() + "Km"
            } else {
                DistandceParcourue = DistandceParcourue * 1000
                DistandceParcourue = DistandceParcourue.toString()  + "m"
            }
            if (DistranceTotale >= 1){
                DistranceTotale = DistranceTotale.toString() + "Km"
            } else {
                DistranceTotale = DistranceTotale * 1000
                DistranceTotale = DistranceTotale.toString()  + "m"
            }
            if (DistanceToEnd >= 1){
                DistanceToEnd = DistanceToEnd.toString() + "Km"
            } else {
                DistanceToEnd = DistanceToEnd * 1000
                DistanceToEnd = DistanceToEnd.toString()  + "m"
            }
            document.getElementById("ConteneurTxt").style.display = "none";
            document.getElementById("ConteneurData").style.display = "flex";
            document.getElementById("DistanceTxt").innerText = ``
            document.getElementById("DistaneDone").innerText = DistandceParcourue
            document.getElementById("DistanceTotal").innerText = DistranceTotale
            document.getElementById("DistanceToEnd").innerText = DistanceToEnd
            document.getElementById("MyProgressRing").setAttribute('progress', DistancePourcent);
            // retirer la ligne entre la track et la position
            if (this._GpsLineToPosition != null){
                this._MapFollow.Map.removeLayer(this._GpsLineToPosition)
                this._GpsLineToPosition = null
            }
        } else {
            var DistandcePosAndTrack = Math.round((snapped.properties.dist + Number.EPSILON) * 1000) / 1000
            if (DistandcePosAndTrack >= 1){
                DistandcePosAndTrack = DistandcePosAndTrack.toString() + "Km"
            } else {
                DistandcePosAndTrack = DistandcePosAndTrack * 1000
                DistandcePosAndTrack = DistandcePosAndTrack.toString()  + "m"
            }
            // afficher que l'on est trop loin
            document.getElementById("ConteneurTxt").style.display = "flex";
            document.getElementById("ConteneurData").style.display = "none";
            document.getElementById("DistanceTxt").innerText = `To fare from the track: ${DistandcePosAndTrack}`
            // afficher la ligne entre la track et la position
            if (this._GpsLineToPosition == null){
                this._GpsLineToPosition = L.polyline([],{color: 'red', weight: '2', dashArray: '20, 20', dashOffset: '0'}).addTo(this._MapFollow.Map)
            }
            this._GpsLineToPosition.setLatLngs([])
            this._GpsLineToPosition.addLatLng(L.latLng([Gps.latitude,Gps.longitude]))
            this._GpsLineToPosition.addLatLng(L.latLng([snapped.geometry.coordinates[1],snapped.geometry.coordinates[0]]))
        }
    }
}