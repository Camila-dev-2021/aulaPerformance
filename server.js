const express = require('express');
const res = require('express/lib/response');
const app = express()
const redis = require("redis");
const host = "127.0.0.1"
const port = 6379; 
const clientRedis = redis.createClient(port, host, redis)///default redis port

app.use(express.json())


let clientes = [{
    "nome" : "Camila Xavier"
},
{
    "nome" : "Aluno 1"
}
];


//Simulando oproblema
const getAllClients = ()=> {
    const time = Math.random() * 8000;
    return new Promise((resolve) =>{
        setTimeout(() => {
            resolve(clientes)
        },time)
    });
};

app.post("/", async(req,res)=>{
    //slavar infos
    //console.log("salvar infos", req.body);

    clientes.push(req.body)

    await clientRedis.del("clientes");
    res.status(200).send("Removido com sucesso")
})


app.get("/", async(req, res)=>{

    //criando um cache  
    const chave = "clientes"
    try{
        const clientesFromCache = await clientRedis.get(chave);
        if(clientesFromCache){
            res.status(200).send(JSON.parse(clientesFromCache))
            return
        }

        clientRedis.set("clientes",  JSON.stringify(clientes), "EX", 20);

       // clientRedis.set("clientes", clientes);
        res.status(200).send(clientes);
    }catch(e){
        res.status(500).send();

    }
})



const startup = async()=> {
    //conectar o redis
    await clientRedis.connect();
    app.listen(3000, ()=>{
        console.log("Server is runnin on port 3000")
    })
}


startup();

