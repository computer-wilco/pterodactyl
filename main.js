import logginglog from 'logginglog';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, extname } from 'path';
import express from "express";
import { ip as IP } from 'ipadres';

const app = express();
const dirname = import.meta.dirname;

const PORT = 8888;

// Logginglog
const color = logginglog.colors();
const serverlog = logginglog.makeLogger('WExpress', color.rainbow);
// Eind Logginglog

const notfound = JSON.parse(readFileSync(join(dirname, "/json/not_found.json")));
const blocked = JSON.parse(readFileSync(join(dirname, "/json/blocked.json")));

app.set('view engine', 'ejs');
app.set('views', join(dirname, "/ejs"));

app.use((req, res, next) => {
    // Controleer of de path geen slash eindigt én geen bestandsextensie heeft
    if (!req.path.endsWith('/') && !extname(req.path)) {
        // Laat routes met queryparameters ongemoeid
        if (Object.keys(req.query).length === 0) {
            return res.redirect(301, req.path + '/');
        }
    }
    next();
});

app.all('*', (req, res, next) => {
    const url = req.originalUrl.split("?")[0].split("#")[0];
    let startswith = false;
    for(const start of blocked.startswith) { 
        if(url.startsWith(start)){
            startswith = true;
        }
    }
    let endswith = false;
    for(const start of blocked.endswith) {
        if(url.endsWith(start)){
                endswith = true;
        }
    }
    if (blocked.exact.includes(url) || startswith || endswith) {
        res.status(200).render("error/403", {url: req.originalUrl});
    } else {
        next();
    }
});

app.all('*', (req, res, next) => {
    const url = req.originalUrl.split("?")[0].split("#")[0];
    let startswith = false;
    for(const start of notfound.startswith) {
        if(url.startsWith(start)){
                startswith = true;
        }
    }
    let endswith = false;
    for(const start of notfound.endswith) {
        if(url.endsWith(start)){
            endswith = true;
        }
    }
    if (notfound.exact.includes(url) || startswith || endswith) {
        res.status(200).render("error/404", {url: req.originalUrl});
    } else {
        next();
    }
});

app.all('*', (req, res) => {
    res.status(200).render("error/404", {url: req.originalUrl});
});

const server = createServer(app);

server.listen(PORT);
serverlog(`WExpress server gestart op ${IP}:${PORT}`);
console.log("mark>running");
