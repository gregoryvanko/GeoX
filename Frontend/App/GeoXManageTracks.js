class GeoXManageTracks {
    constructor(DivApp){
        this._DivApp = DivApp
    }

    BuildViewWatingData(){
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Manage Tracks", "", "Titre", "text-align: center;"))
        // Contener
        let Conteneur = CoreXBuild.Div("TracksConteneur", "TracksConteneur")
        this._DivApp.appendChild(Conteneur)
        // on construit le texte d'attente
        Conteneur.appendChild(CoreXBuild.DivTexte("Waiting server data...","","Text", "text-align: center;"))
        // Send status to serveur
        GlobalSendSocketIo("GeoX", "BuildViewManageTracks", "")
    }

    LoadViewManageTracks(Data){
        // Conteneur pour la liste des track
        let TracksConteneur = document.getElementById("TracksConteneur")
        TracksConteneur.innerHTML=""
        // Div pour le titre des colonnes
        let BoxTitre = CoreXBuild.DivFlexRowStart("")
        TracksConteneur.appendChild(BoxTitre)
        // Titre des colonnes
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 55%; margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Date","","TextBoxTitre", "width: 25%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Action","","TextBoxTitre", "width: 16%;"))
        // Ajout d'une ligne
        TracksConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
        // Ajout des lignes des tracks
        if (Data.length == 0){
            let BoxTracks = CoreXBuild.DivFlexRowStart("")
            TracksConteneur.appendChild(BoxTracks)
            BoxTracks.appendChild(CoreXBuild.DivTexte("No track saved","","Text","margin-top: 4vh;"))
        } else {
            Data.forEach(Track => {
                let BoxTracks = CoreXBuild.DivFlexRowStart("")
                BoxTracks.style.marginTop = "2vh"
                BoxTracks.style.marginBottom = "2vh"
                TracksConteneur.appendChild(BoxTracks)
                BoxTracks.appendChild(CoreXBuild.DivTexte(Track.Name,"","Text", "width: 55%; margin-left:1%;"))
                BoxTracks.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateTimeString(Track.Date),"","Text", "width: 25%;"))
                BoxTracks.appendChild(CoreXBuild.Button ("&#128465", this.DeleteTrack.bind(this, Track._id), "ButtonTrash Text"))
                // Ajout d'une ligne
                TracksConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
            });
        }
    }

    DeleteTrack(TrackId){
        alert(TrackId)
    }
}