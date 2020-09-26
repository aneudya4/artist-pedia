import { renderSpinner } from './renderers';

// reducing the text characters count , api sometimes sends text too large
export const formatBioText = function (text: string): string {
  const firstIndex = text.indexOf('.');
  const secondIndex = text.indexOf('.', firstIndex + 1);
  return text.substring(0, secondIndex + 1);
};

export const formatDate = function (date: string): string {
  const dateArr: string[] = date.split('-');
  const newDateFormat = `${dateArr[1]}/${dateArr[2]}/${dateArr[0]}`;
  return newDateFormat;
};

export const notResultsFound = function (
  parentElement: JQuery,
  errMessage: string
): void {
  $('.artist-data').show();
  parentElement.empty();
  parentElement.children('.no-results-found').remove();
  // removing in case  there was elements before
  renderSpinner();
  const notFoundImg: string = parentElement.hasClass('artist-info')
    ? './public/assets/not-found.svg'
    : './public/assets/no-data.svg';

  parentElement.append(`<div class='no-results-found'>
            <p>${errMessage}</p>
            <img src=${notFoundImg}>
        </div>`);
};
