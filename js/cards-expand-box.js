// Controls the expanding content of the products on desktop view
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".card[data-cardnumber]")
    .forEach(card => card.addEventListener("click", cardsExpandController));
});

function cardsExpandController(ev) {
  const elem = ev.currentTarget;

  if (
    document.querySelector(".card-opened") &&
    elem !== document.querySelector(".card-opened")
  )
    changeContent(elem);
  else if (!elem.classList.contains("card-opened")) showContent(elem);
  else if (elem.classList.contains("card-opened")) closeContent(elem);

  function showContent(elem) {
    // mark card as opened
    elem.classList.add("card-opened");

    // hide all visible content from before
    document
      .querySelectorAll(".card-content-body")
      .forEach(box => box.classList.add("card-content-hidden"));

    // make content inside box visisble
    document
      .querySelector(`.${elem.dataset.cardnumber}-content-body`)
      .classList.remove("card-content-hidden");

    // show content box
    document.querySelector("#cards-content-collapse-btn").click();
  }

  function closeContent(elem) {
    // mark card as closed
    console.log(elem);
    elem.classList.remove("card-opened");

    // hide content box
    document.querySelector("#cards-content-collapse-btn").click();
  }

  function changeContent(elem) {
    // swap open cards
    document.querySelector(".card-opened").classList.remove("card-opened");
    elem.classList.add("card-opened");

    // swap content inside box
    document
      .querySelectorAll(".card-content-body")
      .forEach(box => box.classList.add("card-content-hidden"));

    document
      .querySelector(`.${elem.dataset.cardnumber}-content-body`)
      .classList.remove("card-content-hidden");
  }
}
