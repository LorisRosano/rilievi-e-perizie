import _http from "http";
import _url from "url";
import _fs from "fs";
import _express from "express";
import _dotenv from "dotenv";
import _cors from "cors";
import cloudinary, { UploadApiResponse } from "cloudinary";

// Lettura delle password e parametri fondamentali
_dotenv.config({ "path": ".env" });

// Variabili relative a MongoDB ed Express
import { MongoClient, ObjectId } from "mongodb";
const DBNAME = process.env.DBNAME;
const connectionString: string = process.env.connectionStringAtlas;

cloudinary.v2.config({
    cloud_name: "db2pqebl7",
    api_key: "251943897415567",
    api_secret: "gDj1lpCFHKe4YPlaBo_UqRnuUlg"
});
const app = _express();

// Creazione ed avvio del server
// app è il router di Express, si occupa di tutta la gestione delle richieste http
const PORT: number = parseInt(process.env.PORT);
let paginaErrore;
const server = _http.createServer(app);
// Il secondo parametro facoltativo ipAddress consente di mettere il server in ascolto su una delle interfacce della macchina, se non lo metto viene messo in ascolto su tutte le interfacce (3 --> loopback e 2 di rete)
server.listen(PORT, () => {
    init();
    console.log(`Il Server è in ascolto sulla porta ${PORT}`);
});

function init() {
    _fs.readFile("./static/error.html", function (err, data) {
        if (err) {
            paginaErrore = `<h1>Risorsa non trovata</h1>`;
        }
        else {
            paginaErrore = data.toString();
        }
    });
}





//********************************************************************************************//
// Routes middleware
//********************************************************************************************//

// 1. Request log
app.use("/", (req: any, res: any, next: any) => {
    console.log(`-----> ${req.method}: ${req.originalUrl}`);
    next();
});

// 2. Gestione delle risorse statiche
// .static() è un metodo di express che ha già implementata la firma di sopra. Se trova il file fa la send() altrimenti fa la next()
app.use("/", _express.static("./static"));

// 3. Lettura dei parametri POST di req["body"] (bodyParser)
// .json() intercetta solo i parametri passati in json nel body della http request
app.use("/", _express.json({ "limit": "50mb" }));
// .urlencoded() intercetta solo i parametri passati in urlencoded nel body della http request
app.use("/", _express.urlencoded({ "limit": "50mb", "extended": true }));

// 4. Log dei parametri GET, POST, PUT, PATCH, DELETE
app.use("/", (req: any, res: any, next: any) => {
    if (Object.keys(req["query"]).length > 0) {
        console.log(`       ${JSON.stringify(req["query"])}`);
    }
    if (Object.keys(req["body"]).length > 0) {
        console.log(`       ${JSON.stringify(req["body"])}`);
    }
    next();
});

// 5. Controllo degli accessi tramite CORS
const corsOptions = {
    origin: function (origin, callback) {
        return callback(null, true);
    },
    credentials: true
};
app.use("/", _cors(corsOptions));

//********************************************************************************************//
// Routes finali di risposta al client
//********************************************************************************************//

app.get("/api/login", async (req, res, next) => {
    let username = req["query"]["username"];
    let password = req["query"]["password"];
    const client = new MongoClient(connectionString);
    await client.connect();
    let collection = client.db(DBNAME).collection("utenti");
    let rq = collection.findOne({ "username": username, "password": password });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
    rq.finally(() => client.close());
});

app.post("/api/nuovoUtente", async function (req, res, next) {
    let username = req["body"]["username"];
    let password = req["body"]["password"];
    let email = req["body"]["email"];
    let cognome = req["body"]["cognome"];
    let nome = req["body"]["nome"];
    let sesso = req["body"]["sesso"];
    let id = req["body"]["idUtente"];
    const client = new MongoClient(connectionString);
    await client.connect();
    let collection = client.db(DBNAME).collection("utenti");
    let rq = collection.insertOne({ "username": username, "password": password, "email": email, "cognome": cognome, "nome": nome, "sesso": sesso, "id": id });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
    rq.finally(() => client.close());
});

app.post("/api/primoLogin", async function (req, res, next) {
    let username = req["body"]["username"];
    let password = req["body"]["password"];
    const client = new MongoClient(connectionString);
    await client.connect();
    let collection = client.db(DBNAME).collection("utenti");
    let rq = collection.updateOne({ "username": username }, { $set: { "password": password } });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
    rq.finally(() => client.close());
});

app.get("/api/listaUtenti", async (req, res, next) => {
    const client = new MongoClient(connectionString);
    await client.connect();
    let collection = client.db(DBNAME).collection("utenti");
    let rq = collection.find().toArray();
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
    rq.finally(() => client.close());
});

