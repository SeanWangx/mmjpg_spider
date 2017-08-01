import request from 'request'
import cheerio from 'cheerio'
import Iconv from 'iconv-lite'

/**
 * 获取单页相册列表
 * @param {*} url 单页链接
 */
const fetchAlbumList = url => {
  return new Promise((resolve, reject) => {
    request({
      url: url,
      encoding: null
    }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        let $ = cheerio.load(Iconv.decode(body, 'gb2312').toString())
        let $list = $('.main > .pic > ul > li > span > a')
        if ($list) {
          let res = Object.keys($list).reduce((arr, item) => {
            if ($list[item]['attribs']) {
              arr.push($list[item]['attribs']['href'])
            }
            return arr
          }, [])
          resolve(res)
        } else {
          reject('unable to fetch album list')
        }
      } else {
        reject(error)
      }
    })
  })
}

export default fetchAlbumList
