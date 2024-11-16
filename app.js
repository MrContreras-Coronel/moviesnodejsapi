const express = require('express'); // commonjs => require
const app = express();
const crypto = require('node:crypto');
const mov = require('./movies.json');
const fs = require('fs');
const zod = require('zod');
/*

metodos complejos: put/patch/delete
CORS-preflight:
OPTIONS

*/

app.disable('x-powered-by');
app.use(express.json()); // middleware para  el POSt
app.use(express.urlencoded({extended : true}));

app.get('/', (req, res) => {
res.send('<h1>Hola mundo</h1>');
});

// First endpoint   /movies?genre=Action
app.get('/movies', (req,res)=> {
res.header('Access-Control-Allow-Origin', '*'); // que
// urls pueden consumir de la api
/*
app.options()
acces contro allow methods

*/


const { genre } = req.query;
if(genre){
const filterMov = mov.filter(
mov => mov.genre.some(x => x.toLowerCase() === genre.toLowerCase()));
res.json(filterMov);
return
}

res.json(mov)
});

//endpoint para agregar pelicula

app.post('/movies', (req, res) => {
const {
title,
year,
director,
duration,
poster,
rate
} = req.body; // que mantequilla en express.js


const newMov = {
id: crypto.randomUUID(),
title ,
year,
director,
duration,
rate: rate ?? 0,
poster
};

mov.push(newMov);

fs.writeFile('./movies.json', JSON.stringify(mov,null,2), 'utf-8', (err) => {
if(err){
console.log('Error escribiendo en el archivo de peliculas')
return res.status(500).json({message : 'failed'})
}
})



res.status(201).json(newMov); // actualiza la cache del cliente
});


// enpoint para recuperar una sola pelicula
app.get('/movies/:id',(req,res) => { //path-to-regex
const { id } = req.params;
const movie = mov.find(movi => movi.id === id);
if(movie) return res.json(movie);

res.status(404).json({'message': 'Movie not found'});
});

// enpoint para recuperar peliculas por genero


const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
console.log(`server listening on port: ${PORT}`)
});
