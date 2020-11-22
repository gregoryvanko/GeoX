class GeoXManageTracks {
    constructor(DivApp){
        this._DivApp = DivApp
    }

    LoadViewManageTracks(Data){
        // Add action add track
        GlobalAddActionInList("Add Track", this.LoadViewAddTrack.bind(this))
        // Clear Conteneur
        this._DivApp.innerHTML = ""
        // Contener
        let Contener = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Contener)
        // Titre de l'application
        Contener.appendChild(CoreXBuild.DivTexte("Manage Tracks", "", "Titre", "margin-bottom:0%"))
        // Conteneur de la liste des tracks
        let TracksConteneur = CoreXBuild.Div("TracksConteneur", "TracksConteneur", "")
        Contener.appendChild(TracksConteneur)
        // Boutton Add Track
        TracksConteneur.appendChild(CoreXBuild.Button("Add Track",this.LoadViewAddTrack.bind(this),"Text Button ButtonTop"))
        // Div pour le titre des colonnes
        let BoxTitre = CoreXBuild.DivFlexRowStart("")
        TracksConteneur.appendChild(BoxTitre)
        // Titre des colonnes
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 45%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Group","","TextBoxTitre", "width: 20%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Date","","TextBoxTitre", "width: 20%;"))
        //BoxTitre.appendChild(CoreXBuild.DivTexte("Action","","TextBoxTitre", "width: 16%;"))
        // Ajout d'une ligne
        TracksConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
        // Ajout des lignes des tracks
        if (Data.length == 0){
            let BoxTracks = CoreXBuild.DivFlexRowStart("")
            TracksConteneur.appendChild(BoxTracks)
            BoxTracks.appendChild(CoreXBuild.DivTexte("No track saved","","Text","margin-top: 4vh; width: 100%; text-align: center;"))
        } else {
            Data.forEach(Track => {
                let BoxTracks = CoreXBuild.DivFlexRowStart("")
                BoxTracks.style.marginTop = "2vh"
                BoxTracks.style.marginBottom = "2vh"
                TracksConteneur.appendChild(BoxTracks)
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Name,"","Text", "width: 45%; margin-left:1%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Group,"","Text", "width: 20%; margin-left:1%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateTimeString(Track.Date),"","Text", "width: 20%;"))
                let DivButton = document.createElement("div")
                DivButton.setAttribute("style", "margin-left: auto; display: -webkit-flex; display: flex; flex-direction: row; justify-content:flex-end; align-content:center; align-items: center; flex-wrap: wrap;")
                DivButton.appendChild(CoreXBuild.Button ("&#128394", this.UpdateTrack.bind(this, Track._id), "ButtonIcon Text"))
                DivButton.appendChild(CoreXBuild.Button ("&#128465", this.DeleteTrack.bind(this, Track._id), "ButtonIcon Text"))
                BoxTracks.appendChild(DivButton)
                // Ajout d'une ligne
                TracksConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
            });
        }
    }

    DeleteTrack(TrackId){
        // Send delete tracks to serveur
        if (confirm('Do you want to delete this track?')){
            // Data to send
            let Data = new Object()
            Data.Action = "Delete"
            Data.Data = TrackId
            GlobalSendSocketIo("GeoX", "ManageTrack", Data)
        }
    }

    UpdateTrack(TrackId){
        alert("ToDo")
    }

    LoadViewAddTrack(){
        let TracksConteneur = document.getElementById("TracksConteneur")
        TracksConteneur.innerHTML = ""
        // Texte Save new track
        TracksConteneur.appendChild(CoreXBuild.DivTexte("Save new Track", "", "SousTitre", "margin-top: 4vh; margin-bottom: 4vh;"))
        TracksConteneur.appendChild(CoreXBuild.InputWithLabel("InputBox", "Name of the track", "Text", "InputTrackName","", "Input Text", "text", "Name",))
        TracksConteneur.appendChild(CoreXBuild.InputWithLabel("InputBox", "Name of the group", "Text", "InputTrackGroup","", "Input Text", "text", "Group",))
        TracksConteneur.appendChild(CoreXBuild.Button("Select and update File",this.SelectFile.bind(this),"Text Button"))
        
        //Input element
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
                me.SendFileData(evt.target.result)
            }
            reader.onerror = function (evt) {
                alert("Error reading file");
            }
        }, false)
        
        TracksConteneur.appendChild(Input)
    }

    SelectFile(){
        if ((document.getElementById("InputTrackName").value != "") && (document.getElementById("InputTrackGroup").value != "")){
            var fileCmd = "FileSelecteur.click()"
            eval(fileCmd)
        } else {
            alert("Enter a name and a group before selecting and sending your file")
        }
    }

    SendFileData(File){
        let Track = new Object()
        Track.Name = document.getElementById("InputTrackName").value 
        Track.Group = document.getElementById("InputTrackGroup").value 
        Track.FileContent = File
        // Data to send
        let Data = new Object()
        Data.Action = "Add"
        Data.Data = Track
        GlobalSendSocketIo("GeoX", "ManageTrack", Data)
    }
}