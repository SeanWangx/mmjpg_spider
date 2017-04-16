var fs = require('fs');  
var path = require('path');  
var request = require('request');
var cheerio = require('cheerio');

const ROOT_URL = 'http://www.mmjpg.com/';

request(ROOT_URL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // console.log(body);    //返回请求页面的HTML
        var $ = cheerio.load(body);
        console.log($('title').text());
        //fs.mkdir('./'+$('title').text());
        var $a = $('a');
        $a.each(function(){
            if($(this).attr('href').indexOf(ROOT_URL) != -1) {
                console.log($(this).attr('href'));
            }
        })
    }
});

function fetchURL(url) {
    
}