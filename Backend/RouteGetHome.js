function CallRouteGetHome(req, res, MyApp){
    //let path = require('path');
    //let reqPath = path.join(__dirname, '../Frontend/HomePage/HomePage.html')
    //res.sendFile(reqPath);
    res.send(GetHtmlHomePage(MyApp.AppName))
}


function GetHtmlHomePage (Titre){
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'/>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="GeoX">
    <link rel="apple-touch-icon" href="apple-icon.png">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${Titre}</title>
    <style>${GetCSSHomePAge()}</style>
    <script defer>${GetJSHomePAge()}</script>
    </head>
    <body>
        <div style="height: 1rem;"></div>
    </body>
    </html>
    `
}

function GetCSSHomePAge(){
    let fs = require('fs')
    let path = require('path');
    let reqPath = path.join(__dirname, '../Frontend/HomePage/HomePage.css')
    return fs.readFileSync(reqPath, 'utf8')
}

function GetJSHomePAge(){
    let fs = require('fs')
    let path = require('path');
    let reqPath = path.join(__dirname, '../Frontend/HomePage/HomePage.js')
    return fs.readFileSync(reqPath, 'utf8')
}

module.exports.CallRouteGetHome = CallRouteGetHome