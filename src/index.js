import './css/styles.css';
import 'simplelightbox/dist/simple-lightbox.min.css';
import PixabayApi from './js/services/pixabayApi';
import GalleryCardsBuilder from './js/ui/galleryCardsBuilder';
import SimpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('.search-form__input'),
  button: document.querySelector('.search-form__button'),
  gallery: document.querySelector('.gallery'),
};

const pixabay = new PixabayApi();
const builder = new GalleryCardsBuilder();
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

let inputEmpty = true;

refs.form.addEventListener('submit', onFormSubmit);
refs.input.addEventListener('input', onInput);
refs.button.addEventListener('click', onButtonClick);
refs.button.addEventListener('mouseleave', onButtonMouseLeave);

function onInput(event) {
  if (event.target.value.trim()) {
    inputEmpty = false;
    refs.button.removeAttribute('disabled');
  } else {
    inputEmpty = true;
    refs.button.setAttribute('disabled', 'disabled');
  }
}

function onButtonClick() {
  refs.button.classList.add('search-form__button--focus');
}

function onButtonMouseLeave() {
  unfocusButton();
}

function unfocusButton() {
  refs.button.classList.remove('search-form__button--focus');
}

async function onFormSubmit(event) {
  event.preventDefault();

  if (inputEmpty) {
    return;
  }

  refs.gallery.innerHTML = '';

  const query = event.target.elements.searchQuery.value;

  try {
    const data = await pixabay.loadImages(query);

    console.dir(data);

    if (data.totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      return;
    }

    Notify.success(`'Hooray! We found ${data.totalHits} images.'`);
    buildGallery(data);
    lightbox.refresh();

    setTimeout(unfocusButton, 500);
  } catch (error) {
    console.error(error);
  }
}

function buildGallery(data) {
  const markup = builder.buildCards(data.hits);

  refs.gallery.innerHTML = markup;
}
