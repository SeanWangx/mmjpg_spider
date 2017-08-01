import request from 'request'
import cheerio from 'cheerio'
import Iconv from 'iconv-lite'

const fetchAlbumDetail = url => {
  return new Promise((resolve, reject) => {
    request({
      url: url,
      encoding: null
    }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        let $ = cheerio.load(Iconv.decode(body, 'gb2312').toString())
        let $img = $('#content > a > img')
        if ($img) {
          console.log($img)
          resolve()
        } else {
          reject('unable to fetch album detail')
        }
      } else {
        reject(error)
      }
    })
  })
}

export default fetchAlbumDetail
