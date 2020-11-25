class GeoXMap {
    constructor(DivApp){
        this._DivApp = DivApp
        this._MapId = "mapid"
        this._Map = null
        this._LayerGroup = null
        this._GroupSelected = null
        this._DataMap = null
        this._DataApp = null

        // Add Leaflet Links
        this.AddLeafletLinks()
        
    }

    /**
     * Add Leaflet links
     */
    AddLeafletLinks(){
        // Add css for maps
        var link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        link.integrity='sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=='
        link.crossOrigin =""
        // Add css for maps
        document.head.appendChild(link)
        var Leafletjs = document.createElement('script')
        Leafletjs.setAttribute('src','https://unpkg.com/leaflet@1.7.1/dist/leaflet.js')
        Leafletjs.setAttribute('integrity','sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==')
        Leafletjs.setAttribute('crossorigin','')
        document.head.appendChild(Leafletjs)
    }

    /**
     * Load de la vue Map
     * @param {Object} DataMap Object contenant toutes les data d'une map
     */
    LoadViewMap(GeoXData){
        this._DataApp = GeoXData.AppData
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Ajout du div qui va contenir la map
        this._DivApp.appendChild(CoreXBuild.Div(this._MapId, "", "height: 98vh; width: 100%"))
        // Ajout du drop down avec le nom des groupes des map
        if (GeoXData.AppGroup.length > 0){
            let divdropdown = CoreXBuild.Div("", "DivMapGroupDropDown", "")
            this._DivApp.appendChild(divdropdown)
            let DropDown = document.createElement("select")
            DropDown.setAttribute("id", "Group")
            DropDown.setAttribute("class", "Text MapGroupDropDown")
            GeoXData.AppGroup.forEach(element => {
                let option = document.createElement("option")
                option.setAttribute("value", element)
                option.innerHTML = element
                DropDown.appendChild(option)
            });
            DropDown.onchange = this.NewGroupSelected.bind(this)
            divdropdown.appendChild(DropDown)
            this._GroupSelected = GeoXData.AppGroup[0]
        }
        // Ajout du bouton info
        let ButtonActionInfo = CoreXBuild.Button ("&#128065", this.ShowTrackInfoBox.bind(this), "ButtonActionTopLeft", "ButtonShowTrackInfo")
        this._DivApp.appendChild(ButtonActionInfo)
        // Parametre de la carte
        let CenterPoint = null
        let zoom = null
        let FitBounds=null
        if (GeoXData.AppInitMapData != null ){
            CenterPoint = GeoXData.AppInitMapData.CenterPoint
            zoom = GeoXData.AppInitMapData.Zoom
            FitBounds = GeoXData.AppInitMapData.FitBounds
        } else {
            CenterPoint = {Lat: 50.709446, Long: 4.543413}
            zoom= 8
        }
        // Creation de la carte
        this._Map = L.map(this._MapId , {zoomControl: false}).setView([CenterPoint.Lat, CenterPoint.Long], zoom);
        L.control.zoom({position: 'bottomright'}).addTo(this._Map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(this._Map)
        // Creation du groupe de layer
        this._LayerGroup = new L.LayerGroup()
        this._LayerGroup.addTo(this._Map)
        let me = this
        // Ajout des tracks sur la map
        setTimeout(function(){
            me.ModifyTracksOnMap(GeoXData.AppInitMapData)
        }, 500);
    }

    ShowTrackInfoBox(){
        // Show track info box
        this.BuildBoxTracksInfo(this._DataApp)
        // hide boutton
        document.getElementById("ButtonShowTrackInfo").style.display = "none";
    }

    HideTrackInfoBox(){
        // If TracksInfo existe alors on le supprime
        let MyDivBoxTracks = document.getElementById("DivBoxTracks")
        if(MyDivBoxTracks){
            MyDivBoxTracks.parentNode.removeChild(MyDivBoxTracks)
            // Show button
            document.getElementById("ButtonShowTrackInfo").style.display = "block";
        }
    }

    BuildBoxTracksInfo(AppData){
        // Div du box
        let DivBoxTracks = CoreXBuild.Div("DivBoxTracks", "DivBoxTracks", "")
        this._DivApp.appendChild(DivBoxTracks)
        // Add Close button
        DivBoxTracks.appendChild(CoreXBuild.Button ("&#x21E6", this.HideTrackInfoBox.bind(this), "ButtonClose", ""))
        // Div empty
        DivBoxTracks.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Add all tracks of the group
        AppData.forEach(element => {
            if (element.Group == this._GroupSelected){
                let DivBoxTrackInfo = CoreXBuild.Div("", "DivBoxTrackInfo", "")
                DivBoxTracks.appendChild(DivBoxTrackInfo)
                let Conteneur = CoreXBuild.DivFlexRowStart("")
                DivBoxTrackInfo.appendChild(Conteneur)
                Conteneur.appendChild(CoreXBuild.DivTexte(element.Name,"","Text", "color: white; margin-left: 4%; width:56%"))
                let DivButton = document.createElement("div")
                DivButton.setAttribute("style", "margin-left: auto; display: -webkit-flex; display: flex; flex-direction: row; justify-content:flex-end; align-content:center; align-items: center; flex-wrap: wrap;")
                let inputcolor = document.createElement("input")
                inputcolor.setAttribute("id","color" + element._id)
                inputcolor.setAttribute("type","color")
                inputcolor.setAttribute("style","background-color: white;border-radius: 8px; cursor: pointer; width: 34px;")
                inputcolor.setAttribute("value","#0000FF")
                inputcolor.onchange = (event)=>{this.ChangeTrackColor(event.target.value, element._id)}
                DivButton.appendChild(inputcolor)
                DivButton.appendChild(CoreXBuild.Button ("&#128065", this.ToogleTrack.bind(this, element._id), "ButtonIcon"))
                Conteneur.appendChild(DivButton)
            }
        });
    }

    /**
     * Fonction triggered by the dropdown Group
     */
    NewGroupSelected(){
        // If TracksInfo existe alors on le supprime
        let MyDivBoxTracks = document.getElementById("DivBoxTracks")
        if(MyDivBoxTracks){
            MyDivBoxTracks.parentNode.removeChild(MyDivBoxTracks)
            document.getElementById("ButtonShowTrackInfo").style.display = "block";
        }
        // get du nom du type
        let DropDownGroupValue = document.getElementById("Group").value
        this._GroupSelected = DropDownGroupValue
        // Send data to server
        GlobalSendSocketIo("GeoX", "LoadMapData", DropDownGroupValue)
    }

    /**
     * Suppression d'une carte
     */
    DeleteMap(){
        if (this._Map && this._Map.remove) {
            this._Map.off();
            this._Map.remove();
            this._Map = null
            let mapDiv = document.getElementById(this._MapId)
            if(mapDiv) mapDiv.parentNode.removeChild(mapDiv)
        }
    }

    /**
     * Ajouter une track a la carte
     * @param {String} TrackId Id de la track
     * @param {String} TrackName Nom de la track
     * @param {Object} GeoJsonData GeoJson Data de la track
     * @param {string} TrackColor Color de la track
     */
    ModifyTracksOnMap(DataMap){
        this._DataMap = DataMap
        let me = this
        // Remove all tracks
        this._LayerGroup.eachLayer(function (layer) {
            me._LayerGroup.removeLayer(layer);
        })
        // Style for tracks
        var TrackStyle = {
            "color": "Blue",
            "weight": 3
        };
        // Zoom in and add tracks
        if (DataMap.FitBounds != null){
            this._Map.flyToBounds(DataMap.FitBounds,{'duration':2} )
            this._Map.once('moveend', function() {
                DataMap.ListOfTracks.forEach(Track => {
                    var layerTrack1=L.geoJSON(Track.GeoJsonData, {style: TrackStyle}).addTo(me._LayerGroup).bindPopup(Track.Name)
                    layerTrack1.id = Track._id
                });
            });
        }
    }

    /**
     * Supprimer une track de la carte
     * @param {String} TrackId Id de la track a supprimer de la carte
     */
    ToogleTrack(TrackId){
        // On chercher la track dans le LayerGroup, si on la trouve on la supprime, si on ne la trouve pas on l'ajoute
        let me = this
        let AddTrack = true
        this._LayerGroup.eachLayer(function (layer) {
            if (layer.id == TrackId){
                me._LayerGroup.removeLayer(layer);
                AddTrack = false
            }
        })
        if (AddTrack){
            // Style for tracks
            let color = "Blue"
            let ColorPicker = document.getElementById("color"+TrackId)
            if(ColorPicker){
                color = ColorPicker.value
            }
            var TrackStyle = {
                "color": color,
                "weight": 3
            };
            this._DataMap.ListOfTracks.forEach(Track => {
                if (Track._id == TrackId){
                    var layerTrack1=L.geoJSON(Track.GeoJsonData, {style: TrackStyle}).addTo(me._LayerGroup).bindPopup(Track.Name)
                    layerTrack1.id = Track._id
                }
            });
        }
    }

    /**
     * Change the color of a track
     * @param {Color} Color New color
     * @param {String} TrackId id of the track to color
     */
    ChangeTrackColor(Color, TrackId){
        let me = this
        this._LayerGroup.eachLayer(function (layer) {
            if (layer.id == TrackId){
                layer.setStyle({color: Color});
            }
        })
    }
}