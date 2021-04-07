const express = require('express')
const path = require('path')
const members = require('./public/js/members')
var cors = require('cors')  

const app = express();
const PORT = process.env.PORT || 3000;
// The process object is a global that provides information about, and control over, the current Node.js process. 
// As a global, it is always available to Node.js applications without using require()

app.use(cors());
//Use this library to handle JSON
app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))

//Get All members
app.get('/api/members', (req, res)=>{ //if an user hits http://localhost:3000/api/members
    if('sortby' in req.query){
        if(req.query.sortby === "name"){
            res.json(sortBy(members, 'name'));
        }else if(req.query.sortby === "id"){
            res.json(sortBy(members, 'id'));
        }else{
            res.json(members);
        }
    }else{
        res.json(members);
    }
});

//if we want to choose by id
//http://localhost:3000/api/members/1 it's a parameter 
//http://localhost:3000/api/members/1?sortBy=name - after ? is query string parameter
// so req.query
app.get('/api/members/:id', (req, res)=>{
    console.log('req.query:', req.query) //Actually we may have query if user hits ...
    //http://localhost:3000/api/members/1?name=oleg  so req.query: { name: 'oleg' }
    let foundMember = members.filter(member => member.id === parseInt(req.params.id));
    if(foundMember.length > 0){
        res.json(foundMember);
    }else{
        res.status(404).json({msg: `There's no member with id=${req.params.id}`});
    }
});

//Get by id and name
//Example of url: http://127.0.0.1:3000/api/members/2/Oleg
app.get('/api/members/:id/:name', (req, res)=>{
    const member = members.filter(member => member.id === parseInt(req.params.id)
        && member.name === req.params.name
    );
    if(member.length > 0){
        res.json(member);
    }else{
        res.status(404).json({msg: `There's no member with id=${req.params.id} and name=${req.params.name}`});
    }
    res.send(req.params.name);
});

//POST
// curl -H "Content-Type: application/json" -d "{\"name\": \"Name\"}" localhost:3000/api/members -XPOST
app.post('/api/members', (req, res)=>{
    //Actually here should be a validation of the user input
    if(!req.body.name || req.body.name.length < 3){

        //400 is Bad request
        res.status(400).json({msg: 'Name should be longer than 3 characters...'});
        return;
    }
    //Find id for a new member
    let id = members.length + 1
    while(members.find(member => member.id === id)){
        id += 1
    }

    const member = {id: id, name: req.body.name};
    members.push(member);
    //it's a convention if we add a new object, we should return this object in response
    //The idea is that by adding a new object, we creat ID for this object and it could be needed
    //for the client
    res.json(member);
});

//PUT - update 
app.put('/api/members/:id', (req, res)=>{
    const member = members.find(member => member.id === parseInt(req.params.id));
    if(member){
        //Actually here should be a validation of the user input
        if(!req.body.name || req.body.name.length < 3){
            //400 is Bad request
            res.status(400).json({msg: 'Name should be longer than 3 characters'});
            return;
        }
        member.name = req.body.name;
        res.json(member);
    }else{
        res.status(404).json({msg: `There's no member with id=${req.params.id}`});
    }
});

//Delete
app.delete('/api/members/:id', (req, res)=>{
    const member = members.find(member => member.id === parseInt(req.params.id));
    if(member){
        let index = members.indexOf(member);
        members.splice(index, 1);
        res.json(member);
    }else{
        res.status(404).json({msg: `There's no member with id=${req.params.id}`});
    }
});

app.listen(PORT, ()=>{
    console.log(`Server listens port ${PORT}`);
});

function sortBy(jsonObject, key){
    if(key === 'name'){
        return jsonObject.sort((a, b)=>{
            return a[key].localeCompare(b[key]);
        });
    }else{
        return jsonObject.sort((a, b)=>{
            return a[key] - b[key];
        });
    }
}


