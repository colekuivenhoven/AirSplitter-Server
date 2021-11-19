console.log('');
const dotenv = require('dotenv').config();
const http = require('http').createServer();
const fs = require('fs');
const archiver = require('archiver');
// var ffmpeg = require('ffmpeg');
const path = require('path');
var express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');
const { ObjectID } = require('bson');
var bcrypt = require('bcrypt');
const {spawn} = require('child_process');
const app = express();
const multer = require('multer');
var corsOptions = {
    'origin': '*'
}

const expressPort = 3040;
const socketPort = 4001;

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(pino);

const logFolder = './logs/';
const audioFolder = './original_audio/';

/* SocketIO Setup */
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

// const route_socket = require('./routes/socketio.js')(app, mysql_connection, io);

// Import Resources
const global_functions = require('./resources/globalFunctions.js');

const StorageAudio = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, './original_audio')
    },
    filename(req, file, callback) {
      callback(null, `${Date.now().toString().substring(0,7)}_`+file.originalname.replaceAll(" ", ""))
    },
});

const uploadAudio = multer({ storage: StorageAudio });

// Express Landing Page
app.get('/', (req, res) => {
    var ipAddress = (req.socket.remoteAddress).substring((req.socket.remoteAddress).lastIndexOf(':')+1);
    global_functions.logConnectionRecord('Landing Page', ipAddress, req.method);

    res.status(200).send('Isolation Server');
});

app.get('/file/get-zip/:name', (req, res) => {
    res.sendFile(path.join(__dirname, 'output', req.params.name));
});

app.get('/song/get-isolated/:name/:type', (req, res) => {
    res.sendFile(path.join(__dirname, 'output', req.params.name, req.params.type));
});

app.get('/song/get-original/:name', (req, res) => {
    res.sendFile(path.join(__dirname, 'original_audio', req.params.name));
});

app.post("/uploadAudio", uploadAudio.single('audio'), function(req, res) {
    console.log("File Uploaded")
    res.status(200).json({
        message: 'Audio Upload: Successful',
    });
});

app.get('/cancelUpload/:song', (req, res) => {
    let song = req.params.song;

    let toDelete_path = path.join(__dirname, 'original_audio', song);
    fs.unlink(toDelete_path, (err) => {
        if (err) {
            console.log(err);
            res.status(200).json({
                message: `Error removing file`,
            });
        }
        else {
            console.log(`${song} was removed`);
            res.status(200).json({
                message: `File removed`,
            });
        }
    });
});

app.get('/song-2stem/convert/:song', (req, res) => {
    var dataToSend;
    let song = req.params.song;
    const python = spawn('python', ['separate.py', song]);
    console.log("Isolation Started...")

    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
    });

    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);

        let toDelete_path = path.join(__dirname, 'original_audio', song);
        fs.unlink(toDelete_path, (err) => {
            if (err) throw err;
            console.log(`${toDelete_path} was removed`);
        });

        zipOutput(song.substring(0, song.lastIndexOf('.')));

        res.status(200).json({
            path_name: path.parse(song).name,
            path_type: 'vocals',
            path_ext: 'wav',
            message: 'success'
        });
    });
});

app.get('/song/convert-4stem/:song', (req, res) => {
    var dataToSend;
    let song = req.params.song;
    const python = spawn('python', ['separate.py', song]);
    console.log(song)

    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
    });

    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);

        let toDelete_path = path.join(__dirname, 'original_audio', song);
        fs.unlink(toDelete_path, (err) => {
            if (err) throw err;
            console.log(`${toDelete_path} was removed`);
        });

        res.status(200).json({
            path_name: path.parse(song).name,
            path_type: 'vocals',
            path_ext: 'wav',
            message: 'success'
        });
    });
});

app.listen(expressPort, () => {
    console.log(global_functions.dateTimeNow()+'[Express listening on port '+expressPort+']');
    global_functions.writeToLog(global_functions.dateTimeNow()+'[Express listening on port '+expressPort+']');
});

function zipOutput(name) {
    var output = fs.createWriteStream(__dirname+'/output/'+`${name}.zip`);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('Archiver has been finalized and the output file descriptor has closed.');

        let toDelete_path = path.join(__dirname, 'output', name);
        fs.rm(toDelete_path, {recursive: true}, (err) => {
            if (err) throw err;
            console.log(`${toDelete_path} folder was removed`);
        });
    });
    
    archive.on('error', function(err){
        throw err;
    });
    
    archive.pipe(output);
    
    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(__dirname+'/output/'+`${name}`, false);
    
    archive.finalize();
}