const ROUTES = {
    start: "home",
    home: "home",
    regulamin: "rules",
    rules: "rules",
    faq: "faq"
};

const HASHES = {
    home: "start",
    rules: "regulamin",
    faq: "faq"
};

function setActivePage(targetId, updateHash = true) {

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle(
            'active',
            btn.dataset.target === targetId
        );
    });

    document.querySelectorAll('.page').forEach(page => {
        page.classList.toggle(
            'active',
            page.id === targetId
        );
    });

    if (updateHash) {

        const hash = HASHES[targetId] || "start";

        if (location.hash !== "#" + hash) {
            history.pushState(null, "", "#" + hash);
        }

    }

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
    });

    document.querySelectorAll(".rules-scroll-container").forEach(container => {
        container.scrollTop = 0;
    });

}

function copyIP() {

    const text = "krainatworcow.pl";

    navigator.clipboard.writeText(text).catch(() => {});

    const serverText = document.getElementById("server-players");
    const ipText = document.getElementById("ip-text");
    const statusDot = document.getElementById("status-dot");

    if (!serverText || !ipText) return;

    const oldText = serverText.innerText;
    const oldIpText = ipText.innerText;

    serverText.innerText = "SKOPIOWANO DO SCHOWKA!";
    serverText.style.color = "#fff";
    serverText.style.opacity = "1";

    ipText.innerText = text;

    if (statusDot) {
        statusDot.style.backgroundColor = "#76c63f";
    }

    setTimeout(() => {

        serverText.innerText = oldText;
        serverText.style.color = "";
        serverText.style.opacity = "";
        ipText.innerText = oldIpText;

        if (statusDot) {
            statusDot.style.backgroundColor = "";
        }

    }, 1500);

}

function handleHashNavigation() {

    if (!location.hash) {
        history.replaceState(null, "", "#start");
    }

    const hash = location.hash
        .replace("#", "")
        .trim()
        .toLowerCase();

    const target = ROUTES[hash] || "home";

    setActivePage(target, false);

}

function bindAccordionHandlers() {

    document.querySelectorAll(".accordion-header").forEach(header => {

        header.addEventListener("click", () => {

            const item = header.parentElement;

            const content =
                item.querySelector(".accordion-content");

            document.querySelectorAll(".accordion-item").forEach(other => {

                if (other === item) return;

                other.classList.remove("active");

                const otherContent =
                    other.querySelector(".accordion-content");

                if (otherContent) {
                    otherContent.style.maxHeight = null;
                }

            });

            item.classList.toggle("active");

            if (item.classList.contains("active")) {

                content.style.maxHeight =
                    content.scrollHeight + "px";

            } else {

                content.style.maxHeight = null;

            }

        });

    });

}

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".nav-btn").forEach(button => {

        button.addEventListener("click", () => {

            const target = button.dataset.target;

            if (!target) return;

            setActivePage(target);

        });

    });

    bindAccordionHandlers();

    handleHashNavigation();

    const email = "kontakt@krainatworcow.pl";

    const placeholder = document.getElementById("mail-placeholder");

    if (placeholder) {

        placeholder.innerHTML =
            `<a href="mailto:${email}" style="color: var(--accent); text-decoration: underline;">${email}</a>`;

    }

});

window.addEventListener("hashchange", () => {

    handleHashNavigation();

});

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (!loader) return;

    setTimeout(() => {

        loader.classList.add("loader-hidden");

    }, 500);

});