app.delete("/api/eliminaUtente", async (req, res, next) => {
    let idUtente = req["body"]["idUtente"];
    const client = new MongoClient(connectionString);
    await client.connect();
    let collection = client.db(DBNAME).collection("utenti");
    let rq = collection.deleteOne({ "_id": new ObjectId(idUtente) });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
    rq.finally(() => client.close());
});

app.delete("/api/eliminaPerizia", async (req, res, next) => {
    let idPerizia = req["body"]["idPerizia"];
    const client = new MongoClient(connectionString);
    await client.connect();
    let collection = client.db(DBNAME).collection("perizie");
    let rq = collection.deleteOne({ "_id": new ObjectId(idPerizia) });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
    rq.finally(() => client.close());
});

app.get("/api/getUtentiByID", async (req, res, next) => {
    let idUtente = req["query"]["idUtente"];
    const client = new MongoClient(connectionString);
    await client.connect();
    let collection = client.db(DBNAME).collection("utenti");
    let rq = collection.findOne({ "id": idUtente });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
    rq.finally(() => client.close());
});

app.get("/api/getUtenti", async (req, res, next) => {
    const client = new MongoClient(connectionString);
    await client.connect();
    let collection = client.db(DBNAME).collection("utenti");
    let rq = collection.find().toArray();
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
    rq.finally(() => client.close());
});

app.get("/api/listaPerizie", async (req, res, next) => {
    const client = new MongoClient(connectionString);
    await client.connect();
    let collection = client.db(DBNAME).collection("perizie");
    let rq = collection.find().toArray();
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
    rq.finally(() => client.close());
});

app.get("/api/cercaUtente", async (req, res, next) => {
    let username = req["query"]["username"];
    const client = new MongoClient(connectionString);
    await client.connect();
    let collection = client.db(DBNAME).collection("utenti");
    let rq = collection.findOne({ "username": username });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
    rq.finally(() => client.close());
});

app.get("/api/perizieById", async (req, res, next) => {
    let idUtente = req["query"]["idUtente"];
    const client = new MongoClient(connectionString);
    await client.connect();
    let collection = client.db(DBNAME).collection("perizie");
    let rq = collection.find({ "codiceOperatore": idUtente }).toArray();
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
    rq.finally(() => client.close());
});

app.post("/api/aggiungiPerizia", async (req, res, next) => {
    let perizia = req["body"]["perizia"];
    let idPerizia = perizia.idPerizia;
    let codiceOperatore = perizia.codiceOperatore;
    let dataPerizia = perizia.dataOra;
    let descrizione = perizia.descrizione;
    let images = perizia.images;
    let lat = perizia.lat;
    let lng = perizia.lng;
    let title = perizia.Title;

    console.log(dataPerizia)
    
    const client = new MongoClient(connectionString);
    await client.connect();
    let collection = client.db(DBNAME).collection("perizie");
    let rq = collection.insertOne({ "idPerizia": idPerizia, "codiceOperatore": codiceOperatore, "dataOra": dataPerizia, "descrizione": descrizione, "images": images, "lat": lat, "lng": lng, "Title": title });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
    rq.finally(() => client.close());
});

app.post("/api/addBase64CloudinaryImage", (req, res, next) => {
    let codiceOperatore = req["body"].codiceOperatore;
    let imgBase64 = req["body"].imgBase64;
    
    cloudinary.v2.uploader.upload(imgBase64, { "folder": "imgPerizie" })
        .catch((err) => {
            res.status(500).send(`Error while uploading file on Cloudinary: ${err}`);
        })
        .then(async function (response: UploadApiResponse) {
            const client = new MongoClient(connectionString);
            await client.connect();
            let collection = client.db(DBNAME).collection("perizie");
            let rq = collection.find().toArray();
            rq.then((data) => res.send({"url": response.secure_url}));
            rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
            rq.finally(() => client.close());
        });
});

app.post("/api/addImages", (req, res, next) => {
    let idPerizia = req["body"].idPerizia;
    let images = req["body"].images;
    const client = new MongoClient(connectionString);
    client.connect()
        .then(() => {
            let collection = client.db(DBNAME).collection("perizie");
            let rq = collection.updateOne({ "idPerizia": idPerizia }, { $set: { "images": images } });
            return rq;
        })
        .then((data) => res.send(data))
        .catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`))
        .finally(() => client.close());
});

//********************************************************************************************//
// Default route e gestione degli errori
//********************************************************************************************//

app.use("/", (req, res, next) => {
    res.status(404);
    if (req.originalUrl.startsWith("/api/")) {
        res.send(`Api non disponibile`);
    }
    else {
        res.send(paginaErrore);
    }
});

app.use("/", (err, req, res, next) => {
    console.log("************* SERVER ERROR ***************\n", err.stack);
    res.status(500).send(err.message);
});