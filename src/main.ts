import 'jquery';
import config from './config';

import { Artist, Albums, AllEvents, Images } from './interfaces';
const watchForm = function (): void {
  $('form').on('submit', (event: Event) => {
    event.preventDefault();
    const input: JQuery<HTMLInputElement> = $('input');
    const artistName: string = <string>input.val();
    if (artistName.trim() === '') {
      input.val('');
      alert('input cant be empty');
    } else {
      $('.artist-details').fadeIn();
      $('.landing').hide();
      renderSpinner();
      // sets loading to show when fetching information
      showHideAlbumsOrEvents();
      fetchArtistInfo(artistName);
      $('input').val('');
      // sets input value back to empty
    }
  });
};

const renderSpinner = function (): void {
  $('.nav ul li').removeClass('selected-view');
  $('.albums').addClass('selected-view');
  $('.loader').toggleClass('hide-content');
  $('.albums-container').show();
  $('.events-container').hide();
  $('footer').toggleClass('hide-content');

  // hiding footer so it wont show while content is loading ,

  //   shows or hide loader-spinner
};

const fetchArtistInfo = function (artistName: string): void {
  const url: string = config.audiodbArtistBaseURL + artistName;
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
      renderArtistInfo(JsonResponse.artists, artistName);
    })
    .catch((err: string) => {
      renderSpinner();
      errorMessage(err);
    });
};

const fetchArtistAlbums = function (artistName: string): void {
  $('.artist-details').hide();
  const url: string = config.audiodbAlbumsBaseURL + artistName;
  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((JsonResponse) => {
      const sortedAlbums = JsonResponse.album.sort(
        (a: { intYearReleased: string }, b: { intYearReleased: string }) =>
          parseInt(a.intYearReleased) - parseInt(b.intYearReleased)
      );
      //  sorting albums from old-new
      renderArtistAlbums(sortedAlbums, artistName);
    })
    .catch((err: string) => {
      errorMessage(err);
    });
};

const fetchArtistEvent = function (artistName: string): void {
  $('.artist-details').hide();
  const url: string = config.ticketMasterBaseURL + artistName;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => {
      renderSpinner();
      renderArtistEvents(responseJson._embedded, artistName);
    })
    .catch((err: string): void => {
      $('.artist-data').hide();
      // hiding the  data ,since albums takes longer to fetch  they were rendering after the function was done
      // added a settimeout inside the function
      renderSpinner();
      errorMessage(err);
    });
};

const renderArtistInfo = function (artist: Artist[], artistName: string): void {
  if (!artist) {
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

    const bio: string = formatBioText(artist[0].strBiographyEN);
    const artistData = `
           <div class='img-container'>
              <img src=${artist[0].strArtistThumb} alt="${artist[0].strArtist}">
           </div>
           <div class='bio'>
           <h2>${artist[0].strArtist}</h2>
           <p><i class="fas fa-map-marker-alt"></i>${artist[0].strCountry}</p>
           <p><i class="fas fa-headphones-alt"></i><span>Genre:${artist[0].strStyle}<span></p>
           <p><i class="far fa-address-book"></i>${bio}</p>
           <span>
           <a target="_blank" href="http://${artist[0].strTwitter}">
           <i class="fab fa-twitter"></i>
           </a>
           </span>
           <span>
           <a target="_blank" href="//${artist[0].strWebsite}">
           Website
           </a>
           </span>
           </div>
           `;
    $('.artist-info').append(artistData);
    fetchArtistAlbums(artist[0].strArtist);
    fetchArtistEvent(artist[0].strArtist);
  }
};

// reducing the text characters count , api sometimes sends text too large
const formatBioText = function (text: string): string {
  const firstIndex = text.indexOf('.');
  const secondIndex = text.indexOf('.', firstIndex + 1);
  return text.substring(0, secondIndex + 1);
};

const renderArtistAlbums = function (
  albums: Albums[],
  artistName: string
): void {
  $('.artist-details').fadeIn();
  if (!albums) {
    renderSpinner();
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
                  albums[i].intYearReleased === 0
                    ? 'N/A'
                    : albums[i].intYearReleased
                }</p>
                </div>

             </div>
            `;
      $('.albums-container').append(albumElement);
    }
  }
};

const renderArtistEvents = function (
  allEvents: AllEvents,
  artistName: string
): void {
  $('.events-container ul').empty();
  if (!allEvents) {
    renderSpinner();
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
      if (_embedded && name && url && dates && images) {
        const highQualityImg = <Images>(
          images.find((img: Images) => img.width > 500)
        );
        const imgUrl: string = highQualityImg
          ? highQualityImg.url
          : './assets/img-placeholder.webp';
        // place holder img in case img is not found
        const date: string = formatDate(dates.start.localDate);
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
};

const formatDate = function (date: string): string {
  const dateArr: string[] = date.split('-');
  const newDateFormat = `${dateArr[1]}/${dateArr[2]}/${dateArr[0]}`;
  return newDateFormat;
};

const showHideAlbumsOrEvents = function (): void {
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
};

const notResultsFound = function (
  parentElement: JQuery,
  errMessage: string
): void {
  $('.artist-data').show();
  parentElement.children('.no-results-found').remove();
  // removing in case  there was elements before
  renderSpinner();
  const notFoundImg: string = parentElement.hasClass('artist-info')
    ? './assets/not-found.svg'
    : './assets/no-data.svg';

  parentElement.append(`<div class='no-results-found'>
          <p>${errMessage}</p>
          <img src=${notFoundImg}>
      </div>`);
};

const errorMessage = function (err: string): void {
  $('.nav').hide();
  console.error(err);
  setTimeout(() => {
    $('.artist-details').find('.error-message').remove();
    $('.artist-info').css('height', 'auto');
    $('.artist-data').empty();
    $('.artist-details').show();
    $('.nav').hide();
    $('.artist-details').append(`
        <div class='error-message'>
        <p>Something went wrong ,please try again later!</p>
        <img src='./assets/error_message.svg' alt='error message'>
        </div>
        `);
  }, 1500);
};

$(watchForm);