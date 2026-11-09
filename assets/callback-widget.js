(function () {
    "use strict";

    if (window.__uaiCallbackWidgetLoaded) {
        return;
    }
    window.__uaiCallbackWidgetLoaded = true;

    var doc = document;
    var dismissedKey = "uai_callback_dismissed_at";
    var completedKey = "uai_callback_completed";
    var threeDays = 3 * 24 * 60 * 60 * 1000;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function storageGet(storage, key) {
        try {
            return storage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function storageSet(storage, key, value) {
        try {
            storage.setItem(key, value);
        } catch (error) {
            return false;
        }
        return true;
    }

    if (storageGet(window.sessionStorage, completedKey) === "true") {
        return;
    }

    function track(eventName, parameters) {
        var details = parameters || {};
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(Object.assign({
            event: "uai_conversion",
            uai_event: eventName,
            form_name: "pedido_ligacao_flutuante"
        }, details));

        if (typeof window.gtag === "function") {
            window.gtag("event", eventName, Object.assign({
                form_name: "pedido_ligacao_flutuante"
            }, details));
        }
    }

    function phoneMask(value) {
        var digits = value.replace(/\D/g, "").slice(0, 11);
        if (digits.length <= 2) {
            return digits ? "(" + digits : "";
        }
        if (digits.length <= 6) {
            return "(" + digits.slice(0, 2) + ") " + digits.slice(2);
        }
        if (digits.length <= 10) {
            return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 6) + "-" + digits.slice(6);
        }
        return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7);
    }

    function icon(name, className) {
        return '<svg class="' + (className || "") + '" aria-hidden="true" viewBox="0 0 24 24"><use href="/assets/lucide-icons.svg#' + name + '"></use></svg>';
    }

    var markup = [
        '<section class="uai-callback" id="uai-callback" data-state="closed" aria-label="Solicitar ligação da UAI Software">',
        '  <button class="uai-callback__launcher" id="uai-callback-launcher" type="button" aria-expanded="false" aria-controls="uai-callback-panel">',
        '    <span class="uai-callback__launcher-icon">' + icon("smartphone") + '</span>',
        '    <span><strong>Ligamos para você</strong><small>Economize o custo da chamada</small></span>',
        '  </button>',
        '  <div class="uai-callback__panel" id="uai-callback-panel" role="dialog" aria-modal="false" aria-labelledby="uai-callback-title" hidden>',
        '    <header class="uai-callback__head">',
        '      <p class="uai-callback__kicker">Atendimento UAI Software</p>',
        '      <h2 id="uai-callback-title">Prefere que a gente ligue?</h2>',
        '      <button class="uai-callback__close" id="uai-callback-close" type="button" aria-label="Minimizar pedido de ligação" title="Minimizar">' + icon("x") + '</button>',
        '    </header>',
        '    <div class="uai-callback__body">',
        '      <p class="uai-callback__promise"><strong>Você não gasta com a chamada.</strong> Deixe seu contato e retornamos em horário comercial.</p>',
        '      <form class="uai-callback__form" id="uai-callback-form" action="https://formsubmit.co/comercial@uaisoftware.com.br" method="POST" novalidate>',
        '        <input type="hidden" name="_subject" value="Novo pedido: ligar para cliente - UAI Software">',
        '        <input type="hidden" name="_template" value="table">',
        '        <input type="hidden" name="_captcha" value="false">',
        '        <input type="hidden" name="Página" id="uai-callback-page">',
        '        <input type="hidden" name="Origem" id="uai-callback-referrer">',
        '        <input class="uai-callback__honeypot" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">',
        '        <div class="uai-callback__field">',
        '          <label for="uai-callback-name">Seu nome</label>',
        '          <input id="uai-callback-name" name="Nome" type="text" autocomplete="name" maxlength="80" placeholder="Como podemos chamar você?" required aria-describedby="uai-callback-name-error">',
        '          <p class="uai-callback__error" id="uai-callback-name-error" aria-live="polite"></p>',
        '        </div>',
        '        <div class="uai-callback__field">',
        '          <label for="uai-callback-phone">Telefone com DDD</label>',
        '          <input id="uai-callback-phone" name="Telefone" type="tel" inputmode="tel" autocomplete="tel" maxlength="16" placeholder="(34) 99999-9999" required aria-describedby="uai-callback-phone-error">',
        '          <p class="uai-callback__error" id="uai-callback-phone-error" aria-live="polite"></p>',
        '        </div>',
        '        <label class="uai-callback__consent">',
        '          <input id="uai-callback-consent" name="Consentimento" type="checkbox" value="Aceito" required>',
        '          <span>Autorizo o contato da UAI Software sobre esta solicitação. <a href="/politica-de-privacidade.html">Privacidade</a>.</span>',
        '        </label>',
        '        <p class="uai-callback__error" id="uai-callback-consent-error" aria-live="polite"></p>',
        '        <button class="uai-callback__submit" id="uai-callback-submit" type="submit"><span>Quero receber a ligação</span>' + icon("arrow-right") + '</button>',
        '        <p class="uai-callback__trust">' + icon("shield-check") + '<span>Seus dados serão usados somente para este atendimento.</span></p>',
        '        <p class="uai-callback__feedback" id="uai-callback-feedback" aria-live="polite" hidden></p>',
        '      </form>',
        '      <div class="uai-callback__success" id="uai-callback-success" tabindex="-1" hidden>',
        icon("circle-check"),
        '        <h3>Pedido recebido.</h3>',
        '        <p>Entraremos em contato pelo telefone informado em horário comercial.</p>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</section>'
    ].join("");

    doc.body.insertAdjacentHTML("beforeend", markup);

    var widget = doc.getElementById("uai-callback");
    var launcher = doc.getElementById("uai-callback-launcher");
    var panel = doc.getElementById("uai-callback-panel");
    var closeButton = doc.getElementById("uai-callback-close");
    var form = doc.getElementById("uai-callback-form");
    var nameInput = doc.getElementById("uai-callback-name");
    var phoneInput = doc.getElementById("uai-callback-phone");
    var consentInput = doc.getElementById("uai-callback-consent");
    var submitButton = doc.getElementById("uai-callback-submit");
    var feedback = doc.getElementById("uai-callback-feedback");
    var success = doc.getElementById("uai-callback-success");
    var hasOpened = false;
    var hasStarted = false;
    var submitting = false;
    var autoOpened = false;

    doc.getElementById("uai-callback-page").value = window.location.href;
    doc.getElementById("uai-callback-referrer").value = doc.referrer || "acesso_direto";

    window.setTimeout(function () {
        widget.classList.add("is-ready");
        track("callback_widget_impression", { page_path: window.location.pathname });
    }, 900);

    function isDismissedRecently() {
        var dismissedAt = Number(storageGet(window.localStorage, dismissedKey) || 0);
        return dismissedAt && Date.now() - dismissedAt < threeDays;
    }

    function consentBannerVisible() {
        var banner = doc.querySelector(".consent-banner:not([hidden])");
        return Boolean(banner);
    }

    function openPanel(source, moveFocus) {
        panel.hidden = false;
        widget.setAttribute("data-state", "open");
        launcher.setAttribute("aria-expanded", "true");
        hasOpened = true;
        track("callback_widget_open", {
            open_source: source,
            page_path: window.location.pathname
        });
        if (moveFocus) {
            nameInput.focus({ preventScroll: true });
        }
    }

    function closePanel(manual) {
        panel.hidden = true;
        widget.setAttribute("data-state", "closed");
        launcher.setAttribute("aria-expanded", "false");
        if (manual) {
            storageSet(window.localStorage, dismissedKey, String(Date.now()));
            track("callback_widget_close", { page_path: window.location.pathname });
            launcher.focus({ preventScroll: true });
        }
    }

    function tryAutoOpen(source) {
        if (autoOpened || hasOpened || isDismissedRecently() || consentBannerVisible() || doc.hidden) {
            return;
        }
        autoOpened = true;
        openPanel(source, false);
    }

    launcher.addEventListener("click", function () {
        openPanel("launcher", true);
    });

    closeButton.addEventListener("click", function () {
        closePanel(true);
    });

    doc.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && widget.getAttribute("data-state") === "open") {
            closePanel(true);
        }
    });

    window.setTimeout(function () {
        tryAutoOpen("tempo_na_pagina");
    }, 14000);

    var scrollTicking = false;
    window.addEventListener("scroll", function () {
        if (scrollTicking || autoOpened || hasOpened) {
            return;
        }
        scrollTicking = true;
        window.requestAnimationFrame(function () {
            var scrollable = doc.documentElement.scrollHeight - window.innerHeight;
            var depth = scrollable > 0 ? window.scrollY / scrollable : 0;
            if (depth >= 0.25) {
                tryAutoOpen("rolagem_25");
            }
            scrollTicking = false;
        });
    }, { passive: true });

    form.addEventListener("focusin", function () {
        if (!hasStarted) {
            hasStarted = true;
            track("callback_form_start", { page_path: window.location.pathname });
        }
    });

    phoneInput.addEventListener("input", function () {
        phoneInput.value = phoneMask(phoneInput.value);
        if (phoneInput.getAttribute("aria-invalid") === "true") {
            validatePhone();
        }
    });

    function setFieldError(field, errorId, message) {
        field.setAttribute("aria-invalid", message ? "true" : "false");
        doc.getElementById(errorId).textContent = message;
        return !message;
    }

    function validateName() {
        var value = nameInput.value.trim();
        var message = value.length < 2 ? "Informe seu nome para continuarmos." : "";
        return setFieldError(nameInput, "uai-callback-name-error", message);
    }

    function validatePhone() {
        var digits = phoneInput.value.replace(/\D/g, "");
        var message = digits.length < 10 || digits.length > 11 ? "Informe um telefone válido com DDD." : "";
        return setFieldError(phoneInput, "uai-callback-phone-error", message);
    }

    function validateConsent() {
        var message = consentInput.checked ? "" : "Confirme a autorização para receber a ligação.";
        return setFieldError(consentInput, "uai-callback-consent-error", message);
    }

    nameInput.addEventListener("blur", validateName);
    phoneInput.addEventListener("blur", validatePhone);
    consentInput.addEventListener("change", validateConsent);

    function setSubmitting(active) {
        submitting = active;
        submitButton.disabled = active;
        submitButton.setAttribute("aria-busy", active ? "true" : "false");
        submitButton.querySelector("span").textContent = active ? "Enviando pedido..." : "Quero receber a ligação";
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (submitting) {
            return;
        }

        var valid = [validateName(), validatePhone(), validateConsent()].every(Boolean);
        if (!valid) {
            var firstInvalid = form.querySelector('[aria-invalid="true"]');
            if (firstInvalid) {
                firstInvalid.focus();
            }
            track("callback_form_error", { error_type: "validation" });
            return;
        }

        var payload = {};
        new FormData(form).forEach(function (value, key) {
            payload[key] = value;
        });

        setSubmitting(true);
        feedback.hidden = true;
        track("callback_form_submit", { page_path: window.location.pathname });

        var controller = typeof AbortController === "function" ? new AbortController() : null;
        var timeoutId = window.setTimeout(function () {
            if (controller) {
                controller.abort();
            }
        }, 15000);

        fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            signal: controller ? controller.signal : undefined
        }).then(function (response) {
            return response.json().catch(function () { return {}; }).then(function (data) {
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || "Falha no envio");
                }
                return data;
            });
        }).then(function () {
            storageSet(window.sessionStorage, completedKey, "true");
            form.hidden = true;
            success.hidden = false;
            success.focus({ preventScroll: true });
            track("callback_form_success", { page_path: window.location.pathname });
            track("generate_lead", {
                lead_type: "pedido_ligacao",
                page_path: window.location.pathname
            });
        }).catch(function (error) {
            var timedOut = error && error.name === "AbortError";
            feedback.innerHTML = (timedOut ? "O envio demorou mais que o esperado." : "Não foi possível enviar agora.") + ' <a href="https://wa.me/5534988977879" target="_blank" rel="noopener noreferrer">Continuar pelo WhatsApp</a>.';
            feedback.hidden = false;
            track("callback_form_error", {
                error_type: timedOut ? "timeout" : "request"
            });
        }).finally(function () {
            window.clearTimeout(timeoutId);
            if (!form.hidden) {
                setSubmitting(false);
            }
        });
    });
}());
