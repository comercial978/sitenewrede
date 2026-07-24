(function (win, doc) {
    "use strict";

    var measurementId = "G-QZ73CGV7X7";
    var storageKey = "uai_analytics_consent";
    var productionHosts = ["uaisoftware.com.br", "www.uaisoftware.com.br"];
    var isProductionHost = productionHosts.indexOf(win.location.hostname) !== -1;

    function readConsent() {
        try {
            return win.localStorage.getItem(storageKey);
        } catch (error) {
            return null;
        }
    }

    function saveConsent(value) {
        try {
            win.localStorage.setItem(storageKey, value);
            return true;
        } catch (error) {
            return false;
        }
    }

    function clearAnalyticsCookies() {
        var cookieNames = doc.cookie.split(";").map(function (cookie) {
            return cookie.split("=")[0].trim();
        }).filter(function (name) {
            return name.indexOf("_ga") === 0 || name.indexOf("_gcl") === 0;
        });
        var domains = ["", win.location.hostname, ".uaisoftware.com.br"];

        cookieNames.forEach(function (name) {
            domains.forEach(function (domain) {
                var domainPart = domain ? "; domain=" + domain : "";
                doc.cookie = name + "=; Max-Age=0; path=/" + domainPart + "; SameSite=Lax";
            });
        });
    }

    var initialConsent = readConsent() === "granted" ? "granted" : "denied";

    win.dataLayer = win.dataLayer || [];
    win.gtag = win.gtag || function () {
        win.dataLayer.push(arguments);
    };

    win.gtag("consent", "default", {
        analytics_storage: initialConsent,
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        wait_for_update: 500
    });
    win.gtag("set", "ads_data_redaction", true);

    if (isProductionHost) {
        win.gtag("js", new Date());
        win.gtag("config", measurementId, {
            allow_google_signals: false,
            allow_ad_personalization_signals: false
        });

        var googleTag = doc.createElement("script");
        googleTag.async = true;
        googleTag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
        doc.head.appendChild(googleTag);
    }

    win.uaiTrack = function (eventName, parameters) {
        if (!eventName || typeof win.gtag !== "function") {
            return;
        }
        win.gtag("event", eventName, parameters || {});
    };

    function updateConsent(value, source) {
        var previousConsent = readConsent();
        saveConsent(value);

        win.gtag("consent", "update", {
            analytics_storage: value,
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied"
        });

        if (value === "denied") {
            clearAnalyticsCookies();
        } else if (previousConsent !== "granted") {
            win.uaiTrack("analytics_consent_granted", {
                consent_source: source || "privacy_panel"
            });
        }
    }

    function createPrivacyControls() {
        var panel = doc.createElement("aside");
        var manageButton = doc.createElement("button");

        panel.id = "uai-privacy-panel";
        panel.className = "uai-privacy-panel";
        panel.hidden = true;
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-labelledby", "uai-privacy-title");
        panel.setAttribute("aria-describedby", "uai-privacy-description");
        panel.innerHTML = [
            '<div class="uai-privacy-panel__copy">',
            '<strong id="uai-privacy-title">Privacidade e mensura\u00e7\u00e3o</strong>',
            '<p id="uai-privacy-description">Usamos dados de navega\u00e7\u00e3o para entender o desempenho do site. Voc\u00ea pode aceitar a medi\u00e7\u00e3o ou continuar apenas com recursos essenciais. <a href="/politica-de-privacidade.html">Saiba mais</a>.</p>',
            "</div>",
            '<div class="uai-privacy-panel__actions">',
            '<button type="button" class="uai-privacy-button uai-privacy-button--secondary" data-uai-consent="denied">Somente essenciais</button>',
            '<button type="button" class="uai-privacy-button uai-privacy-button--primary" data-uai-consent="granted">Aceitar medi\u00e7\u00e3o</button>',
            "</div>"
        ].join("");

        manageButton.type = "button";
        manageButton.className = "uai-privacy-manage";
        manageButton.textContent = "Privacidade";
        manageButton.setAttribute("aria-controls", panel.id);
        manageButton.setAttribute("aria-expanded", "false");

        doc.body.appendChild(panel);
        doc.body.appendChild(manageButton);

        function openPanel(focusChoice) {
            panel.hidden = false;
            manageButton.hidden = true;
            manageButton.setAttribute("aria-expanded", "true");
            if (focusChoice) {
                var currentChoice = readConsent() === "granted" ? "granted" : "denied";
                var choiceButton = panel.querySelector('[data-uai-consent="' + currentChoice + '"]');
                if (choiceButton) {
                    choiceButton.focus();
                }
            }
        }

        function closePanel() {
            panel.hidden = true;
            manageButton.hidden = false;
            manageButton.setAttribute("aria-expanded", "false");
        }

        panel.addEventListener("click", function (event) {
            var button = event.target.closest("[data-uai-consent]");
            if (!button) {
                return;
            }
            updateConsent(button.getAttribute("data-uai-consent"), "privacy_panel");
            closePanel();
        });

        manageButton.addEventListener("click", function () {
            openPanel(true);
        });

        doc.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && !panel.hidden && readConsent()) {
                closePanel();
                manageButton.focus();
            }
        });

        if (!readConsent()) {
            openPanel(false);
        }
    }

    function initAutomaticTracking() {
        doc.addEventListener("click", function (event) {
            var link = event.target.closest("a[href]");
            if (!link || link.hasAttribute("data-track")) {
                return;
            }

            var href = link.getAttribute("href") || "";
            var label = link.getAttribute("data-label") ||
                (link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80) ||
                "sem_identificacao";

            if (/https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) {
                win.uaiTrack("whatsapp_click", {
                    event_label: label,
                    link_url: link.href,
                    page_path: win.location.pathname
                });
            } else if (/auditoria(?:\.html)?(?:[#?]|$)/i.test(href)) {
                win.uaiTrack("audit_click", {
                    event_label: label,
                    link_url: link.href,
                    page_path: win.location.pathname
                });
            }
        });
    }

    function init() {
        createPrivacyControls();
        initAutomaticTracking();
    }

    if (doc.readyState === "loading") {
        doc.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
}(window, document));
