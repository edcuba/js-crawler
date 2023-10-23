import { PlaywrightCrawler, Configuration } from 'crawlee';
import express from 'express';
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

const app = express()
app.use(express.json());

const port = 3000

const config = new Configuration({
    defaultBrowserPath: "/home/myuser/pw-browsers/chrome",
    persistStorage: false,
});


app.post('/', async (req, res, next) => {
    const urls: Array<string> = [];
    const keys: Array<string> = [];

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 10,
        async requestHandler({ page, request /*, enqueueLinks*/ }) {
            // await enqueueLinks({
            //      strategy: 'same-hostname',
            // });
            const uniqueKey = request.uniqueKey;
            const fileName = uniqueKey + ".html";

            keys.push(fileName);
            urls.push(request.url);
            fs.writeFile("storage/" + fileName, await page.content(), function (err) {
                if (err) return console.log(err);
            });
        },
    }, config);

    console.log(req.body)
    const requested_urls = req.body.urls;

    try {
        // assign unique key to each page
        await crawler.run(requested_urls.map((url: string) => ({ url, uniqueKey: uuidv4() })));
    } catch (e) {
        return next(e);
    }

    const response = {
        "keys": keys,
        "urls": urls,
    };

    // response
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
