function watchForm() {
  $('form').on('submit', (event) => {
    event.preventDefault();
    $('.artist-details').show();
    $('.landing').hide();
    isLoading();
    // sets loading to show when fetching information
    const artistName = $('input').val();
    showHideAlbumsAndEvents();
    fetchArtistInfo(artistName);
    $('input').val('');
    // sets input value back to empty
  });
}

function isLoading() {
  $('.nav ul li').removeClass('selected-view');
  $('.albums').addClass('selected-view');
  $('.loader').toggleClass('hide-content');
  $('.albums-container').show();
  $('.events-container').hide();
  //   shows or hide loader
}

function fetchArtistInfo(artistName) {
  const url = `https://theaudiodb.com/api/v1/json/1/search.php?s=${artistName}`;
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
    .catch((err) => errorMessage(err));
}

function fetchArtistAlbums(artistName) {
  $('.artist-details').hide();
  const url = `https://theaudiodb.com/api/v1/json/1/searchalbum.php?s=${artistName}`;
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
      renderArtistAlbums(sortedAlbums, artistName);
    })
    .catch((err) => {
      isLoading();
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
      // hiding the  data since albums takes longer to fetch  they were rendering after the function was done
      // added a settimeout inside  the function
      errorMessage();
    });
}

function renderArtistInfo(artistInfo, artistName) {
  const { artists } = artistInfo;
  if (!artists) {
    $('.artist-details').show();
    $('.artist-data').empty();
    $('.nav').hide();
    notResultsFound(
      $('.artist-info'),
      `We could not find information about ${artistName}`
    );
  } else {
    $('.artist-info').empty();
    $('.nav').show();

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

function formatBioText(text) {
  const firstIndex = text.indexOf('.');
  const secondIndex = text.indexOf('.', firstIndex + 1);
  return text.substring(0, secondIndex + 1);
}
function renderArtistEvents(allEvents, artistName) {
  $('.events-container ul').empty();
  if (!allEvents) {
    isLoading();
    notResultsFound(
      $('ul.artist-data'),
      `${artistName} has no upcoming events`
    );
  } else {
    const { events } = allEvents;
    for (let i = 0; i < events.length; i++) {
      const { dates, images, name, url, _embedded } = events[i];
      const date = new Date(dates.start.dateTime);
      const formatDate = `${date.getUTCMonth()}/${date.getUTCDay()}/${date.getUTCFullYear()}`;
      const liElement = `
              <li>
                  <img src=${images[6].url} alt="${name}">
                      <p>${name}</p>
                      <p><a href=${url} target="_blank">Buy Tickets</a></p>
                      <p>${_embedded.venues[0].name} </p> 
                      <p>
                      <span> ${_embedded.venues[0].city.name}</span> 
                      <span> ${_embedded.venues[0].country.name}</span> 
                      </p> 
                   <p> Date: ${formatDate} </p> 
                   <p> Status:${dates.status.code} </p> 
                   
              </li>
              `;
      $('.events-container ul').append(liElement);
    }
  }
}

function renderArtistAlbums(albums, artistName) {
  $('.artist-details').show();
  if (!albums) {
    isLoading();
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
                 <p>${albums[i].strAlbumStripped} </p>
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

function showHideAlbumsAndEvents() {
  $('.nav ul li').on('click', function () {
    $('.nav ul li').removeClass('selected-view');
    $(this).addClass('selected-view');
    if ($(this).hasClass('events')) {
      $('.albums-container').hide();
      $('.events-container').show();
    } else {
      $('.albums-container').show();
      $('.events-container').hide();
    }
  });
}

function notResultsFound(parentElement, errMessage) {
  $('.artist-data').show();
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
  $('.artist-details').find('.error-message').remove();
  $('.nav').hide();

  setTimeout(() => {
    isLoading();
    $('.artist-data').empty();
    $('.artist-details').show();
    $('.nav').hide();
    $('.artist-details').append(`
        <div class='error-message'>
        <p>Something went wrong ,please try again later!</p>
        <img src='./assets/error_message.svg'>
        </div>
        `);
  }, 1000);
}

$(watchForm);
