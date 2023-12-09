import { Notify } from 'notiflix';
import { fetchSearch } from './api.js';
import { createMarkup } from './createMarkup.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'material-icons/iconfont/material-icons.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const galleryLightBox = new SimpleLightbox('.gallery a');

let observer;
let currentImages = []; // Массив текущих изображений в галерее
let currentObserveElem;

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

// =========== Observer ===========
function setupObserver() {
  let options = {
    root: null, // область просмотра - весь вьюпорт
    rootMargin: '0px',
    threshold: 1,
  };

  observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        getData(query, nextPage);
      }
    });
  }, options);
}

function updateObserver() {
  if (currentImages.length > 0) {
    // Отмена наблюдения за старым элементом
    unObserve(currentObserveElem);
  }

  currentImages = document.querySelectorAll('.gallery img'); // Обновление списка изображений
  let targetIndex = Math.floor(currentImages.length * 0.75); // 75% от текущего количества изображений
  currentObserveElem = currentImages[targetIndex];
  observer.observe(currentObserveElem); // Начало наблюдения за новым элементом
}

function unObserve(elem) {
  observer.unobserve(elem);
}

setupObserver();
// ============ end of Observer =============

const onSubmitForm = async e => {
  e.preventDefault();

  gallery.innerHTML = '';

  query = e.target.elements.searchQuery.value;
  if (!query) {
    Notify.failure('Please, enter search text');
  } else {
    shouldLoad = true;
    nextPage = 1;
    currentImages = [];

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
      const markup = createMarkup(data.hits);
      gallery.insertAdjacentHTML('beforeend', markup);

      galleryLightBox.refresh();

      updateObserver();

      if (page === 1) {
        maxPages = Math.ceil(data.totalHits / per_page);
        Notify.success(`Hooray! We found ${data.totalHits} images`);
      }
    }

    nextPage++;

    // Если мы увидели, что контент закончился,
    // отмечаем, что больше запрашивать ничего не надо:
    if (nextPage > maxPages) {
      shouldLoad = false;
      unObserve(currentObserveElem);
    }
  } else {
    Notify.failure('Error connection...');
  }
  // Когда запрос выполнен и обработан,
  // снимаем флаг isLoading:
  isLoading = false;
}

form.addEventListener('submit', onSubmitForm);
