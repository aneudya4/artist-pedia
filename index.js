function watchForm() {
  $('form').on('submit', (event) => {
    event.preventDefault();
    const artistName = $('input').val();
    if (artistName.trim() === '') {
      $('input').val('');
      alert('input cant be empty');
    } else {
      $('.artist-details').fadeIn();
      $('.landing').hide();
      isLoading();
      // sets loading to show when fetching information
      showHideAlbumsOrEvents();
      fetchArtistInfo(artistName);
      $('input').val('');

      // sets input value back to empty
    }
  });
}

function isLoading() {
  $('.nav ul li').removeClass('selected-view');
  $('.albums').addClass('selected-view');
  $('.loader').toggleClass('hide-content');
  $('.albums-container').show();
  $('.events-container').hide();
  $('footer').toggleClass('hide-content');
  // hiding footer so it wont show while content is loading ,

  //   shows or hide loader-spinner
}

function fetchArtistInfo(artistName) {
  const url = config.audiodbArtistBaseURL + artistName;
  $('.artist-details').find('.error-message').remove();
  // clear message if there is an attempt after a request failure

  $('.artist-details').hide();
  $('.nav').hide();
  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }

      throw new Error(response.statusText);
    })
    .then((JsonResponse) => {
      renderArtistInfo(JsonResponse, artistName);
    })
    .catch((err) => {
      isLoading();
      errorMessage(err);
    });
}

function fetchArtistAlbums(artistName) {
  $('.artist-details').hide();
  const url = config.audiodbAlbumsBaseURL + artistName;
  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((JsonResponse) => {
      const sortedAlbums = JsonResponse.album.sort(
        (a, b) => parseInt(a.intYearReleased) - parseInt(b.intYearReleased)
      );
      //  sorting albums from old-new
      renderArtistAlbums(sortedAlbums, artistName);
    })
    .catch((err) => {
      errorMessage(err);
    });
}

function fetchArtistEvent(artistName) {
  $('.artist-details').hide();
  const url = config.ticketMasterBaseURL + artistName;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => {
      isLoading();
      renderArtistEvents(responseJson._embedded, artistName);
    })
    .catch((err) => {
      $('.artist-data').hide();
      // hiding the  data ,since albums takes longer to fetch  they were rendering after the function was done
      // added a settimeout inside the function
      isLoading();
      errorMessage();
    });
}

function renderArtistInfo(artistInfo, artistName) {
  const { artists } = artistInfo;
  if (!artists) {
    $('.artist-details').show();

    $('.artist-info').css('height', '76vh');
    // this  css makes the footer to stay in the bottom if there is no data to render
    $('.artist-data').empty();
    $('.nav').hide();
    notResultsFound(
      $('.artist-info'),
      `We could not find information about ${artistName}`
    );
  } else {
    $('.artist-info').empty();
    $('.nav').show();
    $('.artist-info').css('height', 'auto');

    const bio = formatBioText(artists[0].strBiographyEN);
    const artistData = `
           <div class='img-container'>
              <img src=${artists[0].strArtistThumb} alt="${artists[0].strArtist}">
           </div>
           <div class='bio'>
           <h2>${artists[0].strArtist}</h2>
           <p><i class="fas fa-map-marker-alt"></i>${artists[0].strCountry}</p>
           <p><i class="fas fa-headphones-alt"></i><span>Genre:${artists[0].strStyle}<span></p>
           <p><i class="far fa-address-book"></i>${bio}</p>
           <span>
           <a target="_blank" href="http://${artists[0].strTwitter}">
           <i class="fab fa-twitter"></i>
           </a>
           </span>
           <span>
           <a target="_blank" href="//${artists[0].strWebsite}">
           Website
           </a>
           </span>
           </div>
           `;
    $('.artist-info').append(artistData);
    fetchArtistAlbums(artists[0].strArtist);
    fetchArtistEvent(artists[0].strArtist);
  }
}

// reducing the text characters count , api sometimes sends text too large
function formatBioText(text) {
  const firstIndex = text.indexOf('.');
  const secondIndex = text.indexOf('.', firstIndex + 1);
  return text.substring(0, secondIndex + 1);
}

