var path = require("path");
var http = require("http");
var fs = require("fs");
var server = http.createServer((req,res)=>{
    var url = path.join(__dirname,req.url == "/" ? "index.html":req.url);
    var extension = path.extname(url);
    var contentType= "";
    switch (extension) {
        case '.html':
            contentType = "text/html";
            break;

            case '.js':
            contentType = "text/javascript";
            break;

            case '.css':
            contentType = "text/css";
            break;

            case '.jpeg':
            case '.jpg':
            contentType = "image/jpeg";
            break;

            case '.png':
            contentType = "image/png";
            break;

        default:
            contentType = "text/plain";
            break;
    }
    fs.readFile(url,(error,data) => {
        if(error){
            if(error.code == 'ENONET'){
                fs.readFile(path.join(__dirname,"error.html"),(error,data) => {
                    res.writeHead(200,{"Content-Type":"text/html"});
                    res.end(data,"utf-8");
                });
            }else{
                console.log(error.code);
            }
        }else{
            res.writeHead(200,{"Content-Type":contentType});
            res.end(data,"utf-8");
        }
    });

});
var port = process.env.PORT || 2200;
server.listen(port, console.log("Server running on port 2200 \n http://127.0.0.1:2200"));
