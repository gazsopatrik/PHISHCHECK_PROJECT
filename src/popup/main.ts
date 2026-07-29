import "./styles.css";

const app = document.querySelector<HTMLElement>("#app");

if (app) {
  app.innerHTML = `
    <section class="panel" aria-labelledby="title">
      <header>
        <p class="eyebrow">Opera GX · Gmail</p>
        <h1 id="title">PhishCheck</h1>
        <p class="status">Foundation loaded. Email analysis is coming next.</p>
      </header>
      <button type="button" disabled>Analyze Email</button>
      <p class="disclaimer">Risk indicators are not a guarantee. Always verify sensitive requests through a trusted channel.</p>
    </section>
  `;
}