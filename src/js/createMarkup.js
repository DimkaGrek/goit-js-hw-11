const createPhotoCard = image => {
  return `
    <a href="${image.largeImageURL}">
    <div class="photo-card">
    <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" height="390"/>
    <div class="info">
      <p class="info-item">
        <b>Likes</b><br/>
        ${image.likes}
      </p>
      <p class="info-item">
        <b>Views</b><br/>
        ${image.views}
      </p>
      <p class="info-item">
        <b>Comments</b><br/>
        ${image.comments}
      </p>
      <p class="info-item">
        <b>Downloads</b><br/>
        ${image.downloads}
      </p>
    </div>
  </div>
  </a>
      `;
};

export const createMarkup = images => {
  let markup = '';
  images.forEach(image => {
    markup += createPhotoCard(image);
  });
  return markup;
};
