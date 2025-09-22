const express = require('express');
const mysql = require('mysql2');
const ejs = require('ejs');
const session = require('express-session');

const app = express();
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const db = mysql.createConnection({
  database : "viaggi_db",
  host: '127.0.0.1',
  user: 'root',
  password: ''
});
app.use(session({
  secret: 'segreto_super_sicuro', // chiave segreta per la sessione
  resave: false,
  saveUninitialized: false
}));

db.connect((err) => {
  if (err) {
    console.error('Errore di connessione al database:', err);
    return;
  }
  console.log('Connesso al database MySQL!');
});


const portNumber = 3005;
const ipAddress = '127.0.0.1'



app.get('/',(req,res)=>{
    const queryMete =`SELECT  
    nome,
    mete.id,
    mete.foto_url,
    posti_totali-COALESCE(SUM(num_persone),0) AS posti_disponibili
    FROM mete
    LEFT JOIN prenotazioni ON mete.id = prenotazioni.id_meta
    GROUP BY mete.id`;

    db.query(queryMete,(err,results)=>{
        if(err) throw err;

        res.render('home',{mete:results});
    })
});


app.get('/meta/:id_meta',(req,res)=>{
    const id = req.params.id_meta;
    const sql = `SELECT 
    nome,
    mete.id,
    posti_totali - COALESCE(SUM(prenotazioni.num_persone),0) AS posti_disponibili,
    foto_url,
    prezzo,
    descrizione
    FROM mete
    LEFT JOIN prenotazioni ON mete.id = prenotazioni.id_meta
    WHERE mete.id = ?
    GROUP BY mete.id
    `;

    db.query(sql,[id],(err,results)=>{
        if(err) throw err;
        if(results.length ===0) return  res.send("Meta non trovata");
       console.log("meta che passo alla view:", results[0]); // <<< LOG QUI
        res.render('dettaglio',{meta:results[0]});
       

    })
})
app.get('/prenota/:id_meta', (req, res) => {
    if(!req.session.utente) return res.redirect('/login');
    const id_meta = req.params.id_meta;

    const sql = `
      SELECT 
      mete.id, 
      mete.nome, 
      mete.prezzo,
      (mete.posti_totali - COALESCE(SUM(prenotazioni.num_persone),0)) AS posti_disponibili
      FROM mete
      LEFT JOIN prenotazioni ON mete.id = prenotazioni.id_meta
      WHERE mete.id = ?
      GROUP BY mete.id
    `;
    db.query(sql, [id_meta], (err, results) => {
        if (err) throw err;
        if (results.length === 0) return res.send("Meta non trovata");
        res.render('prenota', { meta: results[0], user: req.session.utente });
    });
});

app.get('/login',(req,res)=>{
    res.render('login',{error:null});
})

app.post('/login',(req,res)=>{
    const {username,password} = req.body;

    const sql = 'SELECT* FROM utenti WHERE username = ? AND password = SHA2(?,256)';

    db.query(sql,[username,password],(err,results)=>{
        if(err) throw err;

        if(results.length ===0) return res.send("Login fallito.Controllare le credenziali");

        req.session.utente = results[0];

        res.redirect('/');
        console.log(req.session.utente);

    });

})

app.get("/logout",(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/login');
    })
})

app.listen(portNumber, ipAddress, () => {
  console.log(`Server avviato su http://${ipAddress}:${portNumber}/`);
});

app.post('/prenota/:id_meta',(req,res)=>{
    const num_persone = req.body.num_persone;
    const id_meta = req.params.id_meta;
    const sql = `INSERT INTO prenotazioni(id_utente,id_meta,data_prenotazione,num_persone)
    VALUES(?,?,CURDATE(),?)`;

    db.query(sql,[req.session.utente.id,id_meta,num_persone],(err,results)=>{
        if(err)throw err;

        res.send("Prenotazione avvenuta con successo");
        
    })
})

app.get('/profilo',(req,res)=>{
    if(!req.session.utente) return res.redirect('/login');
    const id_utente = req.session.utente.id;

    const sql = `SELECT
    prenotazioni.id,
    mete.nome,
    mete.prezzo,
    prenotazioni.num_persone,
    prenotazioni.data_prenotazione
    FROM prenotazioni
    JOIN mete ON prenotazioni.id_meta = mete.id
    WHERE prenotazioni.id_utente = ?
    `;

    db.query(sql,[id_utente],(err,results)=>{
        if(err) throw err;
        console.log(results);
        res.render('profilo',{prenotazioni:results,user:req.session.utente});
    })
})

app.get('/cancella/:id_prenotazione',(req,res)=>{
    const id_prenotazione = req.params.id_prenotazione;

    const sql = 'DELETE FROM prenotazioni WHERE id=?';

    db.query(sql,[id_prenotazione],(err,results)=>{
        if(err) throw err;

        res.send("Cancellazione avvenuta con successo!");
    })
})

