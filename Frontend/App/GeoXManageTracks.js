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
        AppConteneur.appendChild(CoreXBuild.Button("Add Track",this.LoadViewAddTrack.bind(this, this._FromCurrentView),"Text Button ButtonTop"))
        // Div pour le titre des colonnes
        let BoxTitre = CoreXBuild.DivFlexRowStart("")
        AppConteneur.appendChild(BoxTitre)
        // Titre des colonnes
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 40%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Group","","TextBoxTitre", "width: 20%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Date","","TextBoxTitre", "width: 20%;"))
        // Ajout d'une ligne
        AppConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
        // Ajout des lignes des tracks
        if (Data.length == 0){
            let BoxTracks = CoreXBuild.DivFlexRowStart("")
            AppConteneur.appendChild(BoxTracks)
            BoxTracks.appendChild(CoreXBuild.DivTexte("No track saved","","Text","margin-top: 4vh; width: 100%; text-align: center;"))
        } else {
            Data.forEach(Track => {
                let BoxTracks = CoreXBuild.DivFlexRowStart("")
                BoxTracks.style.marginTop = "1vh"
                BoxTracks.style.marginBottom = "1vh"
                AppConteneur.appendChild(BoxTracks)
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Name,"","Text", "width: 40%; margin-left:1%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Group,"","Text", "width: 20%; margin-left:1%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateTimeString(Track.Date),"","Text", "width: 20%;"))
                let DivButton = document.createElement("div")
                DivButton.setAttribute("style", "margin-left: auto; display: -webkit-flex; display: flex; flex-direction: row; justify-content:flex-end; align-content:center; align-items: center; flex-wrap: wrap;")
                DivButton.appendChild(CoreXBuild.Button ("&#128394", this.UpdateTrack.bind(this, Track._id), "ButtonIcon Text"))
                DivButton.appendChild(CoreXBuild.Button ("&#128465", this.SendDeleteTrack.bind(this, Track._id, Track.Name), "ButtonIcon Text"))
                BoxTracks.appendChild(DivButton)
                // Ajout d'une ligne
                AppConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
            });
        }
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

    UpdateTrack(TrackId){
        alert("ToDo")
    }

    LoadViewAddTrack(CurrentView){
        this._FromCurrentView = CurrentView
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Contener
        let Contener = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Contener)
        // Titre de l'application
        Contener.appendChild(CoreXBuild.DivTexte("Add new Tracks", "", "Titre", ""))
        // Input Name
        Contener.appendChild(CoreXBuild.InputWithLabel("InputBox", "Name of the track", "Text", "InputTrackName","", "Input Text", "text", "Name",))
        // Input `Group
        Contener.appendChild(CoreXBuild.InputWithLabel("InputBox", "Name of the group", "Text", "InputTrackGroup","", "Input Text", "text", "Group",))
        // Button select file
        Contener.appendChild(CoreXBuild.Button("Select and update File",this.SelectFile.bind(this),"Text Button"))
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