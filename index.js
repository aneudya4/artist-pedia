function watchForm() {
  $('form').on('submit', (event) => {
    event.preventDefault();
    isLoading();
    // sets loading to show when fetching information
    const artistName = $('input').val();
    fetchArtistInfo(artistName);
    $('input').val('');
    // sets input value back to empty
  });
}

function isLoading() {
  $('.loader').toggleClass('show-loader');
  $('.artist-details').toggleClass('show-loader');
  //   shows or hide loader
}

function fetchArtistInfo(artistName) {
  const url = `https://theaudiodb.com/api/v1/json/1/search.php?s=${artistName}`;
  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }

      throw new Error(response.statusText);
    })
    .then((JsonResponse) => {
      renderArtistInfo(JsonResponse);
    })
    .catch((err) => errorMessage(err));
}

function renderArtistInfo(artistInfo) {
  const { artists } = artistInfo;
  if (!artists) {
    isLoading();
    $('.artist-data').empty();
    $('.nav').addClass('hide-nav');
    notResultsFound($('.artist-info'), 'Artist not found');
  } else {
    $('.artist-info').empty();
    $('.nav').removeClass('hide-nav');
    $('.albums-container').removeClass('hide-content');
    $('.events-container').addClass('hide-content');
    const bio = formatBioText(artists[0].strBiographyEN);
    const artistData = `
          
           <div class='img-container'>
              <img src=${artists[0].strArtistFanart}>
           </div>
          
           <div class='bio'>
           <h2>${artists[0].strArtist}</h2>
           <p>${bio}</p>
           </div>
           
           `;
    $('.artist-info').append(artistData);
    fetchArtistAlbums(artists[0].strArtist);
  }
}

function fetchArtistAlbums(artistName) {
  const url = `https://theaudiodb.com/api/v1/json/1/searchalbum.php?s=${artistName}`;
  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((JsonResponse) => {
      renderArtistAlbums(JsonResponse);
    })
    .catch((err) => errorMessage(err));
}

function renderArtistAlbums(albums) {
  const { album } = albums;

  if (!album) {
    isLoading();
    notResultsFound($('.albums-container'), 'Artist has no albums to show');
  } else {
    $('.albums-container').empty();
    let imgPlaceholder =
      'https://www.winksjewelry.com/wp-content/themes/winks/media/product-placeholder.jpg';
    for (let i = 0; i < album.length; i++) {
      const albumElement = `
             <div class='album-img'>
                <img src=${album[i].strAlbumThumb || imgPlaceholder}> 
                <p>${album[i].strAlbumStripped} <span>${
        album[i].intYearReleased
      }</span></p>
        
             </div>
            `;
      $('.albums-container').append(albumElement);
    }
    isLoading();
  }
}

function formatBioText(text) {
  const firstIndex = text.indexOf('.');
  const secondIndex = text.indexOf('.', firstIndex + 1);
  return text.substring(0, secondIndex + 1);
}

function notResultsFound(parentElement, errMessage) {
  const notFoundImg = parentElement.hasClass('artist-info')
    ? '/assets/not-found.svg'
    : '/assets/no-data.svg';
  parentElement.append(`<div class='no-results-found'>
          <p>${errMessage}</p>
          <img src=${notFoundImg}>
      </div>`);
}
$(watchForm);
