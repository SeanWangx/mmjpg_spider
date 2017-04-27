var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

const ROOT_URL = 'http://www.mmjpg.com';
const SAVE_PATH = './mmjpg';
let search_queue = [ ROOT_URL ];
let image_queue = [];
let picNum = 0;

/**
 * 工具函数 mkdir
 * 用于判断文件家是否存在，不存在则创建
 * @param path 文件夹路径
 * @param dirName 待创建文件夹名称
 */
function mkdir( path, dirName ) {
    fs.access( path + '/' + dirName, fs.constants.F_OK, ( err ) => {
        if ( err ) {
            fs.mkdir( path + '/' + dirName );
        }
    });
}

/**
 * 工具函数 contains
 * @param arr 数组
 * @param val 待判断的值
 * @returns 包含为true， 不包含为false
 */
function contains( arr, val ) {
    for( var i = 0; i < arr.length; i++ ) {
        if( val === arr[i] ) {
            return true;
        }
    }
    return false;
}

/**
 * 工具函数 站内链接判断
 * @author SeanWangx
 * @param url
 */
function checkRangeIn( url ) {
    let regexp = /http:\/\/www.mmjpg.com.?/;
    return regexp.test( url );
}

/**
 * 工具函数 站内相册链接判断
 * @author SeanWangx
 * @param url
 */
function checkAlbumUrl( url ) {
    let regexp = /http:\/\/www.mmjpg.com\/mm\/\d+$/;
    return regexp.test( url );
}

/**
 * 异步获取相册图片
 * @param imageUrl 相册图片访问路径
 * @param savaPath 图片保存地址
 */
function saveImageAsync( imageUrl, savePath ) {
    return new Promise( function( resolve, reject ) {
        request( { url: imageUrl, gzip: true }, ( error, response, body ) => {
            if( !error && response.statusCode === 200 ) {
                let $ = cheerio.load( body );
                let src = $( '#content > a > img' ).attr( 'src' );
                let regexp = /\/(\d+\.[a-zA-Z]+)$/g;
                let tmp = regexp.exec( src );
                let imageName = tmp.length === 2 ? tmp[1] : null;
                if( imageName ) {
                    request.head( src, function( err, res, body ) {
                        request( src ).pipe( fs.createWriteStream( savePath + '/' + imageName ).on( 'close', function() {
                            picNum = picNum + 1;
                            resolve();
                        }) );
                    });
                } else {
                    reject( 'Get image name failed ... ' + imageUrl );
                }
            } else {
                reject( 'Request from image url failed ... ' + imageUrl );
            }
        });
    });
}

/**
 * 保存相册照片，异步处理
 */
async function getImageUrlAsync( dirName, page, albumUrl ) {
    mkdir( SAVE_PATH, dirName );
    try {
        for( var i = 1; i <= page; i++ ) {
            await saveImageAsync( albumUrl + '/' + i, SAVE_PATH + '/' + dirName );
        }
    } catch ( error ) {
        console.log( error );
    }
}

/**
 * 根据相册首页获取相册信息：相册名称、图片数量、首页链接
 * @author SeanWangx
 * @param albumUrl 相册首页链接
 * @returns  {
                'name': albumName,
                'page': page,
                'url': albumUrl
            }
 */
function getAlbumInfo( albumUrl ) {
    return new Promise( (resolve, reject ) => {
        request( { url: albumUrl, gzip: true }, ( error, response, body ) => {
            if( !error && response.statusCode === 200 ) {
                let $ = cheerio.load( body );
                let albumName = $( 'div.article > h2' ).text();
                let page = parseInt($( '#opic' ).prev().text());
                if( null != page && null != albumName ) {
                    let info = {
                        'name': albumName,
                        'page': page,
                        'url': albumUrl
                    }
                    resolve( info );
                } else {
                    reject( 'Get album infomation failed ... ' + albumUrl );
                }
            } else {
                reject( 'Request from album url failed ... ' + albumUrl );
            }
        });
    });
}

/**
 * 获取链接地址附属地址函数
 * @param url 初始路径
 */
function fetchURL( url ) {
    return new Promise( function( resolve, reject ) {
        request( { url: url, gzip: true }, ( error, response, body ) => {
            let tmp_queue = [];
            if( !error && response.statusCode === 200 ) {
                let $ = cheerio.load( body );
                let $a = $( 'a' );
                $a.each( function() {
                    let href = $( this ).attr( 'href' );
                    if( href && checkRangeIn( url ) ) { // 属于站内链接
                        if( !contains( tmp_queue, href ) ) { // 临时去重
                            if( !contains( search_queue, href ) ) { // 搜索去重
                                tmp_queue.push( href ); // 添加到本地队列
                                search_queue.push( href ); // 添加到全局队列
                                if( checkAlbumUrl( href ) && !contains( image_queue, href ) ) {
                                    image_queue.push( href );
                                }
                            }
                        }
                    }
                } );
                resolve( tmp_queue.length );
            } else {
                reject( 'error url:' + url );
            }
        } );
    } );
}

/**
 * 开始函数
 */
function start() {
    mkdir('.', 'mmjpg');
    var d = new Promise( ( resolve, reject ) => {
        resolve();
    } );

    let circle = 0;

    function stepFirst( def ) {
        def.then( function() {
            return fetchURL( search_queue[circle] );
        } ).then( function( value ) {
            circle = circle + 1;
            if(circle != search_queue.length) {
                if( circle < 100 ) {
                    stepFirst(def);
                } else {
                    console.log( 'image queue: ' + image_queue.length );
                    circle = 0;
                    stepSecond( d );
                }
            } else {
                console.log(search_queue.length);
            }
        }).catch( function( error ) {
            console.log( error );
            circle = circle + 1;
            if( circle != search_queue.length ) {
                stepFirst( def );
            }
        });
    };

    function stepSecond( def ) {
        def.then( function() {
            return getAlbumInfo( image_queue[ circle ] );
        }).then( value => {
            console.log( value.name);
            return getImageUrlAsync( value.name, value.page, value.url );
        }).then( () => {
            circle = circle + 1;
            if( circle != image_queue.length) {
                stepSecond( def );
            } else {
                console.log( 'Completed ... ' + picNum );
            }
        }).catch( error => {
            console.log( error );
            circle = circle + 1;
            if( circle != image_queue.length ) {
                stepSecond( def );
            }
        });
    }

    stepFirst( d );

}

start();
