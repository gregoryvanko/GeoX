class GeoXManageTracks {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        this._AppData = null
        this._AppGroup = null
        this.GeoXCreateTrackView = MyGeoXCreateTrack
        this._StartWithLoadViewManageTrack = true
        this._GPX = null
        this._GeoJson = null
        this._ImageTrack = null
    }

    Initiation(StartWithLoadViewManageTrack = true){
        this._StartWithLoadViewManageTrack = StartWithLoadViewManageTrack
        // Show Action Button
        GlobalDisplayAction('On')
        // Clear Action List
        GlobalClearActionList()
        // Clear view
        this._DivApp.innerHTML=""
        // SocketIO
        let SocketIo = GlobalGetSocketIo()
        SocketIo.on('GeoXError', (Value) => {this.Error(Value)})
        SocketIo.on('ManageTrack', (Value) => {this.MessageRecieved(Value)})
        // Load Data
        this.LoadViewGetAppData()
    }

    MessageRecieved(Value){
        if (Value.Action == "SetUserData"){
            this._AppData = Value.Data.AppData
            this._AppGroup = Value.Data.AppGroup
            if (this._StartWithLoadViewManageTrack){
                this.LoadViewManageTracks()
            } else {
                this.LoadViewAddTrack(this._AppGroup)
            }
        } else if (Value.Action == "SetDownloadedFile" ){
            this.DownloadedFileToClient(Value.Data)
        } else if (Value.Action == "SetTrackInfo" ){
            // Load Info Track view
            let InfoTrackView = new InfoOnTrack(Value.Data, "ContentInfoTrack")
        } else {
            console.log("error, Action not found: " + Value.Action)
        }
    }

    /**
     * Affichage du message d'erreur venant du serveur
     * @param {String} ErrorMsg Message d'erreur envoyé du serveur
     */
    Error(ErrorMsg){
        // Clear view
        this._DivApp.innerHTML=""
        // Add conteneur
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Add Error Text
        Conteneur.appendChild(CoreXBuild.DivTexte(ErrorMsg,"","Text", "text-align: center; color: red; margin-top: 20vh;"))
    }

    /** Load des Data de l'application */
    LoadViewGetAppData(){
        // Clear view
        this._DivApp.innerHTML=""
        // Contener
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // Titre de l'application
        Conteneur.appendChild(CoreXBuild.DivTexte("GeoX", "", "Titre"))
        // on construit le texte d'attente
        Conteneur.appendChild(CoreXBuild.DivTexte("Waiting server data...","","Text", "text-align: center; margin-top: 10vh;"))
        // Send status to serveur
        let CallToServer = new Object()
        CallToServer.Action = "GetUserData"
        GlobalSendSocketIo("GeoX", "ManageTrack", CallToServer)
    }

    LoadViewManageTracks(){
        // Clear view
        this._DivApp.innerHTML = ""
        // Contener
        let Contener = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Contener)
        // Titre
        Contener.appendChild(CoreXBuild.DivTexte("Manage Tracks", "", "Titre", "margin-bottom:0%"))
        // Conteneur de la liste des tracks
        let AppConteneur = CoreXBuild.Div("AppConteneur", "AppConteneur", "")
        Contener.appendChild(AppConteneur)
        // Boutton Add Track
        let ConteneurButton = CoreXBuild.DivFlexRowAr("ConteneurButton")
        ConteneurButton.style.marginTop = "2vh"
        AppConteneur.appendChild(ConteneurButton)
        ConteneurButton.appendChild(CoreXBuild.Button("Add Track",this.LoadViewAddTrack.bind(this,this._AppGroup),"Text Button ButtonTop"))
        // Div pour le titre des colonnes
        let BoxTitre = CoreXBuild.DivFlexRowStart("")
        AppConteneur.appendChild(BoxTitre)
        // Titre des colonnes
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 40%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Group","","TextBoxTitre", "width: 20%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Date","","TextBoxTitre", "width: 15%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Shared","","TextBoxTitre", "width: 12%;"))
        // Ajout d'une ligne
        AppConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
        // Ajout des lignes des tracks
        if (this._AppData.length == 0){
            let BoxTracks = CoreXBuild.DivFlexRowStart("")
            AppConteneur.appendChild(BoxTracks)
            BoxTracks.appendChild(CoreXBuild.DivTexte("No track saved","","Text","margin-top: 4vh; width: 100%; text-align: center;"))
        } else {
            this._AppData.forEach(Track => {
                let BoxTracks = CoreXBuild.DivFlexRowStart("")
                BoxTracks.style.marginTop = "0.5vh"
                BoxTracks.style.marginBottom = "0.5vh"
                AppConteneur.appendChild(BoxTracks)
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Name,"","Text", "width: 40%; margin-left:1%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Group,"","TextSmall", "width: 20%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateString(Track.Date),"","TextSmall", "width: 15%;"))
                let DivPublic = CoreXBuild.Div("", "", "width: 12%;")
                BoxTracks.appendChild(DivPublic)
                if (Track.Public){
                    DivPublic.appendChild(CoreXBuild.Image64(Icon.Shared(),"", "IconeInList", ""))
                } else {
                    DivPublic.appendChild(CoreXBuild.Image64(Icon.Key(),"", "IconeInList", ""))
                }

                let DivButtonIphone = document.createElement("div")
                DivButtonIphone.setAttribute("style", "width: 8%; display: flex; flex-direction: row; justify-content:center; align-content:center; align-items: center; flex-wrap: wrap;")
                DivButtonIphone.appendChild(CoreXBuild.Button (`<img src="${Icon.Engrenage()}" alt="icon" width="25" height="25">`, this.LoadViewAction.bind(this,this._AppGroup, Track), "ButtonIcon ButtonIconWhiteBorder"))
                BoxTracks.appendChild(DivButtonIphone)
                // Ajout d'une ligne
                AppConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
            });
        }
    }

    LoadViewAction(AppGroup, Track){
        let HTMLContent = CoreXBuild.DivFlexColumn()
        HTMLContent.appendChild(CoreXBuild.DivTexte("Track actions", "", "Text", ""))
        HTMLContent.appendChild(CoreXBuild.Button ("&#128279 Get Track link", this.LoadViewLink.bind(this,Track._id), "Text ButtonCoreXWindow"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#128394 Update Track", this.LoadViewUpdateTrack.bind(this,AppGroup, Track._id, Track.Name, Track.Group, Track.Public, Track.Description), "Text ButtonCoreXWindow"))
        HTMLContent.appendChild(CoreXBuild.Button (`<div style="display: flex;justify-content: center; align-content: center; align-items: center;"><img src="${Icon.Information()}" alt="icon" width="20" height="20"> <div style="margin-left: 0.5vw;">Info Track</div></div>`, this.LoadViewInfoTrack.bind(this,Track._id), "Text ButtonCoreXWindow"))
        HTMLContent.appendChild(CoreXBuild.Button (`<div style="display: flex;justify-content: center; align-content: center; align-items: center;"><img src="${Icon.ModifyTrack()}" alt="icon" width="20" height="20"> <div style="margin-left: 0.5vw;">Modify Track</div></div>`, this.ModifyTrack.bind(this,this._AppGroup, Track._id, Track.Name, Track.Group, Track.Public, Track.Description), "Text ButtonCoreXWindow"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#128465 Delete Track", this.SendDeleteTrack.bind(this, Track._id, Track.Name, true), "Text ButtonCoreXWindow"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#8681 GPX", this.DownloadFile.bind(this, "gpx", Track._id), "Text ButtonCoreXWindow"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#8681 GeoJson", this.DownloadFile.bind(this, "geojson", Track._id), "Text ButtonCoreXWindow"))
        CoreXWindow.BuildWindow(HTMLContent)
    }

    DownloadFile(Type, TrackId){
        CoreXWindow.DeleteWindow()
        // Data to send
        let CallToServer = new Object()
        CallToServer.Action = "Download"
        CallToServer.Data = {Id: TrackId, Type : Type}
        GlobalSendSocketIo("GeoX", "ManageTrack", CallToServer)
    }

    DownloadedFileToClient(Data){
        var link = document.createElement('a')
        link.download = 'Track.' + Data.Type
        var blob = new Blob([Data.File], {typde: 'text/plain'})
        link.href = window.URL.createObjectURL(blob)
        link.click()
    }

    SendDeleteTrack(TrackId, TrackName, IsCoreXWindow){
        if (IsCoreXWindow){CoreXWindow.DeleteWindow()}
        // Send delete tracks to serveur
        if (confirm(`Do you want to delete track : ${TrackName}?`)){
            // Data to send
            let CallToServer = new Object()
            CallToServer.Action = "Delete"
            CallToServer.Data = TrackId
            GlobalSendSocketIo("GeoX", "ManageTrack", CallToServer)
        }
    }

    LoadViewLink(TrackId){
        CoreXWindow.DeleteWindow()
        alert(window.location.origin + "/getmap/?trackid=" + TrackId)
    }

    LoadViewUpdateTrack(Groups, TrackId, TrackName, TrackGroup, Public, Description){
        CoreXWindow.DeleteWindow()
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Contener
        let Contener = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Contener)
        // Titre de l'application
        Contener.appendChild(CoreXBuild.DivTexte("Update Track", "", "Titre", ""))
        // Input Name
        Contener.appendChild(CoreXBuild.InputWithLabel("InputBox", "Track Name:", "Text", "InputTrackName",TrackName, "Input Text", "text", "Name",))
        // Input `Group
        Contener.appendChild(CoreXBuild.InputWithLabel("InputBox", "Track Group:", "Text", "InputTrackGroup",TrackGroup, "Input Text", "text", "Group",))
        // Add AutoComplete
        document.getElementById("InputTrackGroup").setAttribute("autocomplete", "off")
        autocomplete({
            input: document.getElementById("InputTrackGroup"),
            minLength: 1,
            emptyMsg: 'No suggestion',
            fetch: function(text, update) {
                text = text.toLowerCase();
                var GroupFiltred = Groups.filter(n => n.toLowerCase().startsWith(text))
                var suggestions = []
                GroupFiltred.forEach(element => {
                    var MyObject = new Object()
                    MyObject.label = element
                    suggestions.push(MyObject)
                });
                update(suggestions);
            },
            onSelect: function(item) {
                document.getElementById("InputTrackGroup").value = item.label;
            }
        });
        // Description
        let DivDescription = CoreXBuild.Div("", "InputBox Text", "")
        Contener.appendChild(DivDescription)
        DivDescription.appendChild(CoreXBuild.DivTexte("Description", "", "Text", ""))
        let DivContDesc = CoreXBuild.Div("DivContDesc", "DivContentEdit TextSmall", "")
        DivContDesc.innerText = Description
        DivContDesc.contentEditable = "True"
        DivDescription.appendChild(DivContDesc)
        // Toggle Public
        let DivTooglePublic = CoreXBuild.Div("","Text InputBox", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Contener.appendChild(DivTooglePublic)
        DivTooglePublic.appendChild(CoreXBuild.DivTexte("Public Track:", "", "", ""))
        DivTooglePublic.appendChild(CoreXBuild.ToggleSwitch("TogglePublic", Public))
        // Div Button
        let DivBoxButton = CoreXBuild.Div("", "InputBox", "")
        Contener.appendChild(DivBoxButton)
        let DivButton = CoreXBuild.DivFlexRowAr("")
        DivBoxButton.appendChild(DivButton)
        // Button Update
        DivButton.appendChild(CoreXBuild.Button("Update Track",this.SendUpdateTrack.bind(this, TrackId),"Text Button ButtonWidth30"))
        // Button cancel
        DivButton.appendChild(CoreXBuild.Button("Cancel",this.LoadViewManageTracks.bind(this),"Text Button ButtonWidth30", "Cancel"))
        // Empty space
        Contener.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
    }

    LoadViewInfoTrack(TrackId){
        CoreXWindow.DeleteWindow()
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Contener
        let Contener = CoreXBuild.DivFlexColumn("Conteneur")
        Contener.style.width = "90%"
        Contener.style.marginLeft = "auto"
        Contener.style.marginRight = "auto"
        Contener.style.maxWidth = "900px"
        this._DivApp.appendChild(Contener)
        // Content Info Track
        let ContentInfoTrack = CoreXBuild.DivFlexColumn("ContentInfoTrack")
        Contener.appendChild(ContentInfoTrack)
        // waitinf data txt
        ContentInfoTrack.appendChild(CoreXBuild.DivTexte("Waiting track data...","","Text", "text-align: center; margin-top: 10vh;"))
        // Button select file
        Contener.appendChild(CoreXBuild.Button("Go to manage track",this.LoadViewManageTracks.bind(this),"Text Button", "GoToManageTrack"))
        // Blank div
        Contener.appendChild(CoreXBuild.Div("","","height: 6vh;"))
        // Send status to serveur
        GlobalSendSocketIo("GeoX", "ManageTrack", {Action: "GetTrackInfo", Data: TrackId})
    }

    ModifyTrack(Groups, TrackId, TrackName, TrackGroup, Public, Description){
        CoreXWindow.DeleteWindow()
        GlobalReset()
        this.GeoXCreateTrackView.InitiationModifyMyTrack(Groups, TrackId, TrackName, TrackGroup, Public, Description)
    }

    SendUpdateTrack(TrackId){
        if ((document.getElementById("InputTrackName").value != "") && (document.getElementById("InputTrackGroup").value != "")){
            let Track = new Object()
            Track.Id = TrackId
            Track.Name = document.getElementById("InputTrackName").value 
            Track.Group = document.getElementById("InputTrackGroup").value 
            Track.Public = document.getElementById("TogglePublic").checked 
            Track.Description = document.getElementById("DivContDesc").innerText
            // Data to send
            let CallToServer = new Object()
            CallToServer.Action = "Update"
            CallToServer.Data = Track
            GlobalSendSocketIo("GeoX", "ManageTrack", CallToServer)
        } else {
            alert("Enter a name and a group before updating a track")
        }
    }

    LoadViewAddTrack(Groups){
        // Start with the view LoadViewManageTrack
        this._StartWithLoadViewManageTrack = true
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Contener
        let Contener = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Contener)
        // Titre de l'application
        Contener.appendChild(CoreXBuild.DivTexte("Add new Track", "", "Titre", ""))
        // Input Name
        Contener.appendChild(CoreXBuild.InputWithLabel("InputBox", "Track Name:", "Text", "InputTrackName","", "Input Text", "text", "Name",))
        // Input `Group
        Contener.appendChild(CoreXBuild.InputWithLabel("InputBox", "Track Group:", "Text", "InputTrackGroup","", "Input Text", "text", "Group",))
        // Add AutoComplete
        document.getElementById("InputTrackGroup").setAttribute("autocomplete", "off")
        autocomplete({
            input: document.getElementById("InputTrackGroup"),
            minLength: 1,
            fetch: function(text, update) {
                text = text.toLowerCase();
                var GroupFiltred = Groups.filter(n => n.toLowerCase().startsWith(text))
                var suggestions = []
                GroupFiltred.forEach(element => {
                    var MyObject = new Object()
                    MyObject.label = element
                    suggestions.push(MyObject)
                });
                update(suggestions);
            },
            onSelect: function(item) {
                document.getElementById("InputTrackGroup").value = item.label;
            }
        });
        // Description
        let DivDescription = CoreXBuild.Div("", "InputBox Text", "")
        Contener.appendChild(DivDescription)
        DivDescription.appendChild(CoreXBuild.DivTexte("Description", "", "Text", ""))
        let DivContDesc = CoreXBuild.Div("DivContDesc", "DivContentEdit TextSmall", "")
        DivContDesc.contentEditable = "True"
        DivDescription.appendChild(DivContDesc)
        // Toggle Public
        let DivTooglePublic = CoreXBuild.Div("","Text InputBox", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Contener.appendChild(DivTooglePublic)
        DivTooglePublic.appendChild(CoreXBuild.DivTexte("Public Track:", "", "", ""))
        DivTooglePublic.appendChild(CoreXBuild.ToggleSwitch("TogglePublic", true))
        // // Toggle MultiLine to OneLine
        // let DivToogle = CoreXBuild.Div("","Text InputBox", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        // Contener.appendChild(DivToogle)
        // DivToogle.appendChild(CoreXBuild.DivTexte("MultiLine to OneLine Track:", "", "", ""))
        // DivToogle.appendChild(CoreXBuild.ToggleSwitch("ToggleMultiToOneLine", true))
        
        // Div Button
        let DivBoxButton = CoreXBuild.Div("", "InputBox", "")
        Contener.appendChild(DivBoxButton)
        let DivButton = CoreXBuild.DivFlexRowAr("")
        DivBoxButton.appendChild(DivButton)
        // Button select file
        DivButton.appendChild(CoreXBuild.Button("Upload GPX File",this.SelectFile.bind(this),"Text Button ButtonWidth30", "SelectAndSend"))
        // Button cancel
        DivButton.appendChild(CoreXBuild.Button("Cancel",this.LoadViewManageTracks.bind(this),"Text Button ButtonWidth30", "Cancel"))
        // Empty space
        Contener.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        //Input file
        var Input = document.createElement("input")
        Input.setAttribute("type","file")
        Input.setAttribute("name","FileSelecteur")
        Input.setAttribute("id","FileSelecteur")
        Input.setAttribute("accept", '.gpx')
        Input.setAttribute("style","display: none;")
        Input.addEventListener("change", ()=>{
            // Change button to waiting
            document.getElementById("SelectAndSend").innerHTML="Build..."

            var fichierSelectionne = document.getElementById('FileSelecteur').files[0]
            var reader = new FileReader();
            let me = this
            reader.readAsText(fichierSelectionne, "UTF-8");
            reader.onload = function (evt) {
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(evt.target.result,"text/xml");
                me._GPX = evt.target.result
                me._GeoJson = toGeoJSON.gpx(xmlDoc)
                me.BuildVirutalMap()
            }
            reader.onerror = function (evt) {
                alert("Error reading file");
            }
        }, false)
        Contener.appendChild(Input)
    }

    SelectFile(){
        //if ((document.getElementById("InputTrackName").value != "") && (document.getElementById("InputTrackGroup").value != "")){
            var fileCmd = "FileSelecteur.click()"
            eval(fileCmd)
        //} else {
        //    alert("Enter a name and a group before selecting and sending your file")
        //}
    }

    BuildVirutalMap(){
        this._DivApp.appendChild(CoreXBuild.Div("MyMAp", "", "height: 338px; width: 600px; position: absolute; top: 0px; left: -600px;"))
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
            me.ConvertMapToImage(MyMap)
        })
        // FitBound
        MyMap.fitBounds(layerTrack1.getBounds());
    }

    ConvertMapToImage(MyMap){
        let me = this
        leafletImage(MyMap, function(err, canvas) {
            // var img = document.createElement('img');
            // var dimensions = MyMap.getSize();
            // img.width = dimensions.x;
            // img.height = dimensions.y;
            // img.src = canvas.toDataURL();
            // let divimg = CoreXBuild.Div("Img", "", "")
            // me._DivApp.appendChild(divimg)
            // divimg.appendChild(img);

            me._ImageTrack = canvas.toDataURL()
            me.SendAddTrack()
        });
    }

    SendAddTrack(){
        document.getElementById("SelectAndSend").innerHTML="Send..."
        let Track = new Object()
        Track.Name = document.getElementById("InputTrackName").value 
        Track.Group = document.getElementById("InputTrackGroup").value 
        Track.Public = document.getElementById("TogglePublic").checked 
        //Track.MultiToOneLine = document.getElementById("ToggleMultiToOneLine").checked 
        Track.MultiToOneLine = true
        Track.FileContent = this._GPX
        Track.GeoJson = this._GeoJson
        Track.Image = this._ImageTrack
        Track.Id = null
        Track.ModifyExistingTrack = false
        Track.Description = document.getElementById("DivContDesc").innerText
        // Data to send
        let CallToServer = new Object()
        CallToServer.Action = "Add"
        CallToServer.Data = Track
        GlobalSendSocketIo("GeoX", "ManageTrack", CallToServer)
    }
}

// Creation de l'application
let MyGeoXManageTracks = new GeoXManageTracks(GlobalCoreXGetAppContentId())
// Ajout de l'application
GlobalCoreXAddApp("Manage My Tracks", Icon.GeoXManageTracks(), MyGeoXManageTracks.Initiation.bind(MyGeoXManageTracks))