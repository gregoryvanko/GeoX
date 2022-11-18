# Geox
Geox is Node.js application for gpx sharing and visualisation

## Installation
First, install the package using npm:
```bash
npm install @gregvanko/geox --save
```

## Usage
Create a file "App.js" with this content:
```js
const Option = {
    Port:9002,
    Name:"GeoX",
    Debug: false,
    SplashScreenFilePath: __dirname + "/SplashScreen.html"
}
require('@gregvanko/geox').Start(Option)
```

It is possible to start the application with default values (Port=9000, Name=GeoX, Debug=false, SplashScreenFilePath= default splach screen):
```js
require('@gregvanko/geox').Start()
```

## Env variable
PORT and MONGOURL are available as env variables