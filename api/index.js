const app = require("express")();
const { v4 } = require("uuid");
const cheerio = require("cheerio");
const cors = require("cors");
const rs = require("request");
const axios = require("axios");
const port = 5000;
const path  = require("path");
  const fs = require("fs");

app.all('*', (req, res, next) => {

    //  CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    //  Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    //  Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET','POST', 'OPTIONS');

    next();
});

app.set("views", path.join(__dirname, "views"));
const baseURL = "https://gogoanime.sk/";

app.get("/api/home", (req, res) => {
  let info = {
    popular: "https://anime-x.vercel.app/api/popular/:page",
    details: "https://anime-x.vercel.app/api/details/:id",
    search: "https://anime-x.vercel.app/api/search/:word/:page",
    episode_link: "https://anime-x.vercel.app/api/watching/:id/:episode",
    genre: "https://anime-x.vercel.app/api/genre/:type/:page",
    recently_added: "https://anime-x.vercel.app/api/recentlyadded/:page",
    anime_list: "https://anime-x.vercel.app/api/list/:page",
    genrelist: "https://anime-x.vercel.app/api/genrelist",
  };
  res.send(info);
});
app.get("/api/popular/:page", (req, res) => {
  let results = [];
  let page = req.params.page;
  if (isNaN(page)) {
    return res.status(404).json({ results });
  }
  url = `${baseURL}popular.html?page=${req.params.page}`;
  rs(url, (error, response, html) => {
    if (!error) {
      try {
        var $ = cheerio.load(html);
        $(".img").each(function (index, element) {
          let title = $(this).children("a").attr().title;
          let id = $(this).children("a").attr().href.slice(10);
          let image = $(this).children("a").children("img").attr().src;

          results[index] = { title, id, image };
        });
        res.status(200).json({ results });
      } catch (e) {
        res.status(404).json({ e: "404 fuck off!!!!!" });
      }
    }
  });
});

app.get("/api/details/:id", (req, res) => {
  let results = [];

  siteUrl = `${baseURL}category/${req.params.id}`;
  rs(siteUrl, (err, resp, html) => {
    if (!err) {
      try {
        var $ = cheerio.load(html);
        var type = " ";
        var summary = "";
        var relased = "";
        var status = "";
        var genres = "";
        var Othername = "";
        var title = $(".anime_info_body_bg").children("h1").text();
        var image = $(".anime_info_body_bg").children("img").attr().src;

        $("p.type").each(function (index, element) {
          if ("Type: " == $(this).children("span").text()) {
            type = $(this).text().slice(15, -5);
          } else if ("Plot Summary: " == $(this).children("span").text()) {
            summary = $(this).text().slice(14);
          } else if ("Released: " == $(this).children("span").text()) {
            relased = $(this).text().slice(10);
          } else if ("Status: " == $(this).children("span").text()) {
            status = $(this).text().slice(8);
          } else if ("Genre: " == $(this).children("span").text()) {
            genres = $(this).text().slice(20, -4);
            genres = genres.split(",");
            genres = genres.join(",");
          } else "Other name: " == $(this).children("span").text();
          {
            Othername = $(this).text().slice(12);
          }
        });
        genres.replace(" ");
        var totalepisode = $("#episode_page")
          .children("li")
          .last()
          .children("a")
          .attr().ep_end;
        results[0] = {
          title,
          image,
          type,
          summary,
          relased,
          genres,
          status,
          totalepisode,
          Othername,
        };
        res.status(200).json({ results });
      } catch (e) {
        res.status(404).json({ e: "404 fuck off!!!!!" });
      }
    }
  });
});

app.get("/api/search/:word/:page", (req, res) => {
  let results = [];
  var word = req.params.word;
  let page = req.params.page;
  if (isNaN(page)) {
    return res.status(404).json({ results });
  }

  url = `${baseURL}/search.html?keyword=${word}&page=${req.params.page}`;
  rs(url, (err, resp, html) => {
    if (!err) {
      try {
        var $ = cheerio.load(html);
        $(".img").each(function (index, element) {
          let title = $(this).children("a").attr().title;
          let id = $(this).children("a").attr().href.slice(10);
          let image = $(this).children("a").children("img").attr().src;

          results[index] = { title, id, image };
        });
        res.status(200).json({ results });
      } catch (e) {
        res.status(404).json({ e: "404 fuck off!!!!!" });
      }
    }
  });
});

