# Geox
Geox is Node.js application for gpx visualisation

## Usage
First, install the package using npm:
```bash
npm install @gregvanko/geox --save
```

## File App.js
Create a "App.js" file with this content:
```js
const Name = "MyAppName"
const Port = 9002
const Debug = false
const SplashScreenFilePath = __dirname + "/SplashScreen.html"
require('@gregvanko/geox').Start(Port, Name, Debug, SplashScreenFilePath)
```