CREATE DATABASE viaggi_db;

CREATE TABLE utenti(
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    nome VARCHAR(50),
    cognome VARCHAR(50)
);
INSERT INTO utenti(username,password,nome,cognome)
VALUES(
    'FedeMani',
    SHA2('1234',256),
    'Federcio',
    'Maniglio'
);
INSERT INTO utenti(username,password,nome,cognome)
VALUES(
    'acosta',
    SHA2('5678',256),
    'Alberto',
    'Costa'
);
INSERT INTO utenti(username,password,nome,cognome)
VALUES(
    'sbalestro',
    SHA2('letmein',256),
    'Sergio',
    'Balestro'
);

CREATE TABLE mete(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descrizione TEXT(100),
    prezzo DECIMAL(10,2),
    posti_totali INT,
    foto_url VARCHAR(255)
);
INSERT INTO mete(nome,descrizione,prezzo,posti_totali,foto_url)
VALUES(
    'Bucarest',
    'Esperienza imperdibile nella capitale della Romania',
    550.00,
    50,
    'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.marcotogni.it%2Fcosa-vedere-bucarest%2F&psig=AOvVaw2wECtBaeuqiojizLpM3NMM&ust=1758356950448000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCKDhl5-05I8DFQAAAAAdAAAAABAK'

);
INSERT INTO mete(nome,descrizione,prezzo,posti_totali,foto_url)
VALUES(
    'Lisbona',
    'Viaggio imperdibile nella capitale Portoghese',
    600.00,
    50,
    'https://www.italiaatavola.net/images/contenutiarticoli/lisbona-veduta.jpg'
);
INSERT INTO mete(nome,descrizione,prezzo,posti_totali,foto_url)
VALUES(
    'Stoccolma',
    'Capitale svedese',
    800.00,
    50,
    'https://www.stoccolma.net/wp-content/uploads/sites/9/stoccolma.jpg'
);

INSERT INTO mete(nome,descrizione,prezzo,posti_totali,foto_url)
VALUES(
    'Sharm el Sheik',
    'Vacanza rilassante con mare cristallino',
    1200.00,
    50,
    'https://www.mindthetrip.it/wp-content/uploads/Sharm-el-Sheikh.jpg'
);

INSERT INTO mete(nome,descrizione,prezzo,posti_totali,foto_url)
VALUES(
    'Isola di Pag',
    'Una delle più belle isole croate',
    1000.00,
    50,
    'https://www.noa-zrce.com/data/public/2021-05/pag-beritnica-d85_2297_acr_aleksandar_gospic.jpg'
);

CREATE TABLE prenotazioni(
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_utente INT,
    id_meta INT,
    data_prenotazione DATE,
    num_persone INT,

    FOREIGN KEY(id_utente)REFERENCES utenti(id),
    FOREIGN KEY(id_meta)REFERENCES mete(id)
);




UPDATE mete
SET descrizione = 'Scopri il fascino della capitale romena tra storia, cultura e vita notturna vivace.'
WHERE id = 1;

UPDATE mete
SET descrizione = "Passeggia tra i quartieri storici, assapora il fado e lasciati conquistare dall'Oceano Atlantico"
WHERE id = 2;

UPDATE mete
SET descrizione = 'Un mix unico di modernità e tradizione tra fiordi, musei e design scandinavo'
WHERE id = 3;

UPDATE mete
SET descrizione = "Relax sul Mar Rosso tra barriera corallina, escursioni nel deserto e mare cristallino"
WHERE id = 4;

UPDATE mete
SET descrizione = 'Spiagge dorate, paesaggi mozzafiato e la movida più famosa della Croazia'
WHERE id = 5;