async function getLink(Link) {
  rs(Link, (err, resp, html) => {
    if (!err) {
      var $ = cheerio.load(html);
      let links = [];
      $("a").each((i, e) => {
        if (e.attribs.download === "") {
          links.push(e.attribs.href);
        }
      });
      return links;
    }
  });
}

app.get("/api/watching/:id/:episode", async (req, res) => {

  let nl = [];
  var totalepisode = [];
  var id = req.params.id;
  var episode = req.params.episode;
  url = `${baseURL + id}-episode-${episode}`;
let link;

  rs(url, async (err, resp, html) => {

    if (!err) {
      try {
        var $ = cheerio.load(html);

        if ($(".entry-title").text() === "404") {
          return res
            .status(404)
            .json({ links: [], link, totalepisode: totalepisode });
        }

        totalepisode = $("#episode_page")
          .children("li")
          .last()
          .children("a")
          .text()
          .split("-");
        totalepisode = totalepisode[totalepisode.length - 1];
        link = $("li.anime").children("a").attr("data-video");
        const cl = "http:" + link.replace("streaming.php", "download");
        var linkx = "https://animexninja-api.dhvitop.repl.co/watch/"+ id + "/" + episode;
    
      var fid = $("div.anime_muti_link ul li.xstreamcdn a").attr("data-video");
        fid = fid.replace("https://fembed-hd.com/v/", "");
     
          
          
        
             
              return res
                .status(200)
                .json({ links: nl, link: linkx, linkx:  "https://animexninja-api.dhvitop.repl.co/watch2/" +  id + episode, totalepisode: totalepisode });
           
          
        
      } catch (e) {
    
            
                
               
              
        return res
          .status(404)
          .json({ links: [], link: "https://animexninja-api.dhvitop.repl.co/watch2/" +  id + episode, totalepisode: totalepisode });
      }
    }
  });
});
const CryptoJS = require("crypto-js")
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36"
const Referer = "https://gogoplay.io/"
const BASE_URL = "https://gogoanime.fi"
const ajax_url = "https://ajax.gogo-load.com/"
const ENCRYPTION_KEYS_URL = "https://raw.githubusercontent.com/justfoolingaround/animdl-provider-benchmarks/master/api/gogoanime.json"

let iv = null;
let key = null;
let second_key = null;
const fetch_keys = async() => {
    const response = await axios.get(ENCRYPTION_KEYS_URL);
    const res = response.data;
    return {
        iv: CryptoJS.enc.Utf8.parse(res.iv),
        key: CryptoJS.enc.Utf8.parse(res.key),
        second_key: CryptoJS.enc.Utf8.parse(res.second_key)
    };
}
async function generateEncryptAjaxParameters($, id) {
 const keys = await fetch_keys();
    iv = keys.iv;
    key = keys.key;
    second_key = keys.second_key;

    const
        cryptVal = $("script[data-name='episode']").data().value,
        decryptedData = CryptoJS.AES['decrypt'](cryptVal, key, {
            'iv': iv
        }),
        decryptedStr = CryptoJS.enc.Utf8.stringify(decryptedData),
        videoId = decryptedStr.substring(0, decryptedStr.indexOf('&')),
        encryptedVideoId = CryptoJS.AES['encrypt'](videoId, key, {
            'iv': iv
        }).toString();

    return 'id=' + encryptedVideoId + decryptedStr.substring(decryptedStr.indexOf('&')) + '&alias=' + videoId;

}
 function decryptEncryptAjaxResponse(obj) {
    const decrypted = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(obj.data, second_key, {
        'iv': iv
    }));
    return JSON.parse(decrypted);
}
app.get("/json/oembed/:id/:episode", async(req,res) => {
   var id = req.params.id;
  var episode = req.params.episode;

   res.status(200).json({
    
        "author_name": "Youtube",
        "width": 480,
        "title": "AnimeEZ Watch Anime",
        "provider_name": "Youtube",
        "height": 270,
        "html": "<iframe width='480' height='270' src='https://animexninja-api.dhvitop.repl.co/watch/" + id + "/" + episode + "' frameborder='0' allowfullscreen></iframe>",
        "provider_url": "https://animexninja-api.dhvitop.repl.co",
        "thumbnail_url": "https://www.animeez.tk/_next/image?url=%2Flogo.png&w=384&q=75",
        "type": "video",
        "thumbnail_height": 360,
        "author_url": "https://animexninja-api.dhvitop.repl.co",
        "version": "1.0",
        "thumbnail_width": 480


  })
})
app.get("/fembed/watch/:id/:label", async(req, res) => {
  
  
res.render("fembed.ejs", {req: req});


})

