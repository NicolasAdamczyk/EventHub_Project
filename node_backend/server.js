const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // Import de SQLite
const app = express();
const PORT = 3000;

app.use(express.json());

// 1. CONNEXION À LA BASE DE DONNÉES 
// Contrairement à Django qui fait ça via 'settings.py', ici on le fait directement dans le code.
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("Erreur de connexion à la base de données :", err.message);
    } else {
        console.log("Connecté à la base de données SQLite.");
        // Création de la table 'events' si elle n'existe pas (l'équivalent de nos 'migrations' Django)
        db.run(`CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            date TEXT,
            status TEXT
        )`);
    }
});

// 2. ROUTES CRUD POUR L'ENTITÉ 'EVENT' 

// CREATE (Créer un événement - POST)
app.post('/api/events', (req, res, next) => {
    const { title, description, date, status } = req.body;
    const sql = 'INSERT INTO events (title, description, date, status) VALUES (?, ?, ?, ?)';
    // En Node.js, on écrit nos requêtes SQL à la main (contrairement à l'ORM de Django)
    db.run(sql, [title, description, date, status], function(err) {
        if (err) return next(err); // Envoie l'erreur au middleware
        res.status(201).json({ id: this.lastID, title, description, date, status });
    });
});

// READ (Lister tous les événements - GET)
app.get('/api/events', (req, res, next) => {
    db.all('SELECT * FROM events', [], (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

// READ (Lire un seul événement par son ID - GET)
app.get('/api/events/:id', (req, res, next) => {
    db.get('SELECT * FROM events WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return next(err);
        if (!row) return res.status(404).json({ error: 'Événement non trouvé' });
        res.json(row);
    });
});

// UPDATE (Modifier un événement - PUT)
app.put('/api/events/:id', (req, res, next) => {
    const { title, description, date, status } = req.body;
    const sql = 'UPDATE events SET title = ?, description = ?, date = ?, status = ? WHERE id = ?';
    db.run(sql, [title, description, date, status, req.params.id], function(err) {
        if (err) return next(err);
        if (this.changes === 0) return res.status(404).json({ error: 'Événement non trouvé' });
        res.json({ message: 'Événement mis à jour', id: req.params.id });
    });
});

// DELETE (Supprimer un événement - DELETE)
app.delete('/api/events/:id', (req, res, next) => {
    db.run('DELETE FROM events WHERE id = ?', [req.params.id], function(err) {
        if (err) return next(err);
        if (this.changes === 0) return res.status(404).json({ error: 'Événement non trouvé' });
        res.json({ message: 'Événement supprimé' });
    });
});

// MIDDLEWARE D'ERREUR BASIQUE [cite: 68]
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

// DÉMARRAGE DU SERVEUR
app.listen(PORT, () => {
    console.log(`Le serveur Express tourne sur http://localhost:${PORT}`);
});