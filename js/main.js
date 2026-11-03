/* Small progressive enhancement; layout and navigation work without JS. */
document.querySelectorAll("[data-card-interaction]").forEach((card) => {
  const toggle = card.querySelector(".card-toggle");
  const content = document.getElementById(toggle.getAttribute("aria-controls"));
  const front = card.querySelector(".flip-card__front");
  const label = toggle.querySelector(".card-toggle__label");
  const isGame = card.dataset.cardInteraction === "flip";
  const title = card.querySelector("h3").textContent;
  let pinned = false;
  let hovering = false;
  let suppressed = false;

  const render = () => {
    const expanded = pinned || (hovering && !suppressed);
    card.classList.toggle("is-expanded", expanded);
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-label", `${expanded ? "Сховати" : "Показати"} опис ${isGame ? "гри" : "події"} ${title}`);
    label.textContent = expanded ? (isGame ? "До обкладинки" : "Згорнути опис") : (isGame ? "Про гру" : "Детальніше про формат");
    content.inert = !expanded;
    content.setAttribute("aria-hidden", String(!expanded));
    if (front) {
      front.inert = expanded;
      front.setAttribute("aria-hidden", String(expanded));
    }
  };

  card.classList.add("is-interactive");
  toggle.hidden = false;
  render();
  card.addEventListener("pointerenter", (event) => {
    // Use the actual pointer event: desktop WebViews can report hover:none.
    if (event.pointerType !== "mouse") return;
    hovering = true;
    suppressed = false;
    render();
  });
  card.addEventListener("pointerleave", () => {
    if (content.contains(document.activeElement)) pinned = true;
    hovering = false;
    suppressed = false;
    render();
  });
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    pinned = !expanded;
    suppressed = expanded;
    render();
  });
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (content.contains(document.activeElement)) toggle.focus();
    pinned = false;
    suppressed = true;
    render();
  });
});
const filters = document.querySelector("#catalog-filter");
if (filters) {
  const cards = [...document.querySelectorAll("[data-category]")];
  const update = () => {
    const query = filters.elements.q.value.trim().toLocaleLowerCase("uk");
    const category = filters.elements.category.value;
    let count = 0;
    cards.forEach((card) => {
      const visible =
        (!query ||
          (card.textContent + " " + card.dataset.title)
            .toLocaleLowerCase("uk")
            .includes(query)) &&
        (!category || card.dataset.category === category);
      card.hidden = !visible;
      if (visible) count++;
    });
    document.querySelector("#result-count").textContent =
      `Знайдено ігор: ${count}`;
    document.querySelector("#catalog-empty").hidden = count !== 0;
  };
  filters.addEventListener("input", update);
  filters.addEventListener("reset", () => requestAnimationFrame(update));
  filters.addEventListener("submit", (event) => event.preventDefault());
}
const booking = document.querySelector("#booking-form");
if (booking) {
  const date = booking.elements.date;
  const now = new Date();
  date.min = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  booking.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!booking.reportValidity()) return;
    const result = document.querySelector("#booking-result");
    result.hidden = false;
    result.textContent =
      "Поля заявки заповнено коректно. Це навчальна демонстрація: бронювання не створено, дані нікуди не надіслано.";
  });
}