app.get("/proxy/fembed/:id/:label", async(req, res) => {
  const xge = await axios.post("https://fembed-hd.com/api/source/" + req.params.id);
  if(xge.data.success === "false") {
    return console.log(xge.data);
  }
  console.log(xge.data);
  let jso = xge.data;
   
  let url = jso.data.filter(obj => obj.label == req.params.label);
  



  // Stream the video chunk to the client
  
   axios.get(url[0].file, {
    responseType: 'stream'
  })
    .then((stream) => {
      res.writeHead(stream.status, stream.headers)
      stream.data.pipe(res)
    }) 
  
})

app.get("/watch/:id/:episode", async(req, res) => {
  var id = req.params.id;
  var episode = req.params.episode;
  let urlx = `${baseURL}${id}-episode-${episode}`;
  console.log(urlx)
  let ress = await axios.get(`${urlx}`);
  console.log("First stage done")
  let $ = cheerio.load(ress.data);
     link = new URL("https:" + $("li.anime").children("a").attr("data-video"));
  let result = await scrapeMP4(link);

  return res.render("index.ejs", { result: result });
  


})

app.get("/watch2/:id/:episode", async(req, res) => {
  var id = req.params.id;
  var episode = req.params.episode;
 var url = "https://animixplay.to/v1/" + id + "/ep" + episode;
  let xxx = await axios.get(url,{
    
  headers: {
                'User-Agent': USER_AGENT,
                
            }});
  let $$ = cheerio.load(xxx.data);
          
              let teid = $$("#epslistplace").text();
              console.log(teid);
 var ted = JSON.parse(teid)
         var link = ted.eptotal - 1;
   link = ted[link].split("##");

            
        var sid = link[0].replace("https://www.dailymotion.com/embed/video/", "");
  sid = sid.replace("?loop=true", "");
                
       var result;  
  let urlx = `https://www.dailymotion.com/player/metadata/video/${sid}`;
  console.log(urlx)
 rs(urlx, async function (error, response, body) {
 let ress = JSON.parse(body);
    console.log("First stage done")
  console.log(ress.url);
  console.log(ress.qualities);
     link = ress.qualities.auto;
  console.log(link)
   result =  await link.filter(obj => obj.type === "application\/x-mpegURL" );
  console.log(result[0].url)
   console.log(result);
   urls = new URL(result[0].url);
   console.log(urls.searchParams.get("sec"));
   console.log(urls)
   var urls = "https://www.dailymotion.com" + urls.pathname + "?sec=" + urls.searchParams.get("sec"); 
  return res.send("     <script src='https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js' type='text/javascript'> </script>  <link href='https://cdnjs.cloudflare.com/ajax/libs/plyr/3.5.6/plyr.css' rel='stylesheet'><div id='video' class='player iframe video-js vjs-default-skin vjs-skin-flat-grey vjs-big-play-centered vjs-16-9 vidstreaming_iframe'><script src='https://cdnjs.cloudflare.com/ajax/libs/plyr/3.5.6/plyr.min.js'></script><script src='https://cdn.jsdelivr.net/hls.js/latest/hls.js'></script>  <video preload='none' id='player' autoplay controls ></video> <script>var url = '" + urlx + "';var xhr = new XMLHttpRequest();xhr.open('GET', url);xhr.onreadystatechange = function () { if (xhr.readyState === 4) {   console.log(xhr.status);  console.log(xhr.responseText); }};xhr.send(); var video = document.querySelector('#player');if (Hls.isSupported()) { var hls = new Hls(); hls.loadSource('" + urls +"');hls.attachMedia(video); hls.on(Hls.Events.MANIFEST_PARSED,function() {  video.play(); }); }  hls.on(Hls.Events.ERROR, function (event, data) { var hls = new Hls(); hls.loadSource('" + urls +"'); hls.attachMedia(video);   });   const player = new Plyr('#player'); player.on('enterfullscreen', event => {  screen.orientation.lock('landscape');});player.on('exitfullscreen', event => { screen.orientation.lock('portrait');}); </script></div>")

});

})

async function scrapeMP42 (embedurl) {
  
}

