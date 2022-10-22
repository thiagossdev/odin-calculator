(function (document, window) {
  document.addEventListener('keydown', (event) => {
    console.log(`${event.key} - ${event.code}`);
  });
})(document, window);
