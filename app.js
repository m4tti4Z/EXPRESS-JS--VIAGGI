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
    secret:'super_secret',
    saveUninitialized:false,
    resave:false
}))
db.connect((err) => {
  if (err) {
    console.error('Errore di connessione al database:', err);
    return;
  }
  console.log('Connesso al database MySQL!');
});


const portNumber = 3005;
const ipAddress = '127.0.0.1'



app.get(['/','/home'],(req,res)=>{
    const sql = `SELECT 
    mete.nome,
    mete.id,
    mete.foto_url,
    mete.posti_totali -COALESCE(SUM(prenotazioni.num_persone),0) AS posti_disponibili
    FROM mete
    LEFT JOIN prenotazioni ON prenotazioni.id_meta = mete.id
    GROUP BY mete.id
    `;
    

    db.query(sql,(err,results)=>{
        if(err) throw err;
        res.render('home',{mete:results,utente:req.session.user});
    })
});

app.get('/ricerca',(req,res)=>{
    const citta = req.query.ricerca;
    const sql = `SELECT 
    mete.id,
    mete.nome,
    mete.foto_url,
    mete.posti_totali -COALESCE(SUM(prenotazioni.num_persone),0) AS posti_disponibili
    FROM mete 
    LEFT JOIN prenotazioni ON prenotazioni.id_meta = mete.id
    WHERE mete.nome LIKE ?
    GROUP BY mete.id
    `
    db.query(sql,[`%${citta}%`],(err,results)=>{
        if(err) throw err;
        res.render('home',{mete:results,utente:req.session.user});
    })

})
app.get('/meta/:id_meta',(req,res)=>{
    const id_meta = req.params.id_meta;
    const sql = `SELECT 
    nome,
    descrizione,
    foto_url,
    mete.id,
    prezzo,
    posti_totali - COALESCE(SUM(prenotazioni.num_persone),0) AS posti_disponibili
    FROM mete
    LEFT JOIN prenotazioni ON prenotazioni.id_meta = mete.id
    WHERE mete.id = ?`;

    db.query(sql,[id_meta],(err,results)=>{
        if(err) throw err;

        res.render('dettaglio',{meta:results[0]});
    })
});
app.get('/prenota/:id_meta',(req,res)=>{
    if(!req.session.user) return res.redirect('/login');
    const id_meta = req.params.id_meta;
    const sql = `SELECT 
    mete.nome,
    mete.prezzo,
    mete.foto_url,
    mete.id,
    mete.posti_totali-COALESCE(SUM(prenotazioni.num_persone),0) AS posti_disponibili
    FROM mete
    LEFT JOIN prenotazioni ON prenotazioni.id_meta = mete.id
    WHERE mete.id =?`;

    db.query(sql,[id_meta],(err,results)=>{
        if(err) throw err;

        res.render('prenota',{meta:results[0],utente:req.session.user});
    })
})

app.post('/prenota/:id_meta',(req,res)=>{
    const num_persone = req.body.num_persone;
    const id_meta = req.params.id_meta;
    const sql = `INSERT INTO prenotazioni(id_utente,id_meta,data_prenotazione,num_persone)
    VALUES(?,?,NOW(),?)`;

    db.query(sql,[req.session.user.id,id_meta,num_persone],(err,results)=>{
        if(err)throw err;

        res.send("Prenotazione avvenuta con successo");
        
    })
})

app.get('/login',(req,res)=>{
    res.render('login',{error:null});
})
app.post('/login',(req,res)=>{
    const {username,password } = req.body;

    const sql =`SELECT *FROM utenti WHERE username =? AND password = SHA2(?,256)`;

    db.query(sql,[username,password],(err,results)=>{
        if(err) throw err;
        if(results.length ===0) return res.send("Login fallito");

        req.session.user = results[0];
        console.log(req.session.user.id,req.session.user.nome,req.session.user.cognome

        )

        res.redirect('/');
    })
})

app.get('/logout',(req,res)=>{
    req.session.destroy((err)=>{
        if(err ) return res.send("Errore durante il logout");

        res.redirect('/home');
    })
})
app.listen(portNumber, ipAddress, () => {
  console.log(`Server avviato su http://${ipAddress}:${portNumber}/`);
});



app.get('/profilo',(req,res)=>{
    if(!req.session.user) return res.redirect('/login');
    const id_utente = req.session.user.id;

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
        res.render('profilo',{prenotazioni:results,user:req.session.user});
    })
})

app.get('/cancella/:id_prenotazione',(req,res)=>{
    const id_prenotazione = req.params.id_prenotazione;

    const sql = 'DELETE FROM prenotazioni WHERE id=?';

    db.query(sql,[id_prenotazione],(err,results)=>{
        if(err) throw err;
        res.redirect('/profilo')
    })
})

