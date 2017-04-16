var fs = require('fs');  
var path = require('path');  
var request = require('request');
var cheerio = require('cheerio');

const ROOT_URL = 'http://www.mmjpg.com';
var url_query = [];
var done_query = [];
const mmjpg = './mmjpg/';

function getImageAsync(url) {
    return new Promise(function(resolve, reject){
        request({url: url, gzip: true}, (error, response, body) => {
            if(!error && response.statusCode === 200) {
                let $ = cheerio.load(body);
                let src = $('#content > a > img').attr('src');
                let tmp = src.split('/');
                let fileName = tmp[tmp.length - 1];
                //console.log(src);
                //resolve(src);
                request.head(src, function(err, res, body) {
                    request(src).pipe(fs.createWriteStream(mmjpg+fileName));
                    console.log('图片'+fileName+'下载成功！');
                    resolve();
                });
            }
            reject(error);
        });
    });
}

let tasks = [];
const example = 'http://www.mmjpg.com/mm/900/';
for(var i = 1; i < 37; i++) {
    tasks.push(getImageAsync(example+i));
}
Promise.all(tasks).then(function(){
    console.log('done!');
}).catch(function(error) {
    console.log(error);
});

























function fetchURL(url) {
    return new Promise(function(resolve, reject) {
        request({url: url, gzip: true}, (error, response, body) => {
            let query = [];
            if(!error && response.statusCode === 200) {
                let $ = cheerio.load(body);
                let $a = $('a');
                $a.each(function() {
                    let href = $(this).attr('href')
                    if(href && href.indexOf(ROOT_URL) != -1 && !contains(query, href)) {
                        query.push(href);
                        if(!contains(url_query, href)) {
                            url_query.push(href);
                        }
                    }
                });
            }
            resolve(query);
        });
    });
    /*request({
        url: url,
        gzip: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            if(url.indexOf(ROOT_URL+'/mm/') != -1){
                mkdir('./mmjpg/', $('title').text());
            }
            var $a = $('a');
            $a.each(function(){
                if($(this).attr('href').indexOf(ROOT_URL) != -1) {
                    var href = $(this).attr('href');
                    if(!contains(done_query, href) && !contains(url_query, href)) { // 判断url是否已经被抓取过
                        url_query.push(href);
                    }
                }
            })
        }
        done_query.push(url); // 加入已抓取url数组中
    });*/
}

function contains(array, value) {
    for(var i = 0; i < array.length; i++) {
        if(value === array[i]) {
            return true;
        }
    }
    return false;
}

function mkdir(path, dirname) {
    fs.access(path+dirname, fs.constants.F_OK, function(err) {
        if (err) {
            // console.log(err);
            fs.mkdir(path+dirname);
            // console.log('文件夹 <'+dirname+'> 创建完毕！');
        } else {
            // console.log('directory exists!');
        }
    })
}

/*fetchURL(ROOT_URL).then((value) => {
    console.log(url_query.length);
    let tasks = [];
    for(var i = 0; i < value.length; i++) {
        tasks.push(fetchURL(value[i]));
    }
    Promise.all(tasks).then(function() {
        console.log(url_query.length);
        console.log(url_query);
    });
});*/
