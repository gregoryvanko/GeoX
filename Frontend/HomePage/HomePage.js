class HomePage{
    constructor(){
        this._IdDivApp = "divapp"
        this._PageOfPosts = 0
        let me = this
        this._Observer = new IntersectionObserver((entries)=>{
            entries.forEach(function (obersable){
                if (obersable.intersectionRatio > 0.5){
                    me._PageOfPosts ++
                    me.GetPosts()
                    me._Observer.unobserve(obersable.target)
                }
            })
        }, {threshold: [1]})
    }

    Start(){
        // Add SVG
        document.body.appendChild(this.GetSvgGeoX())
        // Add button Lunch app
        document.body.appendChild(this.GetButtonLunchApp())
        // Add div app
        document.body.appendChild(this.GetDivApp())
        // Get Posts
        this.GetPosts()

    }

    

    GetButtonLunchApp(){
        let button = document.createElement('button')
        button.innerText = "Open App"
        button.classList.add("OpenButton");
        button.onclick = this.OpenApp.bind(this)
        return button
    }

    OpenApp(){
        location.href="/App"
    }

    GetDivApp(){
        let divapp = document.createElement('div')
        divapp.id = this._IdDivApp
        divapp.classList.add("DivApp")
        return divapp
    }

    GetPosts(){
        fetch("/getpageofpost/" + this._PageOfPosts).then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("get posts failed: " + response.status + " " + response.statusText);
            }
        })
        .then((responseJson) => {
            if (responseJson.Error){
                document.getElementById(this._IdDivApp).appendChild(this.GetDivError(responseJson.ErrorMsg))
            } else {
                this.RenderPosts(responseJson.Data, this._IdDivApp)
            }
        })
        .catch((error) => {
            document.getElementById(this._IdDivApp).appendChild(this.GetDivError(error))
        });
    }

    GetDivError(MyError){
        let diverror = document.createElement('div')
        diverror.innerText = MyError
        diverror.style.color = "red"
        diverror.style.margin = "2rem"
        return diverror
    }

    RenderPosts (Data, DivId){
        if (Data.length != 0){
            let MiddlepointData = Math.ceil(Data.length / 2)-1
            let CurrentpointData = 0
            Data.forEach(element => {
                let DivPost = document.createElement('div') 
                DivPost.setAttribute("id", element._id)
                DivPost.classList.add("DivPost")
                // Add Info
                DivPost.appendChild(this.RenderPostsTitre(element.Name))
                // Add mesure
                DivPost.appendChild(this.RenderPostsMesure(element.Description, element.Date, element.Length, element.InfoElevation))
                // Add image
                DivPost.appendChild(this.RenderPostsMapImage(element.Image))
                document.getElementById(DivId).appendChild(DivPost)
                // si l'element est l'element milieu
                if (CurrentpointData == MiddlepointData){
                    // ajouter le listener pour declancher le GetPosts
                    this._Observer.observe(DivPost)
                }
                CurrentpointData ++
            });
        } else {
            document.getElementById(DivId).appendChild(this.GetDivError("End of posts"))
        }
        
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

    GetSvgGeoX(){
        const placeholder = document.createElement('div');
        placeholder.innerHTML = `<svg style="fill-rule:nonzero;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" height="4rem" xmlns:vectornator="http://vectornator.io" version="1.1" viewBox="0 0 518.076 165.03">
        <defs/>
        <g id="Untitled" vectornator:layerName="Untitled">
        <path stroke="#ffffff" stroke-width="1" d="M330.468+148.775C353.57+73.273+526.881-6.891+511.338+3.708C466.21+34.481+366.393+112.65+359.685+148.775L330.468+148.775Z" fill="#000000" stroke-linecap="butt" opacity="1" stroke-linejoin="miter"/>
        <path stroke="#ffffff" stroke-width="1" d="M392.6+112.626L409.683+99.018L446.121+148.527L417.339+148.775L392.6+112.626Z" fill="#000000" stroke-linecap="butt" opacity="1" stroke-linejoin="miter"/>
        <path stroke="#ffffff" stroke-width="1" d="M366.25+82.432L385.752+68.734L362.891+39.603L334.109+39.603L366.25+82.432Z" fill="#000000" stroke-linecap="butt" opacity="1" stroke-linejoin="miter"/>
        <path stroke="#ffffff" stroke-width="1.24341" d="M229.557+133.388L229.328+141.893C227.129+142.491+224.889+143+222.607+143.421C220.316+143.842+217.817+144.222+215.11+144.562C212.402+144.902+209.627+145.071+206.785+145.071C202.339+145.071+198.362+144.481+194.858+143.3C191.345+142.111+188.51+140.203+186.355+137.574C184.2+134.953+182.846+131.548+182.295+127.358C181.751+123.169+182.278+118.025+183.873+111.926C185.315+106.427+187.382+101.578+190.072+97.3798C192.771+93.1905+195.889+89.6795+199.428+86.849C202.966+84.0101+206.81+81.8712+210.96+80.4311C215.118+78.991+219.416+78.2716+223.854+78.2716C228.207+78.2716+231.772+79.076+234.546+80.6859C237.321+82.2958+239.396+84.4748+240.771+87.2251C242.137+89.9755+242.849+93.1905+242.909+96.8702C242.969+100.558+242.464+104.432+241.394+108.493L237.932+114.086L194.896+114.086C194.209+116.706+193.878+119.331+193.903+121.96C193.929+124.58+194.531+126.95+195.711+129.069C196.891+131.189+198.706+132.903+201.159+134.213C203.612+135.523+206.925+136.178+211.1+136.178C213.764+136.178+216.246+136.033+218.546+135.742C220.846+135.442+222.865+135.102+224.605+134.723C226.353+134.343+228.004+133.898+229.557+133.388ZM197.429+105.957L231.008+105.957C231.161+105.366+231.368+104.052+231.632+102.014C231.895+99.9846+231.826+97.8687+231.428+95.6691C231.029+93.4696+230.031+91.4993+228.437+89.7608C226.849+88.0295+224.367+87.1645+220.99+87.1645C217.265+87.1645+214.006+87.9046+211.215+89.3847C208.431+90.8648+206.063+92.6203+204.112+94.65C202.161+96.6882+200.641+98.7628+199.555+100.874C198.469+102.993+197.76+104.687+197.429+105.957ZM267.103+111.793C264.955+120.01+265.286+126.129+268.096+130.149C270.912+134.168+275.606+136.178+282.174+136.178C288.665+136.178+294.253+134.189+298.937+130.209C303.613+126.23+306.995+120.261+309.082+112.302C311.297+103.843+311.012+97.5375+308.229+93.3883C305.455+89.2391+300.736+87.1645+294.075+87.1645C287.413+87.1645+281.787+89.2148+277.197+93.3155C272.614+97.4247+269.249+103.583+267.103+111.793ZM255.812+111.671C257.493+105.233+259.957+99.879+263.208+95.6085C266.466+91.3295+270.072+87.9009+274.027+85.3204C277.99+82.7399+281.999+80.9201+286.056+79.8609C290.104+78.8018+293.815+78.2716+297.194+78.2716C300.392+78.2716+303.753+78.7569+307.275+79.7275C310.796+80.7065+313.83+82.4414+316.376+84.9322C318.913+87.4314+320.704+90.7762+321.747+94.9655C322.782+99.1632+322.455+104.477+320.767+110.907C319.018+117.596+316.481+123.14+313.155+127.54C309.828+131.948+306.184+135.442+302.221+138.023C298.258+140.603+294.228+142.423+290.129+143.482C286.03+144.541+282.339+145.071+279.055+145.071C275.677+145.071+272.258+144.562+268.796+143.543C265.333+142.532+262.35+140.777+259.847+138.277C257.344+135.778+255.613+132.369+254.654+128.05C253.703+123.739+254.089+118.28+255.812+111.671Z" fill="#000000" stroke-linecap="butt" opacity="1" stroke-linejoin="miter"/>
        <path stroke="#ffffff" stroke-width="1.24341" d="M169.052+56.5671L164.495+66.6611C160.668+65.8689+156.578+65.1239+152.225+64.4288C147.872+63.7336+142.742+63.2968+136.836+63.1185C130.76+63.2071+125.307+64.0806+120.479+65.7391C115.642+67.3975+111.42+69.7754+107.814+72.8728C104.216+75.9786+101.17+79.6704+98.675+83.9494C96.1802+88.2285+94.2581+92.943+92.9089+98.0956C91.1689+104.736+90.5795+110.413+91.1396+115.129C91.6907+119.845+93.1507+123.707+95.5183+126.715C97.8947+129.733+101.008+131.941+104.861+133.34C108.705+134.731+113.059+135.426+117.921+135.426C121.036+135.426+123.895+135.253+126.5+134.905C129.113+134.556+131.422+134.144+133.425+133.667C135.427+133.182+137.29+132.636+139.012+132.029L145.275+108.056L128.104+108.056L130.675+98.229L159.531+98.229L149.285+137.392C145.551+139.406+140.654+141.217+134.596+142.827C128.546+144.444+122.138+145.208+115.375+145.12C109.147+145.12+103.35+144.425+97.9877+143.033C92.625+141.634+88.1865+139.167+84.6734+135.633C81.1513+132.09+78.8601+127.261+77.7998+121.147C76.7472+115.041+77.4434+107.312+79.8873+97.9621C81.873+90.3674+84.8388+83.7517+88.7848+78.1139C92.7307+72.4845+97.3219+67.8136+102.557+64.1012C107.785+60.3888+113.462+57.5947+119.588+55.7179C125.715+53.841+131.939+52.9032+138.261+52.9032C142.386+52.9032+146.323+53.0973+150.074+53.4855C153.816+53.8823+157.227+54.319+160.308+54.7958C163.388+55.2811+166.303+55.872+169.052+56.5671Z" fill="#000000" stroke-linecap="butt" opacity="1" stroke-linejoin="miter"/>
        </g>
        </svg>`
        return placeholder.firstElementChild
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
        placeholder.innerHTML = `<svg viewBox="-50.314 -46.166 224.37 176.265" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com">
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
        placeholder.innerHTML = `<svg viewBox="-5.44 -37.637 224.37 167.736" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com">
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
        placeholder.innerHTML = `<svg viewBox="-5.44 -37.637 224.37 167.736" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com">
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
        placeholder.innerHTML = `<svg viewBox="-5.44 -37.637 224.37 167.736" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com">
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


window.onload = function () {
    let MyApp = new HomePage()
    MyApp.Start()
}