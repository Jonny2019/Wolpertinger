# Wolpertinger
A library that fills in translations / localisations from JSON files and strings depending on the user's language preferences.

## Installation
You can add Wolpertinger to your Node project by running
`npm install wolpertinger`.

## Usage
To make Wolpertinger fill in translations from your sources use it like this:
```ts
// index.ts
import {Wolpertinger, BestMatch} from "wolpertinger";

document.addEventListener("DOMContentLoaded", () => {
    const wolpertinger: Wolpertinger<BestMatch> = new Wolpertinger<BestMatch>("../translations.json", undefined, BestMatch);
    wolpertinger.loadSources(true).then(success => {wolpertinger.translateAll("Not found").then(r => {})});
});
```
This example creates a new instance wit the translation strategy "BestMatch". The translations are loaded from the file "../translations.json".
We wait for the library to finish loading the sources and then let it fill in translations for all recognized keys.

Those keys can be linked to a html element by setting the attribute `data-translation` like this:
```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Wolpertinger example</title>
    <script src="./dist/bundle.js"></script>
</head>
<body>
    <div class="Wrapper">
        <h1 data-translation="hello"></h1>
        <p data-translation="long-text"></p>
    </div>
</body>
</html>
```

The JSON file could look like this:
```json
{
  "translations": [
    {
      "key": "hello",
      "values": [
        {
          "lang": "en",
          "value": "Hello"
        },
        {
          "lang": "de",
          "value": "Hallo"
        },
        {
          "lang": "fr",
          "value": "Bonjour"
        }
      ]
    },
    {
      "key": "long-text",
      "values": [
        {
          "lang": "en",
          "value": "This text is written in English."
        },
        {
          "lang": "de",
          "value": "Dieser Text ist auf Deutsch."
        }
      ]
    }
  ]
}
```