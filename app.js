//==================express server=================//
var path = require('path');
var express = require('express');

var app = express();

app.use(express.static(path.join(__dirname, '/')))

app.listen(80, 'h5.zhuishushenqi.com', function(err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('listen in h5.zhuishushenqi.com');
});