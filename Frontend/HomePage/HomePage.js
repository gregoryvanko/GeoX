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
                this.RenderPosts(responseJson.Data)
            }
        })
        .catch((error) => {
            let divapp = document.getElementById(this._IdDivApp)
            divapp.innerHTML = ""
            divapp.appendChild(this.GetDivError(error))
        });
    }

    GetDivError(MyError){
        let diverror = document.createElement('div')
        diverror.innerText = MyError
        diverror.style.color = "red"
        diverror.style.margin = "2rem"
        return diverror
    }

    RenderPosts (Data){
        if (Data.length != 0){
            let MiddlepointData = Math.ceil(Data.length / 2)-1
            let CurrentpointData = 0
            Data.forEach(element => {
                // Creation du post
                let TempGeoxPsot = new GeoxPost(element)
                TempGeoxPsot.addEventListener("click", this.GetTrackData.bind(this, element._id))
                TempGeoxPsot.style.cursor = "pointer"
                TempGeoxPsot.style.width = "100%"
                document.getElementById(this._IdDivApp).appendChild(TempGeoxPsot)
                // si l'element est l'element milieu
                if (CurrentpointData == MiddlepointData){
                    // ajouter le listener pour declancher le GetPosts
                    this._Observer.observe(TempGeoxPsot)
                }
                CurrentpointData ++
            });
        } else {
            document.getElementById(this._IdDivApp).appendChild(this.GetDivError("End of posts"))
        }
    }

    GetSvgGeoX(){
        let placeholder = document.createElement('div')
        placeholder.style.height = "4rem"
        placeholder.innerHTML = `<svg style="fill-rule:nonzero;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" height="100%" xmlns:vectornator="http://vectornator.io" version="1.1" viewBox="0 0 518.076 165.03">
        <defs/>
        <g id="Untitled" vectornator:layerName="Untitled">
        <path stroke="#ffffff" stroke-width="1" d="M330.468+148.775C353.57+73.273+526.881-6.891+511.338+3.708C466.21+34.481+366.393+112.65+359.685+148.775L330.468+148.775Z" fill="#000000" stroke-linecap="butt" opacity="1" stroke-linejoin="miter"/>
        <path stroke="#ffffff" stroke-width="1" d="M392.6+112.626L409.683+99.018L446.121+148.527L417.339+148.775L392.6+112.626Z" fill="#000000" stroke-linecap="butt" opacity="1" stroke-linejoin="miter"/>
        <path stroke="#ffffff" stroke-width="1" d="M366.25+82.432L385.752+68.734L362.891+39.603L334.109+39.603L366.25+82.432Z" fill="#000000" stroke-linecap="butt" opacity="1" stroke-linejoin="miter"/>
        <path stroke="#ffffff" stroke-width="1.24341" d="M229.557+133.388L229.328+141.893C227.129+142.491+224.889+143+222.607+143.421C220.316+143.842+217.817+144.222+215.11+144.562C212.402+144.902+209.627+145.071+206.785+145.071C202.339+145.071+198.362+144.481+194.858+143.3C191.345+142.111+188.51+140.203+186.355+137.574C184.2+134.953+182.846+131.548+182.295+127.358C181.751+123.169+182.278+118.025+183.873+111.926C185.315+106.427+187.382+101.578+190.072+97.3798C192.771+93.1905+195.889+89.6795+199.428+86.849C202.966+84.0101+206.81+81.8712+210.96+80.4311C215.118+78.991+219.416+78.2716+223.854+78.2716C228.207+78.2716+231.772+79.076+234.546+80.6859C237.321+82.2958+239.396+84.4748+240.771+87.2251C242.137+89.9755+242.849+93.1905+242.909+96.8702C242.969+100.558+242.464+104.432+241.394+108.493L237.932+114.086L194.896+114.086C194.209+116.706+193.878+119.331+193.903+121.96C193.929+124.58+194.531+126.95+195.711+129.069C196.891+131.189+198.706+132.903+201.159+134.213C203.612+135.523+206.925+136.178+211.1+136.178C213.764+136.178+216.246+136.033+218.546+135.742C220.846+135.442+222.865+135.102+224.605+134.723C226.353+134.343+228.004+133.898+229.557+133.388ZM197.429+105.957L231.008+105.957C231.161+105.366+231.368+104.052+231.632+102.014C231.895+99.9846+231.826+97.8687+231.428+95.6691C231.029+93.4696+230.031+91.4993+228.437+89.7608C226.849+88.0295+224.367+87.1645+220.99+87.1645C217.265+87.1645+214.006+87.9046+211.215+89.3847C208.431+90.8648+206.063+92.6203+204.112+94.65C202.161+96.6882+200.641+98.7628+199.555+100.874C198.469+102.993+197.76+104.687+197.429+105.957ZM267.103+111.793C264.955+120.01+265.286+126.129+268.096+130.149C270.912+134.168+275.606+136.178+282.174+136.178C288.665+136.178+294.253+134.189+298.937+130.209C303.613+126.23+306.995+120.261+309.082+112.302C311.297+103.843+311.012+97.5375+308.229+93.3883C305.455+89.2391+300.736+87.1645+294.075+87.1645C287.413+87.1645+281.787+89.2148+277.197+93.3155C272.614+97.4247+269.249+103.583+267.103+111.793ZM255.812+111.671C257.493+105.233+259.957+99.879+263.208+95.6085C266.466+91.3295+270.072+87.9009+274.027+85.3204C277.99+82.7399+281.999+80.9201+286.056+79.8609C290.104+78.8018+293.815+78.2716+297.194+78.2716C300.392+78.2716+303.753+78.7569+307.275+79.7275C310.796+80.7065+313.83+82.4414+316.376+84.9322C318.913+87.4314+320.704+90.7762+321.747+94.9655C322.782+99.1632+322.455+104.477+320.767+110.907C319.018+117.596+316.481+123.14+313.155+127.54C309.828+131.948+306.184+135.442+302.221+138.023C298.258+140.603+294.228+142.423+290.129+143.482C286.03+144.541+282.339+145.071+279.055+145.071C275.677+145.071+272.258+144.562+268.796+143.543C265.333+142.532+262.35+140.777+259.847+138.277C257.344+135.778+255.613+132.369+254.654+128.05C253.703+123.739+254.089+118.28+255.812+111.671Z" fill="#000000" stroke-linecap="butt" opacity="1" stroke-linejoin="miter"/>
        <path stroke="#ffffff" stroke-width="1.24341" d="M169.052+56.5671L164.495+66.6611C160.668+65.8689+156.578+65.1239+152.225+64.4288C147.872+63.7336+142.742+63.2968+136.836+63.1185C130.76+63.2071+125.307+64.0806+120.479+65.7391C115.642+67.3975+111.42+69.7754+107.814+72.8728C104.216+75.9786+101.17+79.6704+98.675+83.9494C96.1802+88.2285+94.2581+92.943+92.9089+98.0956C91.1689+104.736+90.5795+110.413+91.1396+115.129C91.6907+119.845+93.1507+123.707+95.5183+126.715C97.8947+129.733+101.008+131.941+104.861+133.34C108.705+134.731+113.059+135.426+117.921+135.426C121.036+135.426+123.895+135.253+126.5+134.905C129.113+134.556+131.422+134.144+133.425+133.667C135.427+133.182+137.29+132.636+139.012+132.029L145.275+108.056L128.104+108.056L130.675+98.229L159.531+98.229L149.285+137.392C145.551+139.406+140.654+141.217+134.596+142.827C128.546+144.444+122.138+145.208+115.375+145.12C109.147+145.12+103.35+144.425+97.9877+143.033C92.625+141.634+88.1865+139.167+84.6734+135.633C81.1513+132.09+78.8601+127.261+77.7998+121.147C76.7472+115.041+77.4434+107.312+79.8873+97.9621C81.873+90.3674+84.8388+83.7517+88.7848+78.1139C92.7307+72.4845+97.3219+67.8136+102.557+64.1012C107.785+60.3888+113.462+57.5947+119.588+55.7179C125.715+53.841+131.939+52.9032+138.261+52.9032C142.386+52.9032+146.323+53.0973+150.074+53.4855C153.816+53.8823+157.227+54.319+160.308+54.7958C163.388+55.2811+166.303+55.872+169.052+56.5671Z" fill="#000000" stroke-linecap="butt" opacity="1" stroke-linejoin="miter"/>
        </g>
        </svg>`
        return placeholder
    }

    GetTrackData(Id){
        //blur app
        let divApp = document.getElementById(this._IdDivApp)
        divApp.style.filter = "blur(2px)"

        // Add Bleur
        let divbleur = document.createElement('div')
        divbleur.id = "Divbleur"
        divbleur.classList.add("Divbleur")
        document.body.appendChild(divbleur)

        // Add backgound
        let divbackground = document.createElement('div')
        divbackground.id = "DivBackground"
        divbackground.classList.add("DivBackground")
        divbleur.appendChild(divbackground)
        // Close button
        let button = document.createElement('button')
        button.innerText = "Close"
        button.classList.add("CloseButton");
        button.onclick = this.RemoveTrackData.bind(this)
        divbackground.appendChild(button)
        // Text
        let divwaiting = document.createElement('div')
        divwaiting.id = "DivWaiting"
        divwaiting.innerText = "Waiting data..."
        divwaiting.style.textAlign = "center"
        divwaiting.style.marginTop = "5vh"
        divbackground.appendChild(divwaiting)

        // fetch
        fetch("/getdataofpost/" + Id).then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("get track of posts failed: " + response.status + " " + response.statusText);
            }
        })
        .then((responseJson) => {
            if (responseJson.Error){
                document.getElementById(this._IdDivApp).appendChild(this.GetDivError(responseJson.ErrorMsg))
            } else {
                this.RenderTrackData(responseJson.Data)
            }
        })
        .catch((error) => {
            let divapp = document.getElementById(this._IdDivApp)
            divapp.innerHTML = ""
            divapp.appendChild(this.GetDivError(error))
        });
    }

    RenderTrackData(Data){
        let divbackground = document.getElementById("DivBackground")
        divbackground.removeChild(document.getElementById("DivWaiting"))
        // Add InfoOnTrack
        let DivData = document.createElement('div')
        DivData.id = "DivData"
        DivData.classList.add("DivDataTrack")
        divbackground.appendChild(DivData)
        let InfoTrackView = new InfoOnTrack(Data, "DivData")
        // Bloc le scroll
        document.body.style.overflow='hidden'
        
    }

    RemoveTrackData(){
        event.stopPropagation()
        //blur app
        let divApp = document.getElementById(this._IdDivApp)
        divApp.style.filter = "none"
        // Remove
        document.body.removeChild(document.getElementById("Divbleur"))
        document.body.style.overflow='auto'
    }
}

window.onload = function () {
    let MyApp = new HomePage()
    MyApp.Start()
}