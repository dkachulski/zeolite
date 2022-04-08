// Controls the padding size in Information and Statistics sections for better design
document.addEventListener('DOMContentLoaded', () => {
  const resizeObserver = new ResizeObserver(entries => {
    const infoP1 = document.querySelector(
      '#information-text-container p:first-child'
    );
    const infoP2 = document.querySelector(
      '#information-text-container p:last-child'
    );
    const statP1 = document.querySelector(
      '#statistics-text-container p:first-child'
    );
    const statP2 = document.querySelector(
      '#statistics-text-container p:last-child '
    );
    // Information banner
    infoP1.style.paddingTop = '0px';
    infoP2.style.paddingBottom = '0px';

    if (window.innerWidth >= 768 && window.innerWidth < 975) {
      const height = Number(
        document.getElementById('information-container').offsetHeight
      );
      const paddingHeight = (height - 120) / 2;
      infoP1.style.paddingTop = paddingHeight + 'px';
      infoP2.style.paddingBottom = paddingHeight + 'px';
    } else if (window.innerWidth >= 768) {
      const height = Number(
        document.getElementById('information-container').offsetHeight
      );
      const paddingHeight = (height - 188) / 2;
      infoP1.style.paddingTop = paddingHeight + 'px';
      infoP2.style.paddingBottom = paddingHeight + 'px';
    }
    // Statistics Banner
    statP1.style.paddingTop = '0px';
    statP2.style.paddingBottom = '0px';
    if (window.innerWidth > 768) {
      const height = Number(
        document.getElementById('statistics-container').offsetHeight
      );
      const paddingHeight = (height - 133) / 2;
      statP1.style.paddingTop = paddingHeight + 'px';
      statP2.style.paddingBottom = paddingHeight + 'px';
    }
    if (window.innerWidth < 768) {
      infoP1.style.paddingTop = '100px';
      infoP2.style.paddingBottom = '100px';
      statP1.style.paddingTop = '100px';
      statP2.style.paddingBottom = '100px';
    }
  });

  resizeObserver.observe(document.querySelector('#information h2'));
});
