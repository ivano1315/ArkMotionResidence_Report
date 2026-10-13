const $ = (s) => document.querySelector(s);

function fmtData(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function periodo(inicio, fim) {
  const a = fmtData(inicio), b = fmtData(fim);
  const mes = b.toLocaleDateString("pt-BR", { month: "long" });
  return `${a.getDate()} a ${b.getDate()} de ${mes} de ${b.getFullYear()}`;
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function card(item, secao) {
  const c = el("article", "card");
  if (item.foto) {
    const b = el("button", "card__foto");
    b.type = "button";
    b.setAttribute("aria-label", `Ampliar foto: ${item.titulo}`);
    const img = el("img");
    img.src = item.foto; img.alt = item.titulo; img.loading = "lazy";
    b.append(img);
    b.addEventListener("click", () => abrirFoto(item));
    c.append(b);
  }
  const body = el("div", "card__body");
  if (item.prioridade && secao === "melhoria") {
    body.append(el("span", `badge badge--${item.prioridade}`, `Prioridade ${item.prioridade}`));
  }
  body.append(el("h3", null, item.titulo), el("p", null, item.texto));
  if (item.sugestao) body.append(el("p", "sugestao", `Sugestão: ${item.sugestao}`));
  c.append(body);
  return c;
}

function abrirFoto(item) {
  $("#lightbox-img").src = item.foto;
  $("#lightbox-img").alt = item.titulo;
  $("#lightbox-cap").textContent = item.titulo;
  $("#lightbox").showModal();
}

function render(d) {
  const { casa, estadia, secoes } = d;
  document.title = `Relatório · ${casa.titulo}`;
  $("#titulo").textContent = casa.titulo;
  $("#tipo").textContent = casa.tipo;
  $("#anuncio").href = casa.anuncio;

  const capa = secoes.fortes.itens.find((i) => i.foto);
  if (capa) $("#hero").style.backgroundImage = `url("${capa.foto}")`;

  [`📅 ${periodo(estadia.inicio, estadia.fim)}`, `👥 ${estadia.hospedes} hóspedes nesta estadia`]
    .forEach((t) => $("#chips").append(el("li", null, t)));

  [[casa.capacidade.replace(" hóspedes", ""), "hóspedes (capacidade)"], [casa.quartos, "quartos"], [casa.camas, "camas"], [casa.banheiros, "banheiros"]]
    .forEach(([n, l]) => {
      const s = el("div", "stat");
      s.append(el("b", null, n), el("span", null, l));
      $("#resumo").append(s);
    });

  Object.entries(secoes).forEach(([chave, sec]) => {
    if (!sec.itens.length) return;
    const s = el("section", `secao secao--${chave}`);
    s.append(el("h2", null, sec.titulo), el("p", "secao__count", `${sec.itens.length} ${sec.itens.length === 1 ? "item" : "itens"}`));
    const g = el("div", "grid");
    sec.itens.forEach((i) => g.append(card(i, chave)));
    s.append(g);
    $("#secoes").append(s);
  });
}

$("#lightbox-close").addEventListener("click", () => $("#lightbox").close());
$("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox") e.target.close(); });

function exportarPdf() {
  const imgs = [...document.images];
  imgs.forEach((i) => { i.loading = "eager"; });
  Promise.all(imgs.map((i) => i.decode().catch(() => {}))).then(() => window.print());
}
$("#pdf").addEventListener("click", exportarPdf);

fetch("data.json")
  .then((r) => r.json())
  .then(render)
  .catch(() => { $("#titulo").textContent = "Não foi possível carregar o relatório."; });