function renderArtistAlbums(albums, artistName) {
  $('.artist-details').fadeIn();
  if (!albums) {
    isLoading();
    $('.albums-container').css('display', 'block');
    notResultsFound(
      $('.albums-container'),
      `${artistName} has no albums to show`
    );
  } else {
    $('.albums-container').empty();
    for (let i = 0; i < albums.length; i++) {
      const img = albums[i].strAlbumThumb || './assets/img-placeholder.webp';
      const albumElement = `
             <div class='album-img'>
                <img src=${img} alt="${albums[i].strArtist}">
                <div class='album-title'>
                 <p class=${
                   albums[i].strAlbumStripped.length <= 45 ? 'small-title' : ''
                 }>${albums[i].strAlbumStripped}</p>
                <p>Release Year:${
                  albums[i].intYearReleased == 0
                    ? 'N/A'
                    : albums[i].intYearReleased
                }</p>
                </div>

             </div>
            `;
      $('.albums-container').append(albumElement);
    }
  }
}

function renderArtistEvents(allEvents, artistName) {
  $('.events-container ul').empty();

  if (!allEvents) {
    isLoading();
    notResultsFound(
      $('.events-container'),
      `${artistName} has no upcoming events`
    );
  } else {
    $('.events-container').children('.no-results-found').remove();
    const { events } = allEvents;
    for (let i = 0; i < events.length; i++) {
      const { dates, name, url, _embedded, images } = events[i];
      // checks if properties are present in event obejct
      if (_embedded && name && url && dates) {
        const highQualityImg = images.find((img) => img.width > 500);
        const imgUrl = highQualityImg
          ? highQualityImg.url
          : './assets/img-placeholder.webp';
        // place holder img in case img is not found
        const date = formatDate(dates.start.localDate);
        const liElement = `
                <li>
                    <img src=${imgUrl} alt="${name}">
                        <p>${name}</p>
                        <p><a href=${url} target="_blank">Buy Tickets</a></p>
                        <p>${_embedded.venues[0].name || 'N/A'} </p>
                        <p>
                        <span> ${_embedded.venues[0].city.name || 'N/A'}</span>
                        <span> ${
                          _embedded.venues[0].country.name || 'N/A'
                        }</span>
                        </p>
                     <p> Date: ${date} </p>
                     <p> Status:${dates.status.code} </p>
  
                </li>
                `;
        $('.events-container ul').append(liElement);
      }
    }
  }
}

function formatDate(date) {
  const dateArr = date.split('-');
  const newDateFormat = `${dateArr[1]}/${dateArr[2]}/${dateArr[0]}`;
  return newDateFormat;
}

function showHideAlbumsOrEvents() {
  $('.nav ul li').on('click', function () {
    $('.nav ul li').removeClass('selected-view');
    $(this).addClass('selected-view');
    if ($(this).hasClass('events')) {
      $('.albums-container').fadeOut();
      $('.events-container').fadeIn();
    } else {
      $('.albums-container').fadeIn();
      $('.events-container').fadeOut();
    }
  });
}

function notResultsFound(parentElement, errMessage) {
  $('.artist-data').show();
  parentElement.children('.no-results-found').remove();
  // removing in case  there was elements before
  isLoading();
  const notFoundImg = parentElement.hasClass('artist-info')
    ? './assets/not-found.svg'
    : './assets/no-data.svg';

  parentElement.append(`<div class='no-results-found'>
          <p>${errMessage}</p>
          <img src=${notFoundImg}>
      </div>`);
}

function errorMessage() {
  // error message will show if any of the  GET request failes
  // $('.artist-details').find('.error-message').remove();
  $('.nav').hide();

  setTimeout(() => {
    $('.artist-details').find('.error-message').remove();

    $('.artist-data').empty();
    $('.artist-details').show();
    $('.nav').hide();
    $('.artist-details').append(`
        <div class='error-message'>
        <p>Something went wrong ,please try again later!</p>
        <img src='./assets/error_message.svg'>
        </div>
        `);
  }, 1500);
}

$(watchForm);
