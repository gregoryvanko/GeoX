class HtmlElemGeoxPost extends HTMLElement {
    constructor(Data = {_id: "no-id", Name: "No Name", Description:null, Date:null, Length:null, InfoElevation:null, Image:null}){
        super()
        this.Shadow = this.attachShadow({mode: "open"})

        this._Name = Data.Name
        this._Description = Data.Description
        this._Date = Data.Date
        this._Length = Data.Length
        this._InfoElevation = Data.InfoElevation
        this._Image = Data.Image
    }

    connectedCallback(){
        this.Render()
    }

    Render(){        
        let DivPost = document.createElement('div') 
        DivPost.classList.add("DivPost")
        // Content
        let DivContent = document.createElement('div')
        DivContent.style.width = "100%"
        DivContent.style.cursor = "pointer"
        DivContent.onclick = this.OnClickPost.bind(this)
        DivPost.appendChild(DivContent)
        // Add Info
        DivContent.appendChild(this.RenderPostsTitre(this._Name))
        // Add mesure
        DivContent.appendChild(this.RenderPostsMesure(this._Description, this._Date, this._Length, this._InfoElevation))
        // Add image
        DivContent.appendChild(this.RenderPostsMapImage(this._Image))
        // Add Action Button
        DivPost.appendChild(this.RenderActionButton())
        
        // Add CSS to Shadow element
        this.Shadow.innerHTML= `
        <style>
            .DivPost{
                width:100%;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                align-content: center;
                background-color: white;
                padding: 0.5rem;
                /*border: 0.1rem solid black;*/
                border-radius: 0.2rem;
                margin-bottom: 1rem;
                box-shadow: 0.1rem 0.1rem  0.4rem black;
            }
            
            .PostInfo{
                width: 100%;
                box-sizing: border-box;
                padding: 0.4rem 0.9rem 0.4rem 0.9rem;
            }
            
            .PostTitre{
                font-weight: bold;
                font-size: 1.5rem;
                box-sizing: border-box;
                width: 100%;
                margin-top: 0.4rem;
            }
            
            .PostDate{
                font-size: 0.8rem;
                color: rgb(109, 109, 120);
            }
            
            .PostDescription{
                margin-bottom: 0.4rem;
            }
            
            .PostDivImg{
                width: 100%;
                /*padding-left: 0.9rem;
                padding-right: 0.9rem;*/
                box-sizing: border-box;
            }
            
            .PostImg{
                /*border: 0.05rem solid black;*/
                width: 100%;
                border-radius: 0.2rem;
            }
            
            .FlexRowAr{
                display: flex; 
                flex-direction: row; 
                justify-content:space-between; 
                align-content:center; 
                align-items: center; 
                flex-wrap: wrap;
            }
            
            .FlexColAr{
                display: flex; 
                flex-direction: column; 
                justify-content:space-around; 
                align-content:center; 
                align-items: center; 
                flex-wrap: wrap;
            }
            
            .PostInfoBox{
                /*border: 0.05rem solid black;
                border-radius: 0.5rem;*/
                width: 100%;
                padding: 0.2rem;
                margin-bottom: 0.4rem;
            }
            
            .PostInfoTextValue{
                padding-right: 0.5rem; 
                font-size: 0.8rem;
            }
            
            .PostInfoTextUnite{
                font-size: 0.8rem;
            }
            
            .PostInfoImg{
                height: 2rem;
                width: 2rem;
                display: flex; 
                flex-direction: row; 
                justify-content:center; 
                align-content:center; 
                align-items: center; 
                flex-wrap: wrap;
            }
            
            .PostVerticalLine{
                border-left: 0.2rem solid #dfdfe8; 
                height: 3rem;
            }

            .CloseButton{
                margin-bottom: 0.5rem;
                margin-top: 0.5rem;
                padding: 0.1rem;
                cursor: pointer;
                border: 1px solid black;
                border-radius: 1rem;
                text-align: center;
                display: inline-block;
                color: black;
                background: transparent;
                outline: none;
                width: 3.5rem;
                margin-left: auto;
                margin-right: auto;
                background-color: white;
            }
        </style>
        `
        // Add DivPost to shadow element
        this.Shadow.appendChild(DivPost)
    }

    RenderPostsTitre(PostName = "Name"){
        let DivContent = document.createElement('div')
        DivContent.classList.add("PostTitre")
        DivContent.innerText = PostName

        return DivContent
    }

    RenderPostsMesure(PsotDescription= "Description", PostDate= null, Length = null, InfoElevation = null){
        let Div = document.createElement('div')
        Div.classList.add("PostInfo")
        // Date
        let DivDate = document.createElement('div') 
        Div.appendChild(DivDate)
        DivDate.classList.add("PostDate")
        DivDate.classList.add("PostDescription")
        DivDate.innerText= this.GetDateString(PostDate)
        // Description
        let DivDescription = document.createElement('div') 
        Div.appendChild(DivDescription)
        DivDescription.classList.add("PostDescription")
        DivDescription.innerText= PsotDescription
        // Info track
        let DivCont = document.createElement('div')
        Div.appendChild(DivCont)
        DivCont.classList.add("PostInfo")
        DivCont.classList.add("PostInfoBox")
        let DivContent = document.createElement('div')
        DivCont.appendChild(DivContent)
        DivContent.classList.add("FlexRowAr")
        DivContent.appendChild(this.RenderPostsMesureInfo(Length, "Km", this.GetSvgMesureDiv()))
        DivContent.appendChild(this.RenderPostsMesureInfoVerticalLine())
        DivContent.appendChild(this.RenderPostsMesureInfo(InfoElevation.ElevCumulP, "m", this.GetSvgElevationPlusDiv()))
        DivContent.appendChild(this.RenderPostsMesureInfoVerticalLine())
        DivContent.appendChild(this.RenderPostsMesureInfo(InfoElevation.ElevCumulM, "m", this.GetSvgElevationMoinsDiv()))
        DivContent.appendChild(this.RenderPostsMesureInfoVerticalLine())
        DivContent.appendChild(this.RenderPostsMesureInfo(InfoElevation.ElevMax, "m", this.GetSvgElevationMaxDiv()))
        DivContent.appendChild(this.RenderPostsMesureInfoVerticalLine())
        DivContent.appendChild(this.RenderPostsMesureInfo(InfoElevation.ElevMin, "m", this.GetSvgElevationMinDiv()))

        return Div
    }

    RenderPostsMesureInfo(Value, Unite, Description){
        let DivContent = document.createElement('div')
        DivContent.classList.add("FlexColAr")

        let conteneurvalue = document.createElement('div')
        conteneurvalue.classList.add("FlexRowAr")
        let DivValue = document.createElement('div')
        DivValue.innerText = Value
        DivValue.classList.add("PostInfoTextValue")
        conteneurvalue.appendChild(DivValue)

        let DivUnite = document.createElement('div')
        DivUnite.innerText = Unite
        DivUnite.classList.add("PostInfoTextUnite")
        conteneurvalue.appendChild(DivUnite)

        DivContent.appendChild(conteneurvalue)

        let DivImage = document.createElement('div')
        DivImage.classList.add("PostInfoImg")
        DivImage.appendChild(Description)
        DivContent.appendChild(DivImage)
        return DivContent
    }

    RenderPostsMesureInfoVerticalLine(){
        let conteneur = document.createElement('div')
        conteneur.classList.add("PostVerticalLine")
        return conteneur
    }

    RenderPostsMapImage(Image){
        if(Image){
            var img = document.createElement('img');
            img.classList.add("PostImg")
            img.src = Image
            let divimg = document.createElement('div');
            divimg.classList.add("PostDivImg")
            divimg.appendChild(img)
            return divimg
        } else {
            let divimg = document.createElement('div');
            divimg.style.width = "40%"
            divimg.appendChild(this.GetSvgNoImageDiv())
            return divimg
        }
    }

    RenderActionButton(){
        let Div = document.createElement('div')
        Div.classList.add("PostInfo")
        Div.classList.add("PostInfoBox")
        let DivContent = document.createElement('div')
        Div.appendChild(DivContent)
        DivContent.classList.add("FlexRowAr")
        DivContent.appendChild(this.RenderButton(this.GetImgSaveBlack(), this.OnClickSave.bind(this)))
        DivContent.appendChild(this.RenderPostsMesureInfoVerticalLine())
        DivContent.appendChild(this.RenderButton(this.GetImgDownload(), this.OnClickGpx.bind(this)))
        DivContent.appendChild(this.RenderPostsMesureInfoVerticalLine())
        DivContent.appendChild(this.RenderButton(this.GetImgStartFlag(), this.OnClickGoTo.bind(this)))
        DivContent.appendChild(this.RenderPostsMesureInfoVerticalLine())
        DivContent.appendChild(this.RenderButton(this.GetImgFollow(), this.OnClickFollow.bind(this)))

        return Div
    }

    RenderButton(Image, Action){
        let button = document.createElement('button')
        button.innerHTML = `<img src="${Image}" alt="icon" width="20" height="20">`
        button.classList.add("CloseButton");
        button.onclick = Action
        return button
    }

    OnClickPost(){
        alert('click on post')
    }
    
    OnClickSave(){
        alert("Save")
    }

    OnClickGpx(){
        alert("Gpx")
    }

    OnClickGoTo(){
        alert("GoTo")
    }

    OnClickFollow(){
        alert("Follow")
    }

    GetDateString(DateString){
        var Now = new Date(DateString)
        var dd = Now.getDate()
        var mm = Now.getMonth()+1
        var yyyy = Now.getFullYear()
        if(dd<10) {dd='0'+dd} 
        if(mm<10) {mm='0'+mm}
        return yyyy + "-" + mm + "-" + dd
    }

    GetImgSaveBlack(){
        return 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9IjAgMCAxNzIgMTcyIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtZGFzaGFycmF5PSIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBmb250LWZhbWlseT0ibm9uZSIgZm9udC13ZWlnaHQ9Im5vbmUiIGZvbnQtc2l6ZT0ibm9uZSIgdGV4dC1hbmNob3I9Im5vbmUiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMCwxNzJ2LTE3MmgxNzJ2MTcyeiIgZmlsbD0ibm9uZSI+PC9wYXRoPjxnIGZpbGw9IiMwMDAwMDAiPjxwYXRoIGQ9Ik0yNC4wOCwxMy43NmMtNS42NjAzNiwwIC0xMC4zMiw0LjY1OTY0IC0xMC4zMiwxMC4zMnYxMjMuODRjMCw1LjY2MDM3IDQuNjU5NjQsMTAuMzIgMTAuMzIsMTAuMzJoMTIzLjg0YzUuNjYwMzcsMCAxMC4zMiwtNC42NTk2MyAxMC4zMiwtMTAuMzJ2LTEwMi41MTQ2OWMtMC4wMDAxOCwtMC45MTIyOCAtMC4zNjI2OSwtMS43ODcxNSAtMS4wMDc4MSwtMi40MzIxOWwtMjguMjA1MzEsLTI4LjIwNTMxYy0wLjY0NTA0LC0wLjY0NTEyIC0xLjUxOTksLTEuMDA3NjQgLTIuNDMyMTksLTEuMDA3ODF6TTI0LjA4LDIwLjY0aDE3LjJ2NDEuMjhjMCw1LjY2MDM3IDQuNjU5NjMsMTAuMzIgMTAuMzIsMTAuMzJoNjUuMzZjNS42NjAzNywwIDEwLjMyLC00LjY1OTYzIDEwLjMyLC0xMC4zMnYtMzkuMTcwMzFsMjQuMDgsMjQuMDh2MTAxLjA5MDMxYzAsMS45MDc2MyAtMS41MzIzNywzLjQ0IC0zLjQ0LDMuNDRoLTE3LjJ2LTUxLjZjMCwtNS42NjAzNyAtNC42NTk2MywtMTAuMzIgLTEwLjMyLC0xMC4zMmgtNjguOGMtNS42NjAzNywwIC0xMC4zMiw0LjY1OTYzIC0xMC4zMiwxMC4zMnY1MS42aC0xNy4yYy0xLjkwNzY0LDAgLTMuNDQsLTEuNTMyMzcgLTMuNDQsLTMuNDR2LTEyMy44NGMwLC0xLjkwNzY0IDEuNTMyMzYsLTMuNDQgMy40NCwtMy40NHpNNDguMTYsMjAuNjRoNzIuMjR2NDEuMjhjMCwxLjkwNzYzIC0xLjUzMjM3LDMuNDQgLTMuNDQsMy40NGgtNjUuMzZjLTEuOTA3NjMsMCAtMy40NCwtMS41MzIzNyAtMy40NCwtMy40NHpNOTkuNzYsMjcuNTJjLTEuODk5NzgsMC4wMDAxOSAtMy40Mzk4MSwxLjU0MDIyIC0zLjQ0LDMuNDR2MjQuMDhjMC4wMDAxOSwxLjg5OTc4IDEuNTQwMjIsMy40Mzk4MSAzLjQ0LDMuNDRoMTAuMzJjMS44OTk3OCwtMC4wMDAxOSAzLjQzOTgxLC0xLjU0MDIyIDMuNDQsLTMuNDR2LTI0LjA4Yy0wLjAwMDE5LC0xLjg5OTc4IC0xLjU0MDIyLC0zLjQzOTgxIC0zLjQ0LC0zLjQ0ek0xMDMuMiwzNC40aDMuNDR2MTcuMmgtMy40NHpNNTEuNiw5Ni4zMmg2OC44YzEuOTA3NjMsMCAzLjQ0LDEuNTMyMzcgMy40NCwzLjQ0djUxLjZoLTc1LjY4di01MS42YzAsLTEuOTA3NjMgMS41MzIzNywtMy40NCAzLjQ0LC0zLjQ0ek0yNy41MiwxMzcuNnY2Ljg4aDYuODh2LTYuODh6TTEzNy42LDEzNy42djYuODhoNi44OHYtNi44OHoiPjwvcGF0aD48L2c+PC9nPjwvc3ZnPg=='
    }

    GetImgStartFlag(){
        return 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9IjAgMCAxNzIgMTcyIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtZGFzaGFycmF5PSIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBmb250LWZhbWlseT0ibm9uZSIgZm9udC13ZWlnaHQ9Im5vbmUiIGZvbnQtc2l6ZT0ibm9uZSIgdGV4dC1hbmNob3I9Im5vbmUiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMCwxNzJ2LTE3MmgxNzJ2MTcyeiIgZmlsbD0ibm9uZSI+PC9wYXRoPjxnIGZpbGw9IiMwMDAwMDAiPjxwYXRoIGQ9Ik0yOC42NjY2NywxNy4yYy0zLjE2NjMsMC4wMDAzMiAtNS43MzMwMiwyLjU2NzAzIC01LjczMzMzLDUuNzMzMzN2NzkuMzAzNjRjLTAuMTAyMzMsMC42MTkxNSAtMC4xMDIzMywxLjI1MDkgMCwxLjg3MDA1djQ0Ljk1OTY0Yy0wLjAyOTI0LDIuMDY3NjUgMS4wNTcwOSwzLjk5MDg3IDIuODQzLDUuMDMzMjJjMS43ODU5MiwxLjA0MjM2IDMuOTk0NzQsMS4wNDIzNiA1Ljc4MDY2LDBjMS43ODU5MiwtMS4wNDIzNiAyLjg3MjI1LC0yLjk2NTU4IDIuODQzLC01LjAzMzIydi00MC4xMzMzM2gxMDguOTMzMzNjMy4xNjYzLC0wLjAwMDMyIDUuNzMzMDIsLTIuNTY3MDMgNS43MzMzMywtNS43MzMzM3YtODAuMjY2NjdjLTAuMDAwMzIsLTMuMTY2MyAtMi41NjcwMywtNS43MzMwMiAtNS43MzMzMywtNS43MzMzM3pNMzQuNCwyOC42NjY2N2gxNy4ydjE3LjJoMTcuMnYtMTcuMmgxNy4ydjE3LjJoMTcuMnYtMTcuMmgxNy4ydjE3LjJoMTcuMnYxNy4yaC0xNy4ydjE3LjJoMTcuMnYxNy4yaC0xNy4ydi0xNy4yaC0xNy4ydjE3LjJoLTE3LjJ2LTE3LjJoLTE3LjJ2MTcuMmgtMTcuMnYtMTcuMmgtMTcuMnYtMTcuMmgxNy4ydi0xNy4yaC0xNy4yek01MS42LDYzLjA2NjY3djE3LjJoMTcuMnYtMTcuMnpNNjguOCw2My4wNjY2N2gxNy4ydi0xNy4yaC0xNy4yek04Niw2My4wNjY2N3YxNy4yaDE3LjJ2LTE3LjJ6TTEwMy4yLDYzLjA2NjY3aDE3LjJ2LTE3LjJoLTE3LjJ6Ij48L3BhdGg+PC9nPjwvZz48L3N2Zz4='
    }

    GetImgFollow(){
        return 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9IjAgMCAxNzIgMTcyIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtZGFzaGFycmF5PSIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBmb250LWZhbWlseT0ibm9uZSIgZm9udC13ZWlnaHQ9Im5vbmUiIGZvbnQtc2l6ZT0ibm9uZSIgdGV4dC1hbmNob3I9Im5vbmUiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMCwxNzJ2LTE3MmgxNzJ2MTcyeiIgZmlsbD0ibm9uZSI+PC9wYXRoPjxnIGZpbGw9IiMwMDAwMDAiPjxwYXRoIGQ9Ik0zMi4yNSwyMS41Yy01Ljg3ODkxLDAgLTEwLjc1LDQuODcxMDkgLTEwLjc1LDEwLjc1YzAsNS44Nzg5MSA0Ljg3MTA5LDEwLjc1IDEwLjc1LDEwLjc1YzUuODc4OTEsMCAxMC43NSwtNC44NzEwOSAxMC43NSwtMTAuNzVjMCwtNS44Nzg5MSAtNC44NzEwOSwtMTAuNzUgLTEwLjc1LC0xMC43NXpNNTMuNzUsMjYuODc1Yy0yLjk2MDQ1LDAgLTUuMzc1LDIuNDE0NTUgLTUuMzc1LDUuMzc1YzAsMi45NjA0NSAyLjQxNDU1LDUuMzc1IDUuMzc1LDUuMzc1YzIuOTYwNDUsMCA1LjM3NSwtMi40MTQ1NSA1LjM3NSwtNS4zNzVjMCwtMi45NjA0NSAtMi40MTQ1NSwtNS4zNzUgLTUuMzc1LC01LjM3NXpNNjkuODc1LDI2Ljg3NWMtMi45NjA0NSwwIC01LjM3NSwyLjQxNDU1IC01LjM3NSw1LjM3NWMwLDIuOTYwNDUgMi40MTQ1NSw1LjM3NSA1LjM3NSw1LjM3NWMyLjk2MDQ1LDAgNS4zNzUsLTIuNDE0NTUgNS4zNzUsLTUuMzc1YzAsLTIuOTYwNDUgLTIuNDE0NTUsLTUuMzc1IC01LjM3NSwtNS4zNzV6TTg2LDI2Ljg3NWMtMi45NjA0NSwwIC01LjM3NSwyLjQxNDU1IC01LjM3NSw1LjM3NWMwLDIuOTYwNDUgMi40MTQ1NSw1LjM3NSA1LjM3NSw1LjM3NWMyLjk2MDQ1LDAgNS4zNzUsLTIuNDE0NTUgNS4zNzUsLTUuMzc1YzAsLTIuOTYwNDUgLTIuNDE0NTUsLTUuMzc1IC01LjM3NSwtNS4zNzV6TTEwMi4xMjUsMjYuODc1Yy0yLjk2MDQ1LDAgLTUuMzc1LDIuNDE0NTUgLTUuMzc1LDUuMzc1YzAsMi45NjA0NSAyLjQxNDU1LDUuMzc1IDUuMzc1LDUuMzc1YzIuOTYwNDUsMCA1LjM3NSwtMi40MTQ1NSA1LjM3NSwtNS4zNzVjMCwtMi45NjA0NSAtMi40MTQ1NSwtNS4zNzUgLTUuMzc1LC01LjM3NXpNMTE4LjI1LDI2Ljg3NWMtMi45NjA0NSwwIC01LjM3NSwyLjQxNDU1IC01LjM3NSw1LjM3NWMwLDIuOTYwNDUgMi40MTQ1NSw1LjM3NSA1LjM3NSw1LjM3NWMyLjk2MDQ1LDAgNS4zNzUsLTIuNDE0NTUgNS4zNzUsLTUuMzc1YzAsLTIuOTYwNDUgLTIuNDE0NTUsLTUuMzc1IC01LjM3NSwtNS4zNzV6TTEzNC4zNzUsMjYuODc1Yy0yLjk2MDQ1LDAgLTUuMzc1LDIuNDE0NTUgLTUuMzc1LDUuMzc1YzAsMi45NjA0NSAyLjQxNDU1LDUuMzc1IDUuMzc1LDUuMzc1YzIuOTYwNDUsMCA1LjM3NSwtMi40MTQ1NSA1LjM3NSwtNS4zNzVjMCwtMi45NjA0NSAtMi40MTQ1NSwtNS4zNzUgLTUuMzc1LC01LjM3NXpNMTQ1LjEyNSwzNy42MjVjLTIuOTYwNDUsMCAtNS4zNzUsMi40MTQ1NSAtNS4zNzUsNS4zNzVjMCwyLjk2MDQ1IDIuNDE0NTUsNS4zNzUgNS4zNzUsNS4zNzVjMi45NjA0NSwwIDUuMzc1LC0yLjQxNDU1IDUuMzc1LC01LjM3NWMwLC0yLjk2MDQ1IC0yLjQxNDU1LC01LjM3NSAtNS4zNzUsLTUuMzc1ek04Niw1My43NWMtOC44ODEzNSwwIC0xNi4xMjUsNy4yNDM2NSAtMTYuMTI1LDE2LjEyNWMwLDYuNzE4NzUgOC42NzEzOSwyNC4xNDU1MSAxMS4zMzc4OSwyOS4zMzE1NGw0Ljc4NzExLDkuMzAxMjdsNC43ODcxMSwtOS4zMDEyN2MyLjY2NjUxLC01LjE4NjAzIDExLjMzNzg5LC0yMi42MTI3OSAxMS4zMzc4OSwtMjkuMzMxNTRjMCwtOC44ODEzNSAtNy4yNDM2NSwtMTYuMTI1IC0xNi4xMjUsLTE2LjEyNXpNMTQ1LjEyNSw1My43NWMtMi45NjA0NSwwIC01LjM3NSwyLjQxNDU1IC01LjM3NSw1LjM3NWMwLDIuOTYwNDUgMi40MTQ1NSw1LjM3NSA1LjM3NSw1LjM3NWMyLjk2MDQ1LDAgNS4zNzUsLTIuNDE0NTUgNS4zNzUsLTUuMzc1YzAsLTIuOTYwNDUgLTIuNDE0NTUsLTUuMzc1IC01LjM3NSwtNS4zNzV6TTg2LDY0LjVjMi45NjA0NSwwIDUuMzc1LDIuNDE0NTUgNS4zNzUsNS4zNzVjMCwyLjk2MDQ1IC0yLjQxNDU1LDUuMzc1IC01LjM3NSw1LjM3NWMtMi45NjA0NSwwIC01LjM3NSwtMi40MTQ1NSAtNS4zNzUsLTUuMzc1YzAsLTIuOTYwNDUgMi40MTQ1NSwtNS4zNzUgNS4zNzUsLTUuMzc1ek0xNDUuMTI1LDY5Ljg3NWMtMi45NjA0NSwwIC01LjM3NSwyLjQxNDU1IC01LjM3NSw1LjM3NWMwLDIuOTYwNDUgMi40MTQ1NSw1LjM3NSA1LjM3NSw1LjM3NWMyLjk2MDQ1LDAgNS4zNzUsLTIuNDE0NTUgNS4zNzUsLTUuMzc1YzAsLTIuOTYwNDUgLTIuNDE0NTUsLTUuMzc1IC01LjM3NSwtNS4zNzV6TTE0NS4xMjUsODZjLTIuOTYwNDUsMCAtNS4zNzUsMi40MTQ1NSAtNS4zNzUsNS4zNzVjMCwyLjk2MDQ1IDIuNDE0NTUsNS4zNzUgNS4zNzUsNS4zNzVjMi45NjA0NSwwIDUuMzc1LC0yLjQxNDU1IDUuMzc1LC01LjM3NWMwLC0yLjk2MDQ1IC0yLjQxNDU1LC01LjM3NSAtNS4zNzUsLTUuMzc1ek0zNy42MjUsOTYuNzVjLTIuOTYwNDUsMCAtNS4zNzUsMi40MTQ1NSAtNS4zNzUsNS4zNzVjMCwyLjk2MDQ1IDIuNDE0NTUsNS4zNzUgNS4zNzUsNS4zNzVjMi45NjA0NSwwIDUuMzc1LC0yLjQxNDU1IDUuMzc1LC01LjM3NWMwLC0yLjk2MDQ1IC0yLjQxNDU1LC01LjM3NSAtNS4zNzUsLTUuMzc1ek01My43NSw5Ni43NWMtMi45NjA0NSwwIC01LjM3NSwyLjQxNDU1IC01LjM3NSw1LjM3NWMwLDIuOTYwNDUgMi40MTQ1NSw1LjM3NSA1LjM3NSw1LjM3NWMyLjk2MDQ1LDAgNS4zNzUsLTIuNDE0NTUgNS4zNzUsLTUuMzc1YzAsLTIuOTYwNDUgLTIuNDE0NTUsLTUuMzc1IC01LjM3NSwtNS4zNzV6TTY5Ljg3NSw5Ni43NWMtMi45NjA0NSwwIC01LjM3NSwyLjQxNDU1IC01LjM3NSw1LjM3NWMwLDIuOTYwNDUgMi40MTQ1NSw1LjM3NSA1LjM3NSw1LjM3NWMyLjk2MDQ1LDAgNS4zNzUsLTIuNDE0NTUgNS4zNzUsLTUuMzc1YzAsLTIuOTYwNDUgLTIuNDE0NTUsLTUuMzc1IC01LjM3NSwtNS4zNzV6TTEwMi4xMjUsOTYuNzVjLTIuOTYwNDUsMCAtNS4zNzUsMi40MTQ1NSAtNS4zNzUsNS4zNzVjMCwyLjk2MDQ1IDIuNDE0NTUsNS4zNzUgNS4zNzUsNS4zNzVjMi45NjA0NSwwIDUuMzc1LC0yLjQxNDU1IDUuMzc1LC01LjM3NWMwLC0yLjk2MDQ1IC0yLjQxNDU1LC01LjM3NSAtNS4zNzUsLTUuMzc1ek0xMTguMjUsOTYuNzVjLTIuOTYwNDUsMCAtNS4zNzUsMi40MTQ1NSAtNS4zNzUsNS4zNzVjMCwyLjk2MDQ1IDIuNDE0NTUsNS4zNzUgNS4zNzUsNS4zNzVjMi45NjA0NSwwIDUuMzc1LC0yLjQxNDU1IDUuMzc1LC01LjM3NWMwLC0yLjk2MDQ1IC0yLjQxNDU1LC01LjM3NSAtNS4zNzUsLTUuMzc1ek0xMzQuMzc1LDk2Ljc1Yy0yLjk2MDQ1LDAgLTUuMzc1LDIuNDE0NTUgLTUuMzc1LDUuMzc1YzAsMi45NjA0NSAyLjQxNDU1LDUuMzc1IDUuMzc1LDUuMzc1YzIuOTYwNDUsMCA1LjM3NSwtMi40MTQ1NSA1LjM3NSwtNS4zNzVjMCwtMi45NjA0NSAtMi40MTQ1NSwtNS4zNzUgLTUuMzc1LC01LjM3NXpNMjYuODc1LDEwNy41Yy0yLjk2MDQ1LDAgLTUuMzc1LDIuNDE0NTUgLTUuMzc1LDUuMzc1YzAsMi45NjA0NSAyLjQxNDU1LDUuMzc1IDUuMzc1LDUuMzc1YzIuOTYwNDUsMCA1LjM3NSwtMi40MTQ1NSA1LjM3NSwtNS4zNzVjMCwtMi45NjA0NSAtMi40MTQ1NSwtNS4zNzUgLTUuMzc1LC01LjM3NXpNMjYuODc1LDEyMy42MjVjLTIuOTYwNDUsMCAtNS4zNzUsMi40MTQ1NSAtNS4zNzUsNS4zNzVjMCwyLjk2MDQ1IDIuNDE0NTUsNS4zNzUgNS4zNzUsNS4zNzVjMi45NjA0NSwwIDUuMzc1LC0yLjQxNDU1IDUuMzc1LC01LjM3NWMwLC0yLjk2MDQ1IC0yLjQxNDU1LC01LjM3NSAtNS4zNzUsLTUuMzc1ek0xMzkuNzUsMTI5Yy01Ljg3ODkxLDAgLTEwLjc1LDQuODcxMDkgLTEwLjc1LDEwLjc1YzAsNS44Nzg5MSA0Ljg3MTA5LDEwLjc1IDEwLjc1LDEwLjc1YzUuODc4OTEsMCAxMC43NSwtNC44NzEwOSAxMC43NSwtMTAuNzVjMCwtNS44Nzg5MSAtNC44NzEwOSwtMTAuNzUgLTEwLjc1LC0xMC43NXpNMzcuNjI1LDEzNC4zNzVjLTIuOTYwNDUsMCAtNS4zNzUsMi40MTQ1NSAtNS4zNzUsNS4zNzVjMCwyLjk2MDQ1IDIuNDE0NTUsNS4zNzUgNS4zNzUsNS4zNzVjMi45NjA0NSwwIDUuMzc1LC0yLjQxNDU1IDUuMzc1LC01LjM3NWMwLC0yLjk2MDQ1IC0yLjQxNDU1LC01LjM3NSAtNS4zNzUsLTUuMzc1ek01My43NSwxMzQuMzc1Yy0yLjk2MDQ1LDAgLTUuMzc1LDIuNDE0NTUgLTUuMzc1LDUuMzc1YzAsMi45NjA0NSAyLjQxNDU1LDUuMzc1IDUuMzc1LDUuMzc1YzIuOTYwNDUsMCA1LjM3NSwtMi40MTQ1NSA1LjM3NSwtNS4zNzVjMCwtMi45NjA0NSAtMi40MTQ1NSwtNS4zNzUgLTUuMzc1LC01LjM3NXpNNjkuODc1LDEzNC4zNzVjLTIuOTYwNDUsMCAtNS4zNzUsMi40MTQ1NSAtNS4zNzUsNS4zNzVjMCwyLjk2MDQ1IDIuNDE0NTUsNS4zNzUgNS4zNzUsNS4zNzVjMi45NjA0NSwwIDUuMzc1LC0yLjQxNDU1IDUuMzc1LC01LjM3NWMwLC0yLjk2MDQ1IC0yLjQxNDU1LC01LjM3NSAtNS4zNzUsLTUuMzc1ek04NiwxMzQuMzc1Yy0yLjk2MDQ1LDAgLTUuMzc1LDIuNDE0NTUgLTUuMzc1LDUuMzc1YzAsMi45NjA0NSAyLjQxNDU1LDUuMzc1IDUuMzc1LDUuMzc1YzIuOTYwNDUsMCA1LjM3NSwtMi40MTQ1NSA1LjM3NSwtNS4zNzVjMCwtMi45NjA0NSAtMi40MTQ1NSwtNS4zNzUgLTUuMzc1LC01LjM3NXpNMTAyLjEyNSwxMzQuMzc1Yy0yLjk2MDQ1LDAgLTUuMzc1LDIuNDE0NTUgLTUuMzc1LDUuMzc1YzAsMi45NjA0NSAyLjQxNDU1LDUuMzc1IDUuMzc1LDUuMzc1YzIuOTYwNDUsMCA1LjM3NSwtMi40MTQ1NSA1LjM3NSwtNS4zNzVjMCwtMi45NjA0NSAtMi40MTQ1NSwtNS4zNzUgLTUuMzc1LC01LjM3NXpNMTE4LjI1LDEzNC4zNzVjLTIuOTYwNDUsMCAtNS4zNzUsMi40MTQ1NSAtNS4zNzUsNS4zNzVjMCwyLjk2MDQ1IDIuNDE0NTUsNS4zNzUgNS4zNzUsNS4zNzVjMi45NjA0NSwwIDUuMzc1LC0yLjQxNDU1IDUuMzc1LC01LjM3NWMwLC0yLjk2MDQ1IC0yLjQxNDU1LC01LjM3NSAtNS4zNzUsLTUuMzc1eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+'
    }

    GetImgDownload(){
        return `data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9IjAgMCAxNzIgMTcyIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtZGFzaGFycmF5PSIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBmb250LWZhbWlseT0ibm9uZSIgZm9udC13ZWlnaHQ9Im5vbmUiIGZvbnQtc2l6ZT0ibm9uZSIgdGV4dC1hbmNob3I9Im5vbmUiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMCwxNzJ2LTE3MmgxNzJ2MTcyeiIgZmlsbD0ibm9uZSI+PC9wYXRoPjxnIGZpbGw9IiMwMDAwMDAiPjxwYXRoIGQ9Ik04NS44OTUwMiwyMS40MDIwMmMtMy45NTUyOCwwLjA1Nzk2IC03LjExNTc5LDMuMzA5MzEgLTcuMDYxNjksNy4yNjQ2NXY2OC42OTkyMmwtOS4yNjYyOCwtOS4yNjYyN2MtMS4zNTA5NywtMS4zODg3MyAtMy4yMDY2LC0yLjE3MTM3IC01LjE0NDA0LC0yLjE2OTZjLTIuOTE1MDEsMC4wMDM2MSAtNS41Mzc0NSwxLjc3MjMgLTYuNjMzMDMsNC40NzM1OWMtMS4wOTU1OCwyLjcwMTI5IC0wLjQ0NjAxLDUuNzk3MDIgMS42NDI5Niw3LjgzMDEybDIxLjUsMjEuNWMyLjc5ODgsMi43OTc2NCA3LjMzNTMxLDIuNzk3NjQgMTAuMTM0MTEsMGwyMS41LC0yMS41YzEuODcyMjMsLTEuNzk3NTIgMi42MjY0MSwtNC40NjY3NSAxLjk3MTY4LC02Ljk3ODI1Yy0wLjY1NDcyLC0yLjUxMTUgLTIuNjE2MDUsLTQuNDcyODIgLTUuMTI3NTUsLTUuMTI3NTVjLTIuNTExNSwtMC42NTQ3MiAtNS4xODA3MywwLjA5OTQ2IC02Ljk3ODI1LDEuOTcxNjhsLTkuMjY2MjgsOS4yNjYyN3YtNjguNjk5MjJjMC4wMjY0OCwtMS45MzU5MiAtMC43MzEzNiwtMy44MDAyMSAtMi4xMDEwNSwtNS4xNjg1OGMtMS4zNjk2OSwtMS4zNjgzNyAtMy4yMzQ3MSwtMi4xMjQ0MiAtNS4xNzA2LC0yLjA5NjA3ek00Myw2MC45MTY2N2MtMTEuNzg5MjgsMCAtMjEuNSw5LjcxMDcyIC0yMS41LDIxLjV2NDYuNTgzMzNjMCwxMS43ODkyOCA5LjcxMDcyLDIxLjUgMjEuNSwyMS41aDg2YzExLjc4OTI4LDAgMjEuNSwtOS43MTA3MiAyMS41LC0yMS41di00Ni41ODMzM2MwLC0xMS43ODkyOCAtOS43MTA3MiwtMjEuNSAtMjEuNSwtMjEuNWgtMTAuNzVjLTIuNTg0NTYsLTAuMDM2NTUgLTQuOTg4NTgsMS4zMjEzNiAtNi4yOTE1MywzLjU1Mzc2Yy0xLjMwMjk1LDIuMjMyNCAtMS4zMDI5NSw0Ljk5MzQyIDAsNy4yMjU4MmMxLjMwMjk1LDIuMjMyNCAzLjcwNjk3LDMuNTkwMzEgNi4yOTE1MywzLjU1Mzc2aDEwLjc1YzQuMDQxODksMCA3LjE2NjY3LDMuMTI0NzggNy4xNjY2Nyw3LjE2NjY3djQ2LjU4MzMzYzAsNC4wNDE4OSAtMy4xMjQ3OCw3LjE2NjY3IC03LjE2NjY3LDcuMTY2NjdoLTg2Yy00LjA0MTg5LDAgLTcuMTY2NjcsLTMuMTI0NzggLTcuMTY2NjcsLTcuMTY2Njd2LTQ2LjU4MzMzYzAsLTQuMDQxODkgMy4xMjQ3OCwtNy4xNjY2NyA3LjE2NjY3LC03LjE2NjY3aDEwLjc1YzIuNTg0NTYsMC4wMzY1NSA0Ljk4ODU4LC0xLjMyMTM2IDYuMjkxNTMsLTMuNTUzNzZjMS4zMDI5NSwtMi4yMzI0IDEuMzAyOTUsLTQuOTkzNDIgMCwtNy4yMjU4MmMtMS4zMDI5NSwtMi4yMzI0IC0zLjcwNjk3LC0zLjU5MDMxIC02LjI5MTUzLC0zLjU1Mzc2eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+`
    }

    GetSvgNoImageDiv(){
        const placeholder = document.createElement('div');
        placeholder.innerHTML = `<svg height="100%" style="fill-rule:nonzero;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="100%" xmlns:vectornator="http://vectornator.io" version="1.1" viewBox="0 0 600 338">
        <defs/>
        <g id="Calque 1" vectornator:layerName="Calque 1">
        <path stroke="#000000" stroke-width="16.2913" d="M453.71+47.4626L146.002+47.4626C138.998+47.4626+133.32+53.1061+133.32+60.0677L133.32+267.594C133.32+274.555+138.998+280.199+146.002+280.199L453.71+280.199C460.714+280.199+466.392+274.555+466.392+267.594L466.392+60.0677C466.392+53.1061+460.714+47.4626+453.71+47.4626Z" fill="none" stroke-linecap="round" opacity="1" stroke-linejoin="round"/>
        <path stroke="#000000" stroke-width="12.4893" d="M461.775+188.849L366.463+93.1774L190.475+273.794L263.076+195.579L214.735+148.177L139.611+222.243" fill="none" stroke-linecap="round" opacity="1" stroke-linejoin="round"/>
        <path stroke="#000000" stroke-width="21.8232" d="M448.863+320.404L150.639+19.1442" fill="none" stroke-linecap="round" opacity="1" stroke-linejoin="round"/>
        </g>
        </svg>`
        return placeholder.firstElementChild
    }

    GetSvgMesureDiv(){
        const placeholder = document.createElement('div');
        placeholder.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 172 172" width="80%" height="80%"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><g fill="#000000"><path d="M2.795,0c-1.63937,0.30906 -2.82187,1.76031 -2.795,3.44v40.205c-0.01344,1.74688 1.27656,3.225 3.01,3.44l98.5775,11.9325l-81.915,7.095c-0.14781,-0.01344 -0.28219,-0.01344 -0.43,0c-7.525,1.69313 -12.56406,5.22719 -15.48,9.1375c-2.91594,3.91031 -3.7625,8.00875 -3.7625,11.0725v2.6875c-0.01344,0.14781 -0.01344,0.28219 0,0.43v41.6025c0,0.1075 0,0.215 0,0.3225v2.795c0,3.19813 0.81969,7.45781 3.7625,11.395c2.94281,3.93719 7.94156,7.31 15.48,8.815c0.1075,0.04031 0.215,0.08063 0.3225,0.1075l148.565,17.5225c0.98094,0.12094 1.97531,-0.18812 2.71438,-0.84656c0.73906,-0.65844 1.16906,-1.59906 1.15562,-2.59344v-42.355c-0.04031,-1.70656 -1.31687,-3.1175 -3.01,-3.3325l-108.6825,-12.1475l91.6975,-7.8475c7.88781,-0.76594 13.23594,-4.39406 16.125,-8.6c2.88906,-4.20594 3.5475,-8.73437 3.5475,-11.7175v-43.1075c0.24188,-0.49719 0.34938,-1.06156 0.3225,-1.6125c0,-3.06375 -0.84656,-7.26969 -3.7625,-11.18c-2.91594,-3.91031 -7.955,-7.33687 -15.48,-9.03c-0.1075,-0.04031 -0.215,-0.08062 -0.3225,-0.1075l-148.565,-17.5225c-0.25531,-0.02687 -0.49719,-0.02687 -0.7525,0c-0.1075,0 -0.215,0 -0.3225,0zM6.88,7.31l10.32,1.1825v19.0275c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-18.1675l10.32,1.1825v8.7075c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-7.8475l10.32,1.1825v9.1375c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-8.2775l10.32,1.1825v19.4575c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-18.705l10.32,1.1825v9.5675c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-8.7075l10.32,1.1825v9.5675c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-8.7075l10.32,1.1825v19.995c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-19.135l10.32,1.1825v9.9975c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-9.1375l6.7725,0.7525l0.43,0.1075c1.15563,0.28219 2.15,0.61813 3.1175,0.9675v9.3525c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-5.0525c0.37625,0.38969 0.77938,0.79281 1.075,1.1825c1.51844,2.0425 2.08281,4.13875 2.2575,5.805c0,0.04031 0,0.06719 0,0.1075c-0.13437,0.34938 -0.20156,0.71219 -0.215,1.075c0,2.12313 -0.56437,6.38281 -2.4725,9.89c-1.90812,3.50719 -4.79719,6.39625 -10.965,6.9875l-16.6625,1.3975h-0.1075c-0.1075,0 -0.215,0 -0.3225,0l-127.3875,-15.48zM164.7975,55.1475v27.4125c0,1.84094 -0.52406,5.06594 -2.365,7.74c-1.84094,2.67406 -4.85094,5.09281 -11.0725,5.6975l-126.205,10.8575l-4.515,-0.5375c-5.95281,-1.19594 -9.17781,-4.12531 -11.18,-7.525c-2.00219,-3.39969 -2.58,-7.39062 -2.58,-9.3525c0,-0.1075 0,-0.215 0,-0.3225v-2.795c0,-1.74687 0.47031,-4.44781 2.365,-6.9875c1.49156,-2.00219 3.93719,-3.93719 7.955,-5.375v18.92c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-20.3175l10.32,-0.86v9.1375c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-9.7825l10.32,-0.86v8.9225c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-9.46l10.32,-0.86v18.92c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-19.565l10.32,-0.86v8.385c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-9.03l10.32,-0.86v8.17c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-8.7075l10.32,-0.86v18.1675c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-18.8125l10.32,-0.86v7.6325c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-8.2775l7.525,-0.645c0.9675,-0.09406 1.92156,-0.22844 2.795,-0.43v7.6325c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-10.32c0.02688,-0.215 0.02688,-0.43 0,-0.645c1.12875,-0.83312 2.19031,-1.72 3.1175,-2.6875zM6.88,105.8875c2.59344,2.80844 5.77813,5.32125 10.32,6.665v18.1675c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-16.8775l0.7525,-0.1075l9.5675,1.075v7.6325c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-6.88l10.32,1.1825v8.17c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-7.4175l10.32,1.075v18.705c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-17.845l10.32,1.075v8.815c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-8.0625l10.32,1.1825v8.9225c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-8.17l10.32,1.1825v19.4575c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-18.705l10.32,1.1825v9.5675c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-8.815l10.32,1.075v9.7825c-0.01344,1.23625 0.63156,2.39188 1.70656,3.02344c1.075,0.61813 2.39187,0.61813 3.46687,0c1.075,-0.63156 1.72,-1.78719 1.70656,-3.02344v-9.03l3.44,0.43v35.3675l-144.48,-17.0925c-6.22156,-1.24969 -9.51375,-3.61469 -11.395,-6.1275c-1.88125,-2.51281 -2.365,-5.34812 -2.365,-7.31v-2.58c0.01344,-0.17469 0.01344,-0.36281 0,-0.5375z"></path></g></g></svg>`
        return placeholder.firstElementChild
    }
    
    GetSvgElevationPlusDiv(){
        const placeholder = document.createElement('div');
        placeholder.innerHTML = `<svg viewBox="-50.314 -46.166 224.37 176.265" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com" width="100%" height="100%">
        <g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal" transform="matrix(1, 0, 0, 1, 0, -27.610161)">
          <path d="M0,172v-172h172v172z" fill="none"/>
          <g fill="#000000">
            <path d="M89.60125,23.81125l-25.54469,44.12875l-8.31781,14.37813l-4.86437,8.39844l-5.22719,-5.21375l-5.22719,-5.22719l-33.99687,64.20437h159.19406l-13.92125,-25.0475l-6.94719,-12.52375v0.01344l-6.7725,10.15875l-0.69875,-1.33031l-24.24125,-46.77594zM89.27875,38.10875l18.3825,35.475l-6.45,5.53625l-12.04,-10.32l-12.04,10.32l-7.75344,-6.62469z"/>
          </g>
        </g>
        <line style="stroke: rgb(0, 0, 0); stroke-width: 12px;" x1="-32.475" y1="89.832" x2="2.476" y2="37.733"/>
        <line style="stroke: rgb(0, 0, 0); stroke-width: 12px;" x1="17.434" y1="37.733" x2="46.131" y2="-5.868"/>
        <line style="stroke: rgb(0, 0, 0); stroke-width: 12px;" x1="-1.589" y1="32.253" x2="19.628" y2="45.661"/>
        <path d="M 347.506 96.207 L 365.667 132.724 L 329.344 132.724 L 347.506 96.207 Z" style="" transform="matrix(0.835834, 0.548982, -0.548982, 0.835834, -172.021835, -307.382843)" bx:shape="triangle 329.344 96.207 36.323 36.517 0.5 0 1@709d60e3"/>
      </svg>`
        return placeholder.firstElementChild
    }

    GetSvgElevationMoinsDiv(){
        const placeholder = document.createElement('div');
        placeholder.innerHTML = `<svg viewBox="-5.44 -37.637 224.37 167.736" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com" width="100%" height="100%">
        <g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal" transform="matrix(1, 0, 0, 1, 0, -27.610161)">
          <path d="M0,172v-172h172v172z" fill="none"/>
          <g fill="#000000">
            <path d="M89.60125,23.81125l-25.54469,44.12875l-8.31781,14.37813l-4.86437,8.39844l-5.22719,-5.21375l-5.22719,-5.22719l-33.99687,64.20437h159.19406l-13.92125,-25.0475l-6.94719,-12.52375v0.01344l-6.7725,10.15875l-0.69875,-1.33031l-24.24125,-46.77594zM89.27875,38.10875l18.3825,35.475l-6.45,5.53625l-12.04,-10.32l-12.04,10.32l-7.75344,-6.62469z"/>
          </g>
        </g>
        <g transform="matrix(1, 0, 0, -1, 138.130829, 69.955177)">
          <line style="stroke: rgb(0, 0, 0); stroke-width: 12px;" x1="-32.475" y1="89.832" x2="2.476" y2="37.733"/>
          <line style="stroke: rgb(0, 0, 0); stroke-width: 12px;" x1="17.434" y1="37.733" x2="46.131" y2="-5.868"/>
          <line style="stroke: rgb(0, 0, 0); stroke-width: 12px;" x1="-1.589" y1="32.253" x2="19.628" y2="45.661"/>
          <path d="M 347.506 96.207 L 365.667 132.724 L 329.344 132.724 L 347.506 96.207 Z" style="" transform="matrix(0.835834, 0.548982, -0.548982, 0.835834, -172.021835, -307.382843)" bx:shape="triangle 329.344 96.207 36.323 36.517 0.5 0 1@709d60e3"/>
        </g>
      </svg>`
        return placeholder.firstElementChild
    }

    GetSvgElevationMaxDiv(){
        const placeholder = document.createElement('div');
        placeholder.innerHTML = `<svg viewBox="-5.44 -37.637 224.37 167.736" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com" width="100%" height="100%">
        <g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal" transform="matrix(1, 0, 0, 1, 0, -27.610161)">
          <path d="M0,172v-172h172v172z" fill="none"/>
          <g fill="#000000">
            <path d="M89.60125,23.81125l-25.54469,44.12875l-8.31781,14.37813l-4.86437,8.39844l-5.22719,-5.21375l-5.22719,-5.22719l-33.99687,64.20437h159.19406l-13.92125,-25.0475l-6.94719,-12.52375v0.01344l-6.7725,10.15875l-0.69875,-1.33031l-24.24125,-46.77594zM89.27875,38.10875l18.3825,35.475l-6.45,5.53625l-12.04,-10.32l-12.04,10.32l-7.75344,-6.62469z"/>
          </g>
        </g>
        <path d="M 295.219 43.965 L 324.122 94.117 L 266.315 94.117 L 295.219 43.965 Z" style="" transform="matrix(-0.000085, -1, 1, -0.000085, 111.160553, 300.471008)" bx:shape="triangle 266.315 43.965 57.807 50.152 0.5 0 1@42ca4ae8"/>
      </svg>`
        return placeholder.firstElementChild
    }

    GetSvgElevationMinDiv(){
        const placeholder = document.createElement('div');
        placeholder.innerHTML = `<svg viewBox="-5.44 -37.637 224.37 167.736" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com" width="100%" height="100%">
        <g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal" transform="matrix(1, 0, 0, 1, 0, -27.610161)">
          <path d="M0,172v-172h172v172z" fill="none"/>
          <g fill="#000000">
            <path d="M89.60125,23.81125l-25.54469,44.12875l-8.31781,14.37813l-4.86437,8.39844l-5.22719,-5.21375l-5.22719,-5.22719l-33.99687,64.20437h159.19406l-13.92125,-25.0475l-6.94719,-12.52375v0.01344l-6.7725,10.15875l-0.69875,-1.33031l-24.24125,-46.77594zM89.27875,38.10875l18.3825,35.475l-6.45,5.53625l-12.04,-10.32l-12.04,10.32l-7.75344,-6.62469z"/>
          </g>
        </g>
        <path d="M 295.219 43.965 L 324.122 94.117 L 266.315 94.117 L 295.219 43.965 Z" style="" transform="matrix(-0.000085, -1, 1, -0.000085, 111.160553, 373.471008)" bx:shape="triangle 266.315 43.965 57.807 50.152 0.5 0 1@42ca4ae8"/>
      </svg>`
        return placeholder.firstElementChild
    }
}

customElements.define('geox-post', HtmlElemGeoxPost)