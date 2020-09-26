export const errorMessage = function (err: string): void {
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
          <p>Something went wrong, please try again later!</p>
          <img src='./public/assets/error_message.svg' alt='error message'>
          </div>
          `);
  }, 1500);
};
