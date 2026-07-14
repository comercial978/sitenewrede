(function () {
    "use strict";

    var doc = document;
    var root = doc.documentElement;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function storageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function storageSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            return false;
        }
        return true;
    }

    function initIcons() {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
        }
    }

    function track(eventName, parameters) {
        var details = parameters || {};
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(Object.assign({
            event: "uai_conversion",
            uai_event: eventName
        }, details));

        if (typeof window.gtag === "function") {
            window.gtag("event", eventName, details);
        }
    }

    function initNavigation() {
        var toggle = doc.querySelector(".nav__toggle");
        var list = doc.querySelector(".nav__list");

        if (!toggle || !list) {
            return;
        }

        function closeMenu() {
            list.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("title", "Abrir menu");
            doc.body.classList.remove("nav-open");
        }

        toggle.addEventListener("click", function () {
            var isOpen = list.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
            toggle.setAttribute("title", isOpen ? "Fechar menu" : "Abrir menu");
            doc.body.classList.toggle("nav-open", isOpen);
        });

        list.addEventListener("click", function (event) {
            if (event.target.closest("a")) {
                closeMenu();
            }
        });

        doc.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 900) {
                closeMenu();
            }
        });
    }

    function initReveal() {
        var items = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));

        if (reducedMotion || !("IntersectionObserver" in window)) {
            items.forEach(function (item) { item.classList.add("is-visible"); });
            return;
        }

        root.classList.add("motion");
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

        items.forEach(function (item) { observer.observe(item); });
    }

    function initTrackingLinks() {
        doc.addEventListener("click", function (event) {
            var target = event.target.closest("[data-track]");
            if (!target) {
                return;
            }

            track(target.getAttribute("data-track"), {
                event_label: target.getAttribute("data-label") || "sem_identificacao",
                link_url: target.getAttribute("href") || ""
            });
        });
    }

    function initPortfolioFilters() {
        var buttons = Array.prototype.slice.call(doc.querySelectorAll(".filter-button"));
        var cards = Array.prototype.slice.call(doc.querySelectorAll(".project-card[data-category]"));

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var filter = button.getAttribute("data-filter");

                buttons.forEach(function (item) {
                    var active = item === button;
                    item.classList.toggle("is-active", active);
                    item.setAttribute("aria-pressed", String(active));
                });

                cards.forEach(function (card) {
                    var categories = (card.getAttribute("data-category") || "").split(" ");
                    card.hidden = filter !== "all" && categories.indexOf(filter) === -1;
                });

                track("portfolio_filter", { filter_name: filter });
            });
        });
    }

    function readFirstTouch() {
        var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
        var params = new URLSearchParams(window.location.search);
        var stored = {};

        try {
            stored = JSON.parse(storageGet("uai_first_touch") || "{}");
        } catch (error) {
            stored = {};
        }

        var hasNewUtm = keys.some(function (key) { return params.has(key); });
        if (hasNewUtm && !storageGet("uai_first_touch")) {
            keys.forEach(function (key) { stored[key] = params.get(key) || ""; });
            stored.referrer = doc.referrer || "acesso_direto";
            stored.first_contact = new Date().toISOString();
            storageSet("uai_first_touch", JSON.stringify(stored));
        }

        if (!stored.first_contact) {
            stored.first_contact = new Date().toISOString();
            stored.referrer = doc.referrer || "acesso_direto";
            storageSet("uai_first_touch", JSON.stringify(stored));
        }

        keys.forEach(function (key) {
            var field = doc.getElementById(key);
            if (field) {
                field.value = stored[key] || params.get(key) || "";
            }
        });

        var originField = doc.getElementById("pagina_origem");
        var firstContactField = doc.getElementById("data_primeiro_contato");
        if (originField) {
            originField.value = stored.referrer || doc.referrer || "acesso_direto";
        }
        if (firstContactField) {
            firstContactField.value = stored.first_contact;
        }
    }

    function normalizeUrl(input) {
        var value = input.value.trim();
        if (value && !/^https?:\/\//i.test(value) && value.indexOf(".") > -1) {
            input.value = "https://" + value;
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

    function validationMessage(field) {
        var value = field.type === "checkbox" ? field.checked : field.value.trim();

        if (field.required && !value) {
            if (field.type === "checkbox") {
                return "Confirme o consentimento para enviar a solicitação.";
            }
            return "Preencha este campo para continuar.";
        }

        if ((field.id === "audit-name" || field.id === "audit-company") && field.value.trim().length < 2) {
            return "Digite pelo menos 2 caracteres.";
        }

        if (field.id === "audit-phone") {
            var digits = field.value.replace(/\D/g, "");
            if (digits.length < 10 || digits.length > 11) {
                return "Informe um WhatsApp com DDD.";
            }
        }

        if (field.id === "audit-url" && field.value) {
            try {
                var url = new URL(field.value);
                if (url.protocol !== "http:" && url.protocol !== "https:") {
                    return "Informe um endereço de site válido.";
                }
            } catch (error) {
                return "Use um endereço como https://suaempresa.com.br";
            }
        }

        return "";
    }

    function showFieldError(field) {
        var message = validationMessage(field);
        var error = doc.getElementById(field.id + "-error");
        field.setAttribute("aria-invalid", message ? "true" : "false");
        if (error) {
            error.textContent = message;
        }
        return !message;
    }

    function initAuditForm() {
        var form = doc.getElementById("audit-form");
        var success = doc.getElementById("form-success");
        var feedback = doc.getElementById("form-feedback");
        var feedbackTitle = doc.getElementById("form-feedback-title");
        var feedbackMessage = doc.getElementById("form-feedback-message");
        var feedbackWhatsapp = doc.getElementById("form-feedback-whatsapp");
        if (!form) {
            return;
        }

        readFirstTouch();

        var fields = Array.prototype.slice.call(form.querySelectorAll("input[required]"));
        var phone = doc.getElementById("audit-phone");
        var url = doc.getElementById("audit-url");
        var submitButton = form.querySelector("button[type='submit']");
        var submitLabel = submitButton ? submitButton.querySelector(".button__label") : null;
        var defaultSubmitLabel = submitLabel ? submitLabel.textContent : "";
        var started = false;
        var submitted = false;
        var isSubmitting = false;

        function setFeedback(type, title, message) {
            if (!feedback) {
                return;
            }

            feedback.classList.remove("is-pending", "is-error");
            feedback.classList.add("is-" + type);
            feedback.hidden = false;
            if (feedbackTitle) {
                feedbackTitle.textContent = title;
            }
            if (feedbackMessage) {
                feedbackMessage.textContent = message;
            }
            if (feedbackWhatsapp) {
                feedbackWhatsapp.hidden = type !== "error";
            }
        }

        function setSubmittingState(active) {
            isSubmitting = active;
            if (!submitButton) {
                return;
            }

            submitButton.disabled = active;
            submitButton.classList.toggle("is-loading", active);
            submitButton.setAttribute("aria-busy", active ? "true" : "false");
            if (submitLabel) {
                submitLabel.textContent = active ? "Enviando análise..." : defaultSubmitLabel;
            }
        }

        function submitWithAjax() {
            var controller = typeof AbortController === "function" ? new AbortController() : null;
            var timeoutId = window.setTimeout(function () {
                if (controller) {
                    controller.abort();
                }
            }, 15000);
            var payload = {};

            new FormData(form).forEach(function (value, key) {
                payload[key] = value;
            });

            return fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
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
                        throw new Error(data.message || "Falha ao enviar o formulário.");
                    }
                    return data;
                });
            }).finally(function () {
                window.clearTimeout(timeoutId);
            });
        }

        if (phone) {
            phone.addEventListener("input", function () {
                phone.value = phoneMask(phone.value);
                if (phone.getAttribute("aria-invalid") === "true") {
                    showFieldError(phone);
                }
            });
        }

        if (url) {
            url.addEventListener("blur", function () {
                normalizeUrl(url);
                showFieldError(url);
            });
        }

        fields.forEach(function (field) {
            field.addEventListener("blur", function () { showFieldError(field); });
            field.addEventListener("input", function () {
                if (field.getAttribute("aria-invalid") === "true") {
                    showFieldError(field);
                }
            });
            field.addEventListener("change", function () { showFieldError(field); });
        });

        form.addEventListener("focusin", function () {
            if (!started) {
                started = true;
                track("audit_form_start", { form_name: "auditoria_express" });
            }
        }, { once: true });

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            if (isSubmitting) {
                return;
            }

            if (url) {
                normalizeUrl(url);
            }

            var valid = fields.map(showFieldError).every(Boolean);
            if (!valid) {
                var firstInvalid = form.querySelector("[aria-invalid='true']");
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                track("audit_form_error", { form_name: "auditoria_express" });
                return;
            }

            setSubmittingState(true);
            setFeedback("pending", "Enviando sua solicitação...", "Aguarde alguns segundos enquanto confirmamos o recebimento.");
            track("audit_form_submit", {
                form_name: "auditoria_express",
                form_destination: "formsubmit"
            });

            submitWithAjax().then(function () {
                submitted = true;
                form.hidden = true;
                if (feedback) {
                    feedback.hidden = true;
                }
                if (success) {
                    success.hidden = false;
                    success.focus({ preventScroll: true });
                }
                if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, "", window.location.pathname + "#auditoria");
                }
                track("audit_form_success", { form_name: "auditoria_express" });
            }).catch(function (error) {
                var timedOut = error && error.name === "AbortError";
                setFeedback(
                    "error",
                    timedOut ? "O envio demorou mais que o esperado." : "Não foi possível confirmar o envio.",
                    "Tente novamente ou envie a solicitação pelo WhatsApp. Seus dados permanecem preenchidos."
                );
                track("audit_form_error", {
                    form_name: "auditoria_express",
                    error_type: timedOut ? "timeout" : "request"
                });
            }).finally(function () {
                if (!submitted) {
                    setSubmittingState(false);
                }
            });
        });

        form.dataset.ajaxReady = "true";

        window.addEventListener("pagehide", function () {
            if (started && !submitted) {
                track("audit_form_abandon", {
                    form_name: "auditoria_express",
                    transport_type: "beacon"
                });
            }
        });

        var query = new URLSearchParams(window.location.search);
        if (query.get("auditoria") === "enviada" && success) {
            submitted = true;
            success.hidden = false;
            form.hidden = true;
            track("audit_form_success", { form_name: "auditoria_express" });
        }
    }

    function initScrollDepth() {
        var milestones = [25, 50, 75, 90];
        var reached = {};
        var ticking = false;

        function measure() {
            var scrollable = doc.documentElement.scrollHeight - window.innerHeight;
            var depth = scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 100;
            milestones.forEach(function (milestone) {
                if (depth >= milestone && !reached[milestone]) {
                    reached[milestone] = true;
                    track("scroll_depth", { percent_scrolled: milestone });
                }
            });
            ticking = false;
        }

        window.addEventListener("scroll", function () {
            if (!ticking) {
                window.requestAnimationFrame(measure);
                ticking = true;
            }
        }, { passive: true });
    }

    function initConsent() {
        var banner = doc.getElementById("consent-banner");
        if (!banner) {
            return;
        }

        var choice = storageGet("uai_analytics_consent");
        if (!choice) {
            banner.hidden = false;
            doc.body.classList.add("consent-open");
        }

        banner.addEventListener("click", function (event) {
            var button = event.target.closest("[data-consent]");
            if (!button) {
                return;
            }

            var consent = button.getAttribute("data-consent");
            storageSet("uai_analytics_consent", consent);
            banner.hidden = true;
            doc.body.classList.remove("consent-open");

            if (typeof window.gtag === "function") {
                window.gtag("consent", "update", {
                    analytics_storage: consent,
                    ad_storage: "denied",
                    ad_user_data: "denied",
                    ad_personalization: "denied"
                });
            }

            if (consent === "granted") {
                track("analytics_consent_granted", { consent_source: "site_banner" });
            }
        });
    }

    function initDetailsTracking() {
        doc.querySelectorAll("details").forEach(function (details) {
            details.addEventListener("toggle", function () {
                if (details.open) {
                    var summary = details.querySelector("summary");
                    track("content_expand", {
                        content_label: summary ? summary.textContent.trim() : "detalhe"
                    });
                }
            });
        });
    }

    function init() {
        initIcons();
        initNavigation();
        initReveal();
        initTrackingLinks();
        initPortfolioFilters();
        initAuditForm();
        initScrollDepth();
        initConsent();
        initDetailsTracking();

        var year = doc.getElementById("current-year");
        if (year) {
            year.textContent = String(new Date().getFullYear());
        }
    }

    if (doc.readyState === "loading") {
        doc.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
