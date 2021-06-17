const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
const movies = [] //電影總清單
let filteredMovies = [] //搜尋清單
let currentPage = 1


//節點
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const movieListButton = document.querySelector('#list-button')
const movieCardButton = document.querySelector('#card-button')
const modalTitle = document.querySelector('#movie-modal-title')
const modalImage = document.querySelector('#movie-modal-image')
const modalDate = document.querySelector('#movie-modal-date')
const modalDescription = document.querySelector('#movie-modal-description')
const modalContent = document.querySelector('.modal-content')

//事件監聽
//監聽 more & +按鈕
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {

    modalContent.innerHTML = `<div class="d-flex justify-content-center align-items-center vh-100">
  <div class="spinner-border" style="width: 8rem; height: 8rem" role="status">
    <span class="sr-only ">Loading...</span>
  </div>
</div>`
    showMovieModal(event.target.dataset.id)

  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  } 
})

//監聽分頁按鈕
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  currentPage = Number(event.target.dataset.page)

  if (dataPanel.children[0].dataset.form === "List") {
    renderMovieListMode(getMoviesByPage(currentPage))
  }
  else { renderMovieCardMode(getMoviesByPage(currentPage)) }
})

//監聽search bar
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  
  if (dataPanel.children[0].dataset.form === "List") {
    renderMovieListMode(getMoviesByPage(1))
  }
  else { renderMovieCardMode(getMoviesByPage(1)) }
})

//監聽list-button
movieListButton.addEventListener('click', function ListButtonClicked() {
  // showUserListMode(movies)
  renderMovieListMode(getMoviesByPage(currentPage))
})

//監聽card-button
movieCardButton.addEventListener('click', function cardButtonClicked() {
  renderMovieCardMode(getMoviesByPage(currentPage))
})

// send request to index api
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieCardMode(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

  

//function
//渲染MovieCardMode
function renderMovieCardMode(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image, id
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id
      }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//渲染分頁數
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount /  MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" data-page = ${page} href="#">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

//藉由頁數得到Movie的陣列
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page-1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//顯示MovieModal資訊
function showMovieModal(id) {
  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
  const data = response.data.results
  // insert data into modal ui
  modalContent.innerHTML = ` 
        <div class="modal-header">
          <h5 class="modal-title" id="movie-modal-title">${data.title}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body" id="movie-modal-body">
          <div class="row">
            <div class="col-sm-8" id="movie-modal-image">
              <img src="${POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">
            </div>
            <div class="col-sm-4">
              <p><em id="movie-modal-date">release date: ${data.release_date}</em></p>
              <p id="movie-modal-description">${data.description}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">
            Close
          </button>
        </div>
        `
  })
}

//將movie加入Favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//function顯示ListMode
function renderMovieListMode(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
    <div class="col-12 d-flex flex-row align-items-center mb-3 border-top pt-3" data-form="List">
      <div class="movie-name col-8">
        <h5>${item.title}</h5>
      </div>
      <div class="button col-4">
        <button type="button" class="btn btn-primary mr-1 btn-show-movie " data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
        <button type="button" class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}