const scrapeMP4 = async( serverUrl ) => {
let sources = []
  const goGoServerPage = await axios.get(serverUrl.href, { headers: { 'User-Agent': USER_AGENT } })
        const $$ = cheerio.load(goGoServerPage.data)

        const params = await generateEncryptAjaxParameters($$, serverUrl.searchParams.get('id'));


  console.log(params)
        const fetchRes = await axios.get(`
        ${serverUrl.protocol}//${serverUrl.hostname}/encrypt-ajax.php?${params}`, {
            headers: {
                'User-Agent': USER_AGENT,
                'Referer': serverUrl.href,
                'X-Requested-With': 'XMLHttpRequest'
            }
        })

        const res =  decryptEncryptAjaxResponse(fetchRes.data)

        if (!res.source) return { error: "No source found" };


 
        res.source_bk.forEach(source => sources.push(source))
 res.source.forEach(source => source.file.includes("m3u8") ? sources.push(source) : sources.push({
   file: ""
 }));
 
   let watch = sources[0].file;
   let sr2 = sources[1] && sources[1].file.includes("m3u8") ? sources[1].file : null;
  let sourcer;
   if(sr2) {
      sourcer = sr2;
   } else {
      sourcer = watch;
   }
        return {
            Referer: serverUrl.href,
            sources: watch,
            sources2: sr2,
          all: res.source,
           sourcer: sourcer
        }

   
 
    
}
app.get("/api/genre/:type/:page", (req, res) => {
  var results = [];
  var type = req.params.type;
  var page = req.params.page;
  if (isNaN(page)) {
    return res.status(404).json({ results });
  }
  url = `${baseURL}genre/${type}?page=${page}`;
  rs(url, (err, resp, html) => {
    if (!err) {
      try {
        var $ = cheerio.load(html);
        $(".img").each(function (index, element) {
          let title = $(this).children("a").attr().title;
          let id = $(this).children("a").attr().href.slice(10);
          let image = $(this).children("a").children("img").attr().src;

          results[index] = { title, id, image };
        });

        res.status(200).json({ results });
      } catch (e) {
        res.status(404).json({ e: "404 fuck off!!!!!" });
      }
    }
  });
});

app.get("/api/recentlyadded/:page", (req, res) => {
  var page = req.params.page;
  var results = [];
  if (isNaN(page)) {
    return res.status(404).json({ results });
  }
  url = `${baseURL}?page=${page}`;
  rs(url, (err, resp, html) => {
    if (!err) {
      try {
        var $ = cheerio.load(html);
        $(".img").each(function (index, element) {
          let title = $(this).children("a").attr().title;
          let id = $(this).children("a").attr().href.slice(1);
          let image = $(this).children("a").children("img").attr().src;
          let episodenumber = $(this)
            .parent()
            .children("p.episode")
            .text()
            .replace(" ", "-")
            .toLowerCase();
          id = id.replace("-" + episodenumber, "");
          episodenumber = episodenumber.replace("episode-", "");
          results[index] = { title, id, image, episodenumber };
        });

        res.status(200).json({ results });
      } catch (e) {
        res.status(404).json({ e: "404 fuck off!!!!!" });
      }
    }
  });
});

app.get("/api/genrelist", (req, res) => {
  var list = [];

  let url = baseURL;
  rs(url, (err, resp, html) => {
    if (!err) {
      try {
        var $ = cheerio.load(html);
        $("nav.genre")
          .children("ul")
          .children("li")
          .each(function (index, element) {
            list[index] = $(this).text();
          });

        res.status(200).json({ list });
      } catch (e) {
        res.status(404).json({ e: "404 fuck off!!!!!" });
      }
    }
  });
});

app.get("/api/list/:variable/:page", (req, res) => {
  var list = [];
  var page = req.params.page;

  if (isNaN(page)) {
    return res.status(404).json({ list });
  }
  var alphabet = req.params.variable;
  let url = `${baseURL}anime-list.html?page=${page}`;

  if (alphabet !== "all") {
    url = `${baseURL}anime-list-${alphabet}?page=${page}`;
  }

  rs(url, (err, resp, html) => {
    if (!err) {
      try {
        var $ = cheerio.load(html);
        $("ul.listing")
          .children("li")
          .each(function (index, element) {
            let title = $(this).children("a").text();

            let id = $(this).children("a").attr().href.slice(10);

            list[index] = { title, id };
          });

        res.status(200).json({ list });
      } catch (e) {
        res.status(404).json({ e: "404 fuck off!!!!!" });
      }
    }
  });
});

 app.listen(8000, () => { console.log("[vcodes.xyz]: Website running on 80 port.")});

module.exports = app;
