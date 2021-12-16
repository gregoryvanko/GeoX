class FilterBox {
    constructor(Data){
        this._InitialData = Data
        this.BuildView()
    }

    BuildView(){
        // Create filter view
        let Conteneur = CoreXBuild.DivFlexColumn("")

        // Titre
        Conteneur.appendChild(CoreXBuild.DivTexte("Filter", "", "Titre", "width:100%; text-align: center; margin-bottom: 0rem"))

        // Min Km
        if(this._InitialData.DistanceMin != undefined){
            let DivMinKm = CoreXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
            Conteneur.appendChild(DivMinKm)
            DivMinKm.appendChild(CoreXBuild.DivTexte("Distance Min (Km):", "", "", ""))
            DivMinKm.appendChild(CoreXBuild.Input("MinKm", this._InitialData.DistanceMin, "Input", "width: 20%;", "number", "MinKm"))
        }
        
        // Max Km
        if(this._InitialData.DistanceMax != undefined){
            let DivMaxKm = CoreXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
            Conteneur.appendChild(DivMaxKm)
            DivMaxKm.appendChild(CoreXBuild.DivTexte("Max Distance (Km):", "", "", ""))
            DivMaxKm.appendChild(CoreXBuild.Input("MaxKm", this._InitialData.DistanceMax, "Input", "width: 20%;", "number", "MaxKm"))
        }
        // Toggle HideMyTrack
        if(this._InitialData.HideMyTrack != undefined){
            let DivToogleHideMyTrack = CoreXBuild.Div("","Text InputBoxCoreXWindow", "display: -webkit-flex; display: flex; flex-direction: row; justify-content:space-between; align-content:center; align-items: center;")
            Conteneur.appendChild(DivToogleHideMyTrack)
            DivToogleHideMyTrack.appendChild(CoreXBuild.DivTexte("Hide my Track:", "", "", ""))
            DivToogleHideMyTrack.appendChild(CoreXBuild.ToggleSwitch("ToggleHideMyTrack", this._InitialData.HideMyTrack))
        }


        // Empty space
        Conteneur.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Div Button
        let DivButton = CoreXBuild.DivFlexRowAr("")
        Conteneur.appendChild(DivButton)
        // Button save
        DivButton.appendChild(CoreXBuild.Button("Save",this.ClickSave.bind(this),"Text Button ButtonWidth30", "Save"))
        // Button cancel
        DivButton.appendChild(CoreXBuild.Button("Cancel",this.CloseBox.bind(this),"Text Button ButtonWidth30", "Cancel"))
        // Empty space
        Conteneur.appendChild(CoreXBuild.Div("", "", "height:2vh;"))
        // Build window
        CoreXWindow.BuildWindow(Conteneur)
    }

    CloseBox(){
        CoreXWindow.DeleteWindow()
    }

    ClickSave(){
        let Filter = this._InitialData

        if(this._InitialData.DistanceMin != undefined){Filter.DistanceMin = parseInt(document.getElementById("MinKm").value)}
        if(this._InitialData.DistanceMax != undefined){Filter.DistanceMax = parseInt(document.getElementById("MaxKm").value)}
        if(this._InitialData.HideMyTrack != undefined){Filter.HideMyTrack = document.getElementById("ToggleHideMyTrack").checked}

        // close window
        CoreXWindow.DeleteWindow()
        // Start save action
        this.Save(Filter)
    }

    Save(Filter){
        alert("ToDo Save Filter")
    }
}