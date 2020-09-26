import { errorMessage } from './errorHandler';

import {
  renderSpinner,
  renderArtistInfo,
  renderArtistAlbums,
  renderArtistEvents,
  renderAlbumsOrEvents,
} from './renderers';
import config from './config';

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
      renderAlbumsOrEvents();
      fetchArtistInfo(artistName);
      $('input').val('');
      // sets input value back to empty
    }
  });
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

export const fetchArtistAlbums = function (artistName: string): void {
  $('.artist-details').hide();
  const url: string = config.audiodbAlbumsBaseURL + artistName;
  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(({ album }) => {
      if (album) {
        album = album.sort(
          (a: { intYearReleased: string }, b: { intYearReleased: string }) =>
            parseInt(a.intYearReleased) - parseInt(b.intYearReleased)
        );
      }
      renderArtistAlbums(album, artistName);
    })
    .catch((err: string) => {
      errorMessage(err);
    });
};

export const fetchArtistEvent = function (artistName: string): void {
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

$(watchForm);
