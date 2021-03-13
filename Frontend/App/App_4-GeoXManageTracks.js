class GeoXManageTracks {
    constructor(DivApp){
        this._DivApp = document.getElementById(DivApp)
        this._AppData = null
        this._AppGroup = null
        this.GeoXCreateTrackView = MyGeoXCreateTrack
    }

    Initiation(){
        // Show Action Button
        GlobalDisplayAction('On')
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
            this.LoadViewManageTracks()
        } else if (Value.Action == "SetDownloadedFile" ){
            this.DownloadedFileToClient(Value.Data)
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
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 36%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Group","","TextBoxTitre", "width: 18%;"))
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
                BoxTracks.style.marginTop = "1vh"
                BoxTracks.style.marginBottom = "1vh"
                AppConteneur.appendChild(BoxTracks)
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Name,"","Text", "width: 36%; margin-left:1%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Group,"","TextSmall", "width: 18%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateString(Track.Date),"","TextSmall", "width: 15%;"))
                if (Track.Public){
                    BoxTracks.appendChild(CoreXBuild.Image64(Icon.Shared(),"", "IconeInList", ""))
                } else {
                    BoxTracks.appendChild(CoreXBuild.Image64(Icon.Key(),"", "IconeInList", ""))
                }
                
                let DivButton = document.createElement("div")
                DivButton.setAttribute("style", "margin-left: auto; flex-direction: row; justify-content:flex-end; align-content:center; align-items: center; flex-wrap: wrap;")
                DivButton.setAttribute("class", "NotOnIphone")
                DivButton.appendChild(CoreXBuild.Button ("&#8681", this.LoadViewDownload.bind(this,Track._id), "ButtonIcon"))
                DivButton.appendChild(CoreXBuild.Button ("&#128279", this.LoadViewLink.bind(this,Track._id, false), "ButtonIcon"))
                DivButton.appendChild(CoreXBuild.Button ("&#128394", this.LoadViewUpdateTrack.bind(this,this._AppGroup, Track._id, Track.Name, Track.Group, Track.Public, false), "ButtonIcon"))
                DivButton.appendChild(CoreXBuild.Button (`<img src="${Icon.ModifyTrack()}" alt="icon" width="25" height="25">`, this.ModifyTrack.bind(this,this._AppGroup, Track._id, Track.Name, Track.Group, Track.Public, false), "ButtonIcon"))
                DivButton.appendChild(CoreXBuild.Button ("&#128465", this.SendDeleteTrack.bind(this, Track._id, Track.Name, false), "ButtonIcon"))
                BoxTracks.appendChild(DivButton)
                let DivButtonIphone = document.createElement("div")
                DivButtonIphone.setAttribute("style", "margin-left: auto; flex-direction: row; justify-content:flex-end; align-content:center; align-items: center; flex-wrap: wrap;")
                DivButtonIphone.setAttribute("class", "OnlyIphone")
                DivButtonIphone.appendChild(CoreXBuild.Button ("&#8286", this.LoadViewIphone.bind(this,this._AppGroup, Track), "ButtonIcon"))
                BoxTracks.appendChild(DivButtonIphone)
                // Ajout d'une ligne
                AppConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
            });
        }
    }

    LoadViewIphone(AppGroup, Track){
        let HTMLContent = CoreXBuild.DivFlexColumn()
        HTMLContent.appendChild(CoreXBuild.DivTexte("Track actions", "", "Text", ""))
        HTMLContent.appendChild(CoreXBuild.Button ("&#128279 Get Track link", this.LoadViewLink.bind(this,Track._id, true), "Text ButtonCoreXWindow"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#128394 Update Track", this.LoadViewUpdateTrack.bind(this,AppGroup, Track._id, Track.Name, Track.Group, Track.Public, true), "Text ButtonCoreXWindow"))
        HTMLContent.appendChild(CoreXBuild.Button (`<img src="${Icon.ModifyTrack()}" alt="icon" width="16" height="16"> Modify Track`, this.ModifyTrack.bind(this,this._AppGroup, Track._id, Track.Name, Track.Group, Track.Public, true), "Text ButtonCoreXWindow"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#128465 Delete Track", this.SendDeleteTrack.bind(this, Track._id, Track.Name, true), "Text ButtonCoreXWindow"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#8681 GPX", this.DownloadFile.bind(this, "gpx", Track._id), "Text ButtonCoreXWindow"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#8681 GeoJson", this.DownloadFile.bind(this, "geojson", Track._id), "Text ButtonCoreXWindow"))
        CoreXWindow.BuildWindow(HTMLContent)
    }

    LoadViewDownload(TrackId){
        let HTMLContent = CoreXBuild.DivFlexColumn()
        HTMLContent.appendChild(CoreXBuild.DivTexte("Download file", "", "Text", ""))
        HTMLContent.appendChild(CoreXBuild.Button ("&#8681 GPX", this.DownloadFile.bind(this, "gpx", TrackId), "Text ButtonCoreXWindow"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#8681 GeoJson", this.DownloadFile.bind(this, "geojson", TrackId), "Text ButtonCoreXWindow"))
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

    LoadViewLink(TrackId, IsCoreXWindow){
        if (IsCoreXWindow){CoreXWindow.DeleteWindow()}
        alert(window.location.origin + "/getmap/?trackid=" + TrackId)
    }

    LoadViewUpdateTrack(Groups, TrackId, TrackName, TrackGroup, Public, IsCoreXWindow){
        if (IsCoreXWindow){CoreXWindow.DeleteWindow()}
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
        // Toggle Public
        let DivTooglePublic = CoreXBuild.Div("","Text InputBox", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Contener.appendChild(DivTooglePublic)
        DivTooglePublic.appendChild(CoreXBuild.DivTexte("Public Track:", "", "", ""))
        DivTooglePublic.appendChild(CoreXBuild.ToggleSwitch("TogglePublic", Public))
        // Button Update
        Contener.appendChild(CoreXBuild.Button("Update Track",this.SendUpdateTrack.bind(this, TrackId),"Text Button"))
    }

    ModifyTrack(Groups, TrackId, TrackName, TrackGroup, Public, IsCoreXWindow){
        if (IsCoreXWindow){CoreXWindow.DeleteWindow()}
        this.GeoXCreateTrackView.InitiationModifyMyTrack(Groups, TrackId, TrackName, TrackGroup, Public)
    }

    SendUpdateTrack(TrackId){
        if ((document.getElementById("InputTrackName").value != "") && (document.getElementById("InputTrackGroup").value != "")){
            let Track = new Object()
            Track.Id = TrackId
            Track.Name = document.getElementById("InputTrackName").value 
            Track.Group = document.getElementById("InputTrackGroup").value 
            Track.Public = document.getElementById("TogglePublic").checked 
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
        // Toggle Public
        let DivTooglePublic = CoreXBuild.Div("","Text InputBox", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Contener.appendChild(DivTooglePublic)
        DivTooglePublic.appendChild(CoreXBuild.DivTexte("Public Track:", "", "", ""))
        DivTooglePublic.appendChild(CoreXBuild.ToggleSwitch("TogglePublic", true))
        // Toggle MultiLine to OneLine
        let DivToogle = CoreXBuild.Div("","Text InputBox", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
        Contener.appendChild(DivToogle)
        DivToogle.appendChild(CoreXBuild.DivTexte("MultiLine to OneLine Track:", "", "", ""))
        DivToogle.appendChild(CoreXBuild.ToggleSwitch("ToggleMultiToOneLine", true))
        
        // Button select file
        Contener.appendChild(CoreXBuild.Button("Select and upload File",this.SelectFile.bind(this),"Text Button", "SelectAndSend"))
        //Input file
        var Input = document.createElement("input")
        Input.setAttribute("type","file")
        Input.setAttribute("name","FileSelecteur")
        Input.setAttribute("id","FileSelecteur")
        Input.setAttribute("accept", '.gpx')
        Input.setAttribute("style","display: none;")
        Input.addEventListener("change", ()=>{
            var fichierSelectionne = document.getElementById('FileSelecteur').files[0]
            var reader = new FileReader();
            let me = this
            reader.readAsText(fichierSelectionne, "UTF-8");
            reader.onload = function (evt) {
                me.SendAddTrack(evt.target.result)
            }
            reader.onerror = function (evt) {
                alert("Error reading file");
            }
        }, false)
        Contener.appendChild(Input)
    }

    SelectFile(){
        if ((document.getElementById("InputTrackName").value != "") && (document.getElementById("InputTrackGroup").value != "")){
            var fileCmd = "FileSelecteur.click()"
            eval(fileCmd)
        } else {
            alert("Enter a name and a group before selecting and sending your file")
        }
    }

    SendAddTrack(File){
        // Change button to waiting
        document.getElementById("SelectAndSend").innerHTML="Waiting..."
        let Track = new Object()
        Track.Name = document.getElementById("InputTrackName").value 
        Track.Group = document.getElementById("InputTrackGroup").value 
        Track.Public = document.getElementById("TogglePublic").checked 
        Track.MultiToOneLine = document.getElementById("ToggleMultiToOneLine").checked 
        Track.FileContent = File
        Track.Id = null
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