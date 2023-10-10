import { PlaywrightCrawler } from 'crawlee';
import express from 'express';
import fs from "fs";

const app = express()
app.use(express.json());

const port = 3000


app.post('/', async (req, res) => {
    const urls: Array<string> = [];
    const keys: Array<string> = [];

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 10,
        async requestHandler({ page, request, enqueueLinks }) {
            await enqueueLinks({
                strategy: 'same-hostname',
            });
            const r = (Math.random() + 1).toString(36).substring(2);
            const fileName = r + ".html";
            keys.push(fileName);
            urls.push(request.url);
            fs.writeFile("storage/" + fileName, await page.content(), function (err) {
                if (err) return console.log(err);
            });
        },
    });

    const url = req.body.url;
    await crawler.run([url]);

    const response = {
        "keys": keys,
        "urls": urls,
    };

    res.send(response);
})


app.get('/files/:file(*)', function(req, res, next){

    const filename = req.params.file;
    const filepath = "storage/" + filename;

    res.download(filepath, filename, function (err: any) {
        if (err) {
            if (err.status !== 404) return next(err); // non-404 error
            res.statusCode = 404;
            res.send('Cant find that file!');
            return;
        }
        fs.unlink(filepath, (err) => { if (err) console.error(err)});

    });
  });

app.listen(port, () => {
    console.log(`JS crawler listening on ${port}`)
})
