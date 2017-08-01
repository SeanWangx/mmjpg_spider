import fetchAlbumList from './FetchAlbumList'

const PAGE_URL = 'http://www.mmjpg.com/home/2'

fetchAlbumList(PAGE_URL).then(response => {
  console.log('fetch album list success')
  console.log(response)
}).catch(error => {
  console.log('fetch album list fail', error)
})
