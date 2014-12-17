// Dependencies
var BPromise = require("bluebird");
var Canvas   = require("canvas");
var express  = require("express");
var crypto   = require("crypto");
var fs       = require("fs");
var http     = require("http");
var QRCode   = require("qrcode");

// Load the base image
var baseImageBuffer = fs.readFileSync("./base-image.png");
var baseImageImage = new Canvas.Image();
baseImageImage.src = baseImageBuffer;

var ENTROPY = 16;

var pngBufferFromString = function (string) {
    return new BPromise(function (resolve, reject) {
        QRCode.draw(string, function (err, qrCodeCanvas) {
            if (err) {
                return reject(err);
            }
            // Build the qrCode image
            var qrCodeImage = new Canvas.Image();
            qrCodeImage.src = qrCodeCanvas.toBuffer();
            // Construct the canvas
            var canvas = new Canvas(1024, 1024);
            var ctx = canvas.getContext("2d");
            // Draw the base image and qrCode
            ctx.drawImage(baseImageImage, 0, 0, 1024, 1024);
            ctx.drawImage(qrCodeImage, 200, 50, 624, 624);
            // Return a buffer
            resolve(canvas.toBuffer());
        });
    });
};

var sendImage = function (req, res, string) {
    pngBufferFromString(string)
        .then(function (pngBuffer) {
            res.set("Content-Type", "image/png");
            res.send(pngBuffer);
        })
        .catch(function (err) {
            res.status(500);
            res.send();
        });
};

var random = function (req, res) {
    var rnd = crypto.randomBytes(ENTROPY).toString("hex");
    var string = "http://bookstreams.org/pin/" + rnd;
    sendImage(req, res, string);
};

var fromString = function (req, res) {
    sendImage(req, res, req.params.string);
};

express()
    .get("/random", random)
    .get("/from-string/:string", fromString)
    .listen(3000);
