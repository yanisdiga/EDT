const express = require('express');
const path = require('path');

const app = express();

module.exports = {
  entry: './public/js/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/dist')
  }
};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Utiliser express.static pour servir les fichiers statiques
app.use(express.static('public'));

// Servir 'ical.js' depuis 'node_modules'
app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.use('/public/name', express.static(__dirname + '/public/name'));

// Lancer le serveur sur le port 3000
/*app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});*/

module.exports = app;