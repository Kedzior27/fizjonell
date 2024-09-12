var medfile20_Register = function medfile20_Register() {
    var widget = document.getElementById('medfile-register-widget');
    var iframe = document.createElement('iframe');
    var link_appended = false;
    iframe.src = widget.dataset.src;
    iframe.width = '100%';
    iframe.height = 'auto';
    iframe.style = 'border: 0; width: 100%; transition: 0.3s linear;';
    widget.appendChild(iframe);
    window.addEventListener("message", function (event) {
        var action = event.data.action;

        if (action === 'clientEvent') {
            var e = new CustomEvent('medfile', {
                detail: event.data
            });
            window.dispatchEvent(e);
            return;
        }

        if (action === 'event') {
            var e = new CustomEvent('medfile.'+event.data.data.event, {
                detail: event.data
            });
            window.dispatchEvent(e);
            return;
        }

        event.stopImmediatePropagation();
        action = typeof actions[action] != 'undefined' ? action : 'default';
        actions[action](event);
    }, false);
    var actions = {
        getCoords: function getCoords(event) {
            const rect = iframe.getBoundingClientRect();
            const iframeOffsetTop = rect.top + window.scrollY - 50;

            iframe.contentWindow.postMessage({
                y: window.scrollY,
                top: iframeOffsetTop,
                action: 'setModalCoords'
            }, '*');
        },
        hideUrl: function hideUrl(event) {
            if (event.data.state) {
                return;
            }

            if (link_appended) {
                return;
            }

            link_appended = true;
            var wrapper = document.createElement('div');
            wrapper.appendChild(document.createTextNode('Wspierane przez oprogramowanie gabinetowe '));
            wrapper.setAttribute('style', 'text-align:center !important;font-family:sans-serif;max-width:1170px !important;margin: 0 auto !important;padding:0 17px !important;color:#222 !important;color: #596877 !important;font-size: 14px !important;font-weight: 500 !important;');
            var link = document.createElement('a');
            link.setAttribute('href', 'https://www.medfile.pl');
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener');
            link.setAttribute('style', 'color:#2ec5cc; !important;');
            link.appendChild(document.createTextNode('Medfile EDM'));
            wrapper.append(link);
            iframe.parentNode.insertBefore(wrapper, iframe.nextSibling);
        },
        default: function _default(event) {
            var height = event.data.height;

            if (typeof height !== 'undefined') {
                iframe.height = height;
            }
        },

        resolveAnalytics: function () {
            if (!widget.dataset.tracker) {
                return false
            }

            if (typeof gtag !== 'undefined') {
                var clientId, sessionId
                gtag('get', widget.dataset.tracker, 'client_id', function (val) {
                    clientId = val
                })
                gtag('get', widget.dataset.tracker, 'session_id', function (val) {
                    sessionId = val
                })
                setTimeout(function () {
                    actions.sendClientId(clientId, sessionId)
                }, 1500)
                return true;
            }

            return false
        },

        sendClientId: function (clientId, sessionId) {
            iframe.contentWindow.postMessage({
                clientId: clientId,
                tracker: widget.dataset.tracker,
                sessionId: sessionId,
                action: 'setClientId'
            }, '*');
        }
    };

    var result = actions.resolveAnalytics()
    if (!result) {
        setTimeout(function () {
            actions.resolveAnalytics()
        }, 3000)
    }
};

;

(function () {
    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
        };
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
})();

window.addEventListener("load", medfile20_Register);