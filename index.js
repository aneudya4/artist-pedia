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
  $('.events').removeClass('selected-view');
  $('.albums').addClass('selected-view');
  $('.loader').toggleClass('show-loader');
  $('.artist-details').toggleClass('show-loader');
  //   shows or hide loader
}

function fetchArtistInfo(artistName) {
  const url = `https://theaudiodb.com/api/v1/json/1/search.php?s=${artistName}`;
  $('.artist-data').hide();
  $('.nav').hide();

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

function fetchArtistAlbums(artistName) {
  $('.artist-data').hide();
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
      renderArtistEvents(responseJson._embedded);
    })
    .catch((err) => errorMessage(err));
}

function renderArtistInfo(artistInfo) {
  const { artists } = artistInfo;
  if (!artists) {
    $('.artist-details').show();
    $('.artist-data').empty();
    $('.nav').hide();
    notResultsFound($('.artist-info'), 'Artist not found');
  } else {
    $('.artist-info').empty();
    $('.artist-details').show();
    $('.nav').show();

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
    $('.albums-container').show();
    $('.events-container').hide();
    fetchArtistAlbums(artists[0].strArtist);
    fetchArtistEvent(artists[0].strArtist);
  }
}

function formatBioText(text) {
  const firstIndex = text.indexOf('.');
  const secondIndex = text.indexOf('.', firstIndex + 1);
  return text.substring(0, secondIndex + 1);
}
function renderArtistEvents(allEvents) {
  $('.events-container ul').empty();
  $('.artist-data').show();
  if (!allEvents) {
    isLoading();
    notResultsFound($('ul.artist-data'), 'Artist has no upcoming events');
  } else {
    const { events } = allEvents;
    for (let i = 0; i < events.length; i++) {
      const liElement = `
              <li>
                  <span> Date:${events[i].dates.start.localDate} </span> 
                  <img src=${events[i].images[0].url}>
                      <span>${events[i].name}</span>
                   <span><a href=${events[i].url}>Buy Tickets</a></span>  
                   <span> Status:${events[i].dates.status.code} </span> 
      
              </li>
              `;
      $('.events-container ul').append(liElement);
    }
  }
}

function renderArtistAlbums(albums) {
  const { album } = albums;
  $('.artist-details').show();

  if (!album) {
    isLoading();
    $('.artist-data').show();
    notResultsFound($('.albums-container'), 'Artist has no albums to show');
  } else {
    $('.albums-container').empty();
    $('.artist-data').show();

    for (let i = 0; i < album.length; i++) {
      const img = album[i].strAlbumThumb || './assets/img-placeholder.jpg';
      const albumElement = `
             <div class='album-img'>
                <img src=${img}> 
                <div class='album-title'>
                 <p>${album[i].strAlbumStripped} </p>
                <span>Release Year:${album[i].intYearReleased}</span>
                </div> 
        
             </div>
            `;
      $('.albums-container').append(albumElement);
    }
  }
}

function showHideAlbumsAndEvents() {
  $('.nav ul li').on('click', function () {
    if ($(this).hasClass('events')) {
      $(this).addClass('selected-view');
      $('.albums').removeClass('selected-view');
      $('.albums-container').hide();
      $('.events-container').show();
    } else {
      $(this).addClass('selected-view');
      $('.events').removeClass('selected-view');
      $('.albums-container').show();
      $('.events-container').hide();
    }
  });
}

function notResultsFound(parentElement, errMessage) {
  $('.artist-data').show();
  isLoading();
  const notFoundImg = parentElement.hasClass('artist-info')
    ? '/assets/not-found.svg'
    : '/assets/no-data.svg';
  parentElement.append(`<div class='no-results-found'>
          <p>${errMessage}</p>
          <img src=${notFoundImg}>
      </div>`);
}

function errorMessage() {
  $('.artist-data').empty();
  $('.artist-details').show();
  $('.nav').hide();
  isLoading();
  $('.artist-details').append(`
      <div class='error-message'>
      <p>Something went wrong ,please try again later!</p>
      <img src='./assets/error_message.svg'>
      </div>
      `);
}

$(watchForm);
