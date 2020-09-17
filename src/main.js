import 'jquery';
import config from './config';
function watchForm() {
    $('form').on('submit', function (event) {
        event.preventDefault();
        var input = $('input');
        var artistName = input.val();
        // artistName is giving me a warning for undefiend values
        if (artistName.trim() === '') {
            input.val('');
            alert('input cant be empty');
        }
        else {
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
}
function renderSpinner() {
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
    var url = config.audiodbArtistBaseURL + artistName;
    $('.artist-details').find('.error-message').remove();
    // clear message if there is an attempt after a request failure
    $('.artist-details').hide();
    $('.nav').hide();
    fetch(url)
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
        .then(function (JsonResponse) {
        renderArtistInfo(JsonResponse.artists, artistName);
    })
        .catch(function (err) {
        renderSpinner();
        errorMessage();
    });
}
function fetchArtistAlbums(artistName) {
    $('.artist-details').hide();
    var url = config.audiodbAlbumsBaseURL + artistName;
    fetch(url)
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
        .then(function (JsonResponse) {
        var sortedAlbums = JsonResponse.album.sort(function (a, b) {
            return parseInt(a.intYearReleased) - parseInt(b.intYearReleased);
        });
        //  sorting albums from old-new
        renderArtistAlbums(sortedAlbums, artistName);
    })
        .catch(function (err) {
        errorMessage();
    });
}
function fetchArtistEvent(artistName) {
    $('.artist-details').hide();
    var url = config.ticketMasterBaseURL + artistName;
    fetch(url)
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
        .then(function (responseJson) {
        renderSpinner();
        renderArtistEvents(responseJson._embedded, artistName);
    })
        .catch(function (er) {
        $('.artist-data').hide();
        // hiding the  data ,since albums takes longer to fetch  they were rendering after the function was done
        // added a settimeout inside the function
        renderSpinner();
        errorMessage();
    });
}
function renderArtistInfo(artist, artistName) {
    if (!artist) {
        $('.artist-details').show();
        $('.artist-info').css('height', '76vh');
        // this  css makes the footer to stay in the bottom if there is no data to render
        $('.artist-data').empty();
        $('.nav').hide();
        notResultsFound($('.artist-info'), "We could not find information about " + artistName);
    }
    else {
        $('.artist-info').empty();
        $('.nav').show();
        $('.artist-info').css('height', 'auto');
        var bio = formatBioText(artist[0].strBiographyEN);
        var artistData = "\n           <div class='img-container'>\n              <img src=" + artist[0].strArtistThumb + " alt=\"" + artist[0].strArtist + "\">\n           </div>\n           <div class='bio'>\n           <h2>" + artist[0].strArtist + "</h2>\n           <p><i class=\"fas fa-map-marker-alt\"></i>" + artist[0].strCountry + "</p>\n           <p><i class=\"fas fa-headphones-alt\"></i><span>Genre:" + artist[0].strStyle + "<span></p>\n           <p><i class=\"far fa-address-book\"></i>" + bio + "</p>\n           <span>\n           <a target=\"_blank\" href=\"http://" + artist[0].strTwitter + "\">\n           <i class=\"fab fa-twitter\"></i>\n           </a>\n           </span>\n           <span>\n           <a target=\"_blank\" href=\"//" + artist[0].strWebsite + "\">\n           Website\n           </a>\n           </span>\n           </div>\n           ";
        $('.artist-info').append(artistData);
        fetchArtistAlbums(artist[0].strArtist);
        fetchArtistEvent(artist[0].strArtist);
    }
}
// reducing the text characters count , api sometimes sends text too large
function formatBioText(text) {
    var firstIndex = text.indexOf('.');
    var secondIndex = text.indexOf('.', firstIndex + 1);
    return text.substring(0, secondIndex + 1);
}
function renderArtistAlbums(albums, artistName) {
    $('.artist-details').fadeIn();
    if (!albums) {
        renderSpinner();
        $('.albums-container').css('display', 'block');
        notResultsFound($('.albums-container'), artistName + " has no albums to show");
    }
    else {
        $('.albums-container').empty();
        for (var i = 0; i < albums.length; i++) {
            var img = albums[i].strAlbumThumb || './assets/img-placeholder.webp';
            var albumElement = "\n             <div class='album-img'>\n                <img src=" + img + " alt=\"" + albums[i].strArtist + "\">\n                <div class='album-title'>\n                 <p class=" + (albums[i].strAlbumStripped.length <= 45 ? 'small-title' : '') + ">" + albums[i].strAlbumStripped + "</p>\n                <p>Release Year:" + (albums[i].intYearReleased === 0
                ? 'N/A'
                : albums[i].intYearReleased) + "</p>\n                </div>\n\n             </div>\n            ";
            $('.albums-container').append(albumElement);
        }
    }
}
function renderArtistEvents(allEvents, artistName) {
    $('.events-container ul').empty();
    if (!allEvents) {
        renderSpinner();
        notResultsFound($('.events-container'), artistName + " has no upcoming events");
    }
    else {
        $('.events-container').children('.no-results-found').remove();
        var events = allEvents.events;
        for (var i = 0; i < events.length; i++) {
            var _a = events[i], dates = _a.dates, name_1 = _a.name, url = _a.url, _embedded = _a._embedded, images = _a.images;
            // checks if properties are present in event obejct
            if (_embedded && name_1 && url && dates) {
                var highQualityImg = images.find(function (img) { return img.width > 500; });
                var imgUrl = highQualityImg
                    ? highQualityImg.url
                    : './assets/img-placeholder.webp';
                // place holder img in case img is not found
                var date = formatDate(dates.start.localDate);
                var liElement = "\n                <li>\n                    <img src=" + imgUrl + " alt=\"" + name_1 + "\">\n                        <p>" + name_1 + "</p>\n                        <p><a href=" + url + " target=\"_blank\">Buy Tickets</a></p>\n                        <p>" + (_embedded.venues[0].name || 'N/A') + " </p>\n                        <p>\n                        <span> " + (_embedded.venues[0].city.name || 'N/A') + "</span>\n                        <span> " + (_embedded.venues[0].country.name || 'N/A') + "</span>\n                        </p>\n                     <p> Date: " + date + " </p>\n                     <p> Status:" + dates.status.code + " </p>\n  \n                </li>\n                ";
                $('.events-container ul').append(liElement);
            }
        }
    }
}
function formatDate(date) {
    var dateArr = date.split('-');
    var newDateFormat = dateArr[1] + "/" + dateArr[2] + "/" + dateArr[0];
    return newDateFormat;
}
function showHideAlbumsOrEvents() {
    $('.nav ul li').on('click', function () {
        $('.nav ul li').removeClass('selected-view');
        $(this).addClass('selected-view');
        if ($(this).hasClass('events')) {
            $('.albums-container').fadeOut();
            $('.events-container').fadeIn();
        }
        else {
            $('.albums-container').fadeIn();
            $('.events-container').fadeOut();
        }
    });
}
function notResultsFound(parentElement, errMessage) {
    $('.artist-data').show();
    parentElement.children('.no-results-found').remove();
    // removing in case  there was elements before
    renderSpinner();
    var notFoundImg = parentElement.hasClass('artist-info')
        ? './assets/not-found.svg'
        : './assets/no-data.svg';
    parentElement.append("<div class='no-results-found'>\n          <p>" + errMessage + "</p>\n          <img src=" + notFoundImg + ">\n      </div>");
}
function errorMessage() {
    $('.nav').hide();
    setTimeout(function () {
        $('.artist-details').find('.error-message').remove();
        $('.artist-info').css('height', 'auto');
        $('.artist-data').empty();
        $('.artist-details').show();
        $('.nav').hide();
        $('.artist-details').append("\n        <div class='error-message'>\n        <p>Something went wrong ,please try again later!</p>\n        <img src='./assets/error_message.svg' alt='error message'>\n        </div>\n        ");
    }, 1500);
}
$(watchForm);
