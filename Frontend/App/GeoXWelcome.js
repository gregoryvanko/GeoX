class GeoXWelcome {
    constructor(DivApp){
        this._DivApp = DivApp
    }

    LoadWelcomeView(FindTracksInGeox, AddTrack, CreateTrack){
        // Clear view
        this._DivApp.innerHTML = ""
        // Contener
        let Contener = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Contener)
        // Titre
        Contener.appendChild(CoreXBuild.DivTexte("Welcome to GeoX", "", "Titre", ""))

        Contener.appendChild(CoreXBuild.Button("Find Track in GeoX",FindTracksInGeox,"Text Button"))
        Contener.appendChild(CoreXBuild.Button("Add Track form file",AddTrack,"Text Button"))
        Contener.appendChild(CoreXBuild.Button("Create Track form map",CreateTrack,"Text Button"))
    }
}