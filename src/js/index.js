import { Notify } from 'notiflix';
import { fetchSearch } from './api.js';
import { createMarkup } from './createMarkup.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'material-icons/iconfont/material-icons.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const galleryLightBox = new SimpleLightbox('.gallery a');

let query;
let per_page = 40;
let nextPage = 1;
let maxPages = 0;

let isLoading = false;
let shouldLoad = true;

Notify.init({
  width: '300px',
  fontSize: '20px',
  timeout: 3000,
});

const onSubmitForm = async e => {
  e.preventDefault();

  shouldLoad = true;
  nextPage = 1;
  gallery.innerHTML = '';

  query = e.target.elements.searchQuery.value;
  if (!query) {
    Notify.failure('Please, enter search text');
  } else {
    getData(query, 1);
  }
};

async function getData(query, page) {
  // Если мы уже отправили запрос, или новый контент закончился,
  // то новый запрос отправлять не надо:
  if (isLoading || !shouldLoad) return;

  // Предотвращаем новые запросы, пока не закончится этот:
  isLoading = true;

  const data = await fetchSearch(query, page, per_page);
  if (data) {
    if (data.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      if (page === 1) {
        maxPages = data.totalHits / per_page;
        Notify.success(`Hooray! We found ${data.totalHits} images`);
      }
      const markup = createMarkup(data.hits);
      // console.log(markup);
      // gallery.innerHTML = markup;
      gallery.insertAdjacentHTML('beforeend', markup);

      galleryLightBox.refresh();
    }
  } else {
    Notify.failure('Error connection...');
  }

  nextPage++;

  // Если мы увидели, что контент закончился,
  // отмечаем, что больше запрашивать ничего не надо:
  if (nextPage > maxPages) shouldLoad = false;

  // Когда запрос выполнен и обработан,
  // снимаем флаг isLoading:
  isLoading = false;
}

function checkPosition() {
  // Нам потребуется знать высоту документа и высоту экрана:
  const height = document.body.offsetHeight;
  const screenHeight = window.innerHeight;

  // Записываем, сколько пикселей пользователь уже проскроллил:
  const scrolled = window.scrollY;

  // Обозначим порог, по приближении к которому
  // будем вызывать какое-то действие.
  // В нашем случае — четверть экрана до конца страницы:
  const threshold = height - screenHeight / 4;

  // Отслеживаем, где находится низ экрана относительно страницы:
  const position = scrolled + screenHeight;

  if (position >= threshold && query) {
    // Если мы пересекли полосу-порог, вызываем нужное действие.
    getData(query, nextPage);
  }
}

function throttle(callee, timeout) {
  let timer = null;

  return function perform(...args) {
    if (timer) return;

    timer = setTimeout(() => {
      callee(...args);

      clearTimeout(timer);
      timer = null;
    }, timeout);
  };
}

(() => {
  window.addEventListener('scroll', throttle(checkPosition, 250));
  window.addEventListener('resize', throttle(checkPosition, 250));
})();

form.addEventListener('submit', onSubmitForm);
