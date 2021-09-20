class GeoxPost extends HTMLElement {
    constructor(Data = {_id: "no-id", Name: "No Name", Description:null, Date:null, Length:null, InfoElevation:null, Image:null}){
        super()
        this.Shadow = this.attachShadow({mode: "open"})

        this._Id = Data._id
        this._Name = Data.Name
        this._Description = Data.Description
        this._Date = Data.Date
        this._Length = Data.Length
        this._InfoElevation = Data.InfoElevation
        this._Image = Data.Image
    }

    set id(val){
        this.setAttribute("id", val)
    }

    connectedCallback(){
        this.Render()
    }

    Render(){
        this.id = this._Id
        
        let DivPost = document.createElement('div') 
        DivPost.setAttribute("id", this._Id)
        DivPost.classList.add("DivPost")
        // Add Info
        DivPost.appendChild(this.RenderPostsTitre(this._Name))
        // Add mesure
        DivPost.appendChild(this.RenderPostsMesure(this._Description, this._Date, this._Length, this._InfoElevation))
        // Add image
        DivPost.appendChild(this.RenderPostsMapImage(this._Image))
        
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
                border: 0.1rem solid black;
                border-radius: 1rem;
                margin-bottom: 1rem;
                box-shadow: 0.1rem 0.1rem  1rem black;
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
                padding: 0.4rem;
            }
            
            .PostDate{
                font-size: 0.8rem;
            }
            
            .PostDescription{
                margin-bottom: 0.4rem;
            }
            
            .PostDivImg{
                width: 100%;
                padding-left: 0.9rem;
                padding-right: 0.9rem;
                box-sizing: border-box;
            }
            
            .PostImg{
                border: 0.05rem solid black;
                width: 100%;
                border-radius: 0.2rem;
            }
            
            .FlexRowAr{
                display: flex; 
                flex-direction: row; 
                justify-content:space-around; 
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
                border: 0.05rem solid black;
                border-radius: 0.5rem;
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
        </style>
        `
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
        DivDate.innerText= this.GetDateString(PostDate)
        // Description
        let DivDescription = document.createElement('div') 
        Div.appendChild(DivDescription)
        DivDescription.classList.add("PostDescription")
        DivDescription.innerText= PsotDescription

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

    GetDateString(DateString){
        var Now = new Date(DateString)
        var dd = Now.getDate()
        var mm = Now.getMonth()+1
        var yyyy = Now.getFullYear()
        if(dd<10) {dd='0'+dd} 
        if(mm<10) {mm='0'+mm}
        return yyyy + "-" + mm + "-" + dd
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

customElements.define('geox-post', GeoxPost)