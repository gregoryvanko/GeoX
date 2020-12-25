class GeoXManageTracks {
    constructor(DivApp){
        this._DivApp = DivApp
        this._FromCurrentView = null
    }

    LoadViewManageTracks(Data, CurrentView){
        this._FromCurrentView = CurrentView
        // Clear Conteneur
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
        AppConteneur.appendChild(CoreXBuild.Button("Add Track",this.LoadViewAddTrack.bind(this,Data.AppGroup, this._FromCurrentView),"Text Button ButtonTop"))
        // Div pour le titre des colonnes
        let BoxTitre = CoreXBuild.DivFlexRowStart("")
        AppConteneur.appendChild(BoxTitre)
        // Titre des colonnes
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 36%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Group","","TextBoxTitre", "width: 18%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Date","","TextBoxTitre", "width: 20%;"))
        // Ajout d'une ligne
        AppConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
        // Ajout des lignes des tracks
        if (Data.AppData.length == 0){
            let BoxTracks = CoreXBuild.DivFlexRowStart("")
            AppConteneur.appendChild(BoxTracks)
            BoxTracks.appendChild(CoreXBuild.DivTexte("No track saved","","Text","margin-top: 4vh; width: 100%; text-align: center;"))
        } else {
            Data.AppData.forEach(Track => {
                let BoxTracks = CoreXBuild.DivFlexRowStart("")
                BoxTracks.style.marginTop = "1vh"
                BoxTracks.style.marginBottom = "1vh"
                AppConteneur.appendChild(BoxTracks)
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Name,"","Text", "width: 36%; margin-left:1%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Group,"","Text", "width: 18%; margin-left:1%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateString(Track.Date),"","Text", "width: 20%;"))
                let DivButton = document.createElement("div")
                DivButton.setAttribute("style", "margin-left: auto; flex-direction: row; justify-content:flex-end; align-content:center; align-items: center; flex-wrap: wrap;")
                DivButton.setAttribute("class", "NotOnIphone")
                DivButton.appendChild(CoreXBuild.Button ("&#8681", this.LoadViewDownload.bind(this,Track._id), "ButtonIcon"))
                DivButton.appendChild(CoreXBuild.Button ("&#128279", this.LoadViewLink.bind(this,Track._id), "ButtonIcon"))
                DivButton.appendChild(CoreXBuild.Button ("&#128394", this.LoadViewUpdateTrack.bind(this,Data.AppGroup, Track._id, Track.Name, Track.Group), "ButtonIcon"))
                DivButton.appendChild(CoreXBuild.Button ("&#128465", this.SendDeleteTrack.bind(this, Track._id, Track.Name), "ButtonIcon"))
                BoxTracks.appendChild(DivButton)
                let DivButtonIphone = document.createElement("div")
                DivButtonIphone.setAttribute("style", "margin-left: auto; flex-direction: row; justify-content:flex-end; align-content:center; align-items: center; flex-wrap: wrap;")
                DivButtonIphone.setAttribute("class", "OnlyIphone")
                DivButtonIphone.appendChild(CoreXBuild.Button ("&#8286", this.LoadViewIphone.bind(this,Data.AppGroup, Track), "ButtonIcon"))
                BoxTracks.appendChild(DivButtonIphone)
                // Ajout d'une ligne
                AppConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
            });
        }
    }

    LoadViewIphone(AppGroup, Track){
        let HTMLContent = CoreXBuild.DivFlexColumn()
        HTMLContent.appendChild(CoreXBuild.DivTexte("Track actions", "", "Text", ""))
        HTMLContent.appendChild(CoreXBuild.Button ("&#128279 Get Track link", this.LoadViewLink.bind(this,Track._id), "Text Button"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#128394 Update Track", this.LoadViewUpdateTrack.bind(this,AppGroup, Track._id, Track.Name, Track.Group), "Text Button"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#128465 Delete Track", this.SendDeleteTrack.bind(this, Track._id, Track.Name), "Text Button"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#8681 GPX", this.DownloadFile.bind(this, "GPX", Track._id), "Text Button"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#8681 GeoJson", this.DownloadFile.bind(this, "GeoJson", Track._id), "Text Button"))
        CoreXWindow.BuildWindow(HTMLContent)
    }

    LoadViewDownload(TrackId){
        let HTMLContent = CoreXBuild.DivFlexColumn()
        HTMLContent.appendChild(CoreXBuild.DivTexte("Download file", "", "Text", ""))
        HTMLContent.appendChild(CoreXBuild.Button ("&#8681 GPX", this.DownloadFile.bind(this, "GPX", TrackId), "Text Button"))
        HTMLContent.appendChild(CoreXBuild.Button ("&#8681 GeoJson", this.DownloadFile.bind(this, "GeoJson", TrackId), "Text Button"))
        CoreXWindow.BuildWindow(HTMLContent)
    }

    DownloadFile(Type, TrackId){
        CoreXWindow.DeleteWindow()
        alert(Type)
    }

    SendDeleteTrack(TrackId, TrackName){
        // Send delete tracks to serveur
        if (confirm(`Do you want to delete track : ${TrackName}?`)){
            // Data to send
            let Data = new Object()
            Data.Action = "Delete"
            Data.Data = TrackId
            Data.FromCurrentView = this._FromCurrentView
            GlobalSendSocketIo("GeoX", "ManageTrack", Data)
        }
    }

    LoadViewLink(TrackId){
        alert(window.location.href + "getmap/?trackid=" + TrackId)
    }

    LoadViewUpdateTrack(Groups, TrackId, TrackName, TrackGroup){
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
                var suggestions = Groups.filter(n => n.toLowerCase().startsWith(text))
                update(suggestions);
            },
            onSelect: function(item) {
                document.getElementById("InputTrackGroup").value = item;
            }
        });
        // Button Update
        Contener.appendChild(CoreXBuild.Button("Update Track",this.SendUpdateTrack.bind(this, TrackId),"Text Button"))
    }

    SendUpdateTrack(TrackId){
        if ((document.getElementById("InputTrackName").value != "") && (document.getElementById("InputTrackGroup").value != "")){
            let Track = new Object()
            Track.Id = TrackId
            Track.Name = document.getElementById("InputTrackName").value 
            Track.Group = document.getElementById("InputTrackGroup").value 
            // Data to send
            let Data = new Object()
            Data.Action = "Update"
            Data.Data = Track
            Data.FromCurrentView = this._FromCurrentView
            GlobalSendSocketIo("GeoX", "ManageTrack", Data)
        } else {
            alert("Enter a name and a group before updating a track")
        }
    }

    LoadViewAddTrack(Groups, CurrentView){
        this._FromCurrentView = CurrentView
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
                var suggestions = Groups.filter(n => n.toLowerCase().startsWith(text))
                update(suggestions);
            },
            onSelect: function(item) {
                document.getElementById("InputTrackGroup").value = item;
            }
        });
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
        Track.FileContent = File
        // Data to send
        let Data = new Object()
        Data.Action = "Add"
        Data.Data = Track
        Data.FromCurrentView = this._FromCurrentView
        GlobalSendSocketIo("GeoX", "ManageTrack", Data)
    }
}