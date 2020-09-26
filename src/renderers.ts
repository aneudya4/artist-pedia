import { fetchArtistAlbums, fetchArtistEvent } from './main';
import { formatBioText, formatDate } from './helpers';
import { Artist, Albums, AllEvents, Images } from './interfaces';
import { notResultsFound } from './helpers';

export const renderSpinner = function (): void {
  $('.nav ul li').removeClass('selected-view');
  $('.albums').addClass('selected-view');
  $('.loader').toggleClass('hide-content');
  $('.albums-container').show();
  $('.events-container').hide();
  $('footer').toggleClass('hide-content');

  // hiding footer so it wont show while content is loading ,

  //   shows or hide loader-spinner
};

export const renderArtistInfo = function (
  artist: Artist[],
  artistName: string
): void {
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
                <img src=${artist[0].strArtistThumb} alt="${
      artist[0].strArtist
    }">
             </div>
             <div class='bio'>
             <h2>${artist[0].strArtist}</h2>
             <p><i class="fas fa-map-marker-alt"></i>${
               artist[0].strCountry || 'UNKNOWN'
             }</p>
             <p><i class="fas fa-headphones-alt"></i><span>Genre:${
               artist[0].strStyle || 'UNKNOWN'
             }<span></p>
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

export const renderArtistAlbums = function (
  albums: Albums[],
  artistName: string
): void {
  $('.artist-details').fadeIn();
  if (!albums || albums.length === 0) {
    renderSpinner();
    $('.albums-container').css('display', 'block');
    notResultsFound(
      $('.albums-container'),
      `${artistName} has no albums to show`
    );
  } else {
    $('.albums-container').empty();
    $('.albums-container').css('display', 'flex');
    for (let i = 0; i < albums.length; i++) {
      const img =
        albums[i].strAlbumThumb || './public/assets/img-placeholder.webp';
      const albumElement = `
               <div class='album-img'>
                  <img src=${img} alt="${albums[i].strArtist}">
                  <div class='album-title'>
                   <p class=${
                     albums[i].strAlbumStripped.length <= 45
                       ? 'small-title'
                       : ''
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

export const renderArtistEvents = function (
  allEvents: AllEvents,
  artistName: string
): void {
  $('.events-container ul.artist-data').empty();
  if (!allEvents) {
    renderSpinner();
    $('.events-container ul').css('display', 'block');
    notResultsFound(
      $('.events-container ul'),
      `${artistName} has no upcoming events`
    );
  } else {
    $('.events-container').children('.no-results-found').remove();
    $('.events-container ul').css('display', 'flex');
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
          : './public/assets/img-placeholder.webp';
        // place holder img in case img is not found
        const date: string = formatDate(dates.start.localDate);
        const liElement = `
                  <li>
                      <img src=${imgUrl} alt="${name}">
                          <p>${name}</p>
                          <p><a href=${url} target="_blank">Buy Tickets</a></p>
                          <p>${_embedded.venues[0].name || 'N/A'} </p>
                          <p>
                          <span> ${
                            _embedded.venues[0].city.name || 'N/A'
                          }</span>
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

export const renderAlbumsOrEvents = function (): void {
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
