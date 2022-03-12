# Geox
Geox is Node.js application for gpx sharing

## Installation
First, install the package using npm:
```bash
npm install @gregvanko/geox --save
```

## Usage
Create a file "App.js" with this content:
```js
const Name = "MyAppName"
const Port = 9002
const Debug = false
const SplashScreenFilePath = __dirname + "/SplashScreen.html"
require('@gregvanko/geox').Start(Port, Name, Debug, SplashScreenFilePath)
```