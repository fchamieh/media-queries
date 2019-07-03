'use strict';

//
// Media Queries Javascript
// By Fadi Chamieh - September 2017
//
(function (global, factory) {

    if (typeof module === "object" && typeof module.exports === "object") {

        // For CommonJS and CommonJS-like environments where a proper `window`
        // is present, execute the factory and get jQuery.
        // For environments that do not have a `window` with a `document`
        // (such as Node.js), expose a factory as module.exports.
        // This accentuates the need for the creation of a real `window`.
        // e.g. var jQuery = require("jquery")(window);
        // See ticket #14549 for more info.
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error("media queries requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }

    // Pass this if window is not defined yet
})(typeof window !== "undefined" ? window : this, function (window, noGlobal) {

    (function () {

        if (typeof window.CustomEvent === "function") return false;

        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }

        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
    })();

    var triggerEvent = function (target, type) {
        var a;
        document.createEvent
            ? (a = new window.CustomEvent(type), target.dispatchEvent(a))
            : (a = document.createEventObject(), target.fireEvent("on" + type, a))
    };

    if (!window.mediaQueries) createMediaQueries();

    function createMediaQueries() {

        var $mdConstant = MdConstantFactory();

        window.mediaQueries = mdMediaFactory();

        window.addEventListener("resize", onResize);
        document.addEventListener("readystatechange", onReady);

        function createStyles() {
            var style = document.createElement("style");
            document.head.appendChild(style);
        }

        var initialized = false;

        function onReady() {
            createStyles();
            onResize();
        }

        function computeAndUpdateClasses() {
            var body = document.body;
            for (var key in $mdConstant.MEDIA) {
                var className = "mq-" + key;
                var enabled = window.mediaQueries(key);
                if (body.classList.contains(className)) {
                    if (!enabled)
                        body.classList.remove(className);
                } else {
                    if (enabled)
                        body.classList.add(className);
                }
            }

            if (!initialized) {
                initialized = true;
                setTimeout(function () {
                    document.body.classList.remove("mq-not-initialized");
                    triggerEvent(window, "mqInitialized");
                });
            }
        }

        var computePromise = null;

        function onResize() {
            if (computePromise)
                clearTimeout(computePromise);
            computePromise = setTimeout(computeAndUpdateClasses, 100);
        }

        function mdMediaFactory() {

            var queries = {};
            var mqls = {};
            var results = {};
            var normalizeCache = {};

            $mdMedia.getResponsiveAttribute = getResponsiveAttribute;
            $mdMedia.getQuery = getQuery;
            $mdMedia.$mdConstant = $mdConstant;

            return $mdMedia;

            function $mdMedia(query) {
                var validated = queries[query];
                if (validated === undefined) {
                    validated = queries[query] = validate(query);
                }

                var result = results[validated];
                if (result === undefined) {
                    result = add(validated);
                }

                return result;
            }

            function validate(query) {
                return $mdConstant.MEDIA[query] ||
                    ((query.charAt(0) !== '(') ? ('(' + query + ')') : query);
            }

            function add(query) {
                var result = mqls[query];
                if (!result) {
                    result = mqls[query] = window.matchMedia(query);
                }

                result.addListener(onQueryChange);
                return (results[result.media] = !!result.matches);
            }

            function onQueryChange(query) {
                setTimeout(function () {
                    results[query.media] = !!query.matches;
                });
            }

            function getQuery(name) {
                return mqls[name];
            }

            function getResponsiveAttribute(attrs, attrName) {
                for (var i = 0; i < $mdConstant.MEDIA_PRIORITY.length; i++) {
                    var mediaName = $mdConstant.MEDIA_PRIORITY[i];
                    if (!mqls[queries[mediaName]].matches) {
                        continue;
                    }

                    var normalizedName = getNormalizedName(attrs, attrName + '-' + mediaName);
                    if (attrs[normalizedName]) {
                        return attrs[normalizedName];
                    }
                }

                // fallback on unprefixed
                return attrs[getNormalizedName(attrs, attrName)];
            }

            // Improves performance dramatically
            function getNormalizedName(attrs, attrName) {
                return normalizeCache[attrName] ||
                    (normalizeCache[attrName] = attrs.$normalize(attrName));
            }
        }

        function MdConstantFactory() {

            var prefixTestEl = document.createElement('div');
            var vendorPrefix = getVendorPrefix(prefixTestEl);
            var isWebkit = /webkit/i.test(vendorPrefix);
            var SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;

            function vendorProperty(name) {
                // Add a dash between the prefix and name, to be able to transform the string into camelcase.
                var prefixedName = vendorPrefix + '-' + name;
                var ucPrefix = camelCase(prefixedName);
                var lcPrefix = ucPrefix.charAt(0).toLowerCase() + ucPrefix.substring(1);

                return hasStyleProperty(prefixTestEl, name) ? name :       // The current browser supports the un-prefixed property
                    hasStyleProperty(prefixTestEl, ucPrefix) ? ucPrefix :       // The current browser only supports the prefixed property.
                        hasStyleProperty(prefixTestEl, lcPrefix) ? lcPrefix : name; // Some browsers are only supporting the prefix in lowercase.
            }

            function hasStyleProperty(testElement, property) {
                return testElement.style[property] !== undefined;
            }

            function camelCase(input) {
                return input.replace(SPECIAL_CHARS_REGEXP, function (matches, separator, letter, offset) {
                    return offset ? letter.toUpperCase() : letter;
                });
            }

            function getVendorPrefix(testElement) {
                var prop, match;
                var vendorRegex = /^(Moz|webkit|ms)(?=[A-Z])/;

                for (prop in testElement.style) {
                    match = vendorRegex.exec(prop);
                    if (match) {
                        return match[0];
                    }
                }
            }

            var self = {
                isInputKey: function (e) { return (e.keyCode >= 31 && e.keyCode <= 90); },
                isNumPadKey: function (e) { return (3 === e.location && e.keyCode >= 97 && e.keyCode <= 105); },
                isMetaKey: function (e) { return (e.keyCode >= 91 && e.keyCode <= 93); },
                isFnLockKey: function (e) { return (e.keyCode >= 112 && e.keyCode <= 145); },
                isNavigationKey: function (e) {
                    var kc = self.KEY_CODE, NAVIGATION_KEYS = [kc.SPACE, kc.ENTER, kc.UP_ARROW, kc.DOWN_ARROW];
                    return (NAVIGATION_KEYS.indexOf(e.keyCode) != -1);
                },
                hasModifierKey: function (e) {
                    return e.ctrlKey || e.metaKey || e.altKey;
                },

                /**
                 * Maximum size, in pixels, that can be explicitly set to an element. The actual value varies
                 * between browsers, but IE11 has the very lowest size at a mere 1,533,917px. Ideally we could
                 * compute this value, but Firefox always reports an element to have a size of zero if it
                 * goes over the max, meaning that we'd have to binary search for the value.
                 */
                ELEMENT_MAX_PIXELS: 1533917,

                /**
                 * Priority for a directive that should run before the directives from ngAria.
                 */
                BEFORE_NG_ARIA: 210,

                /**
                 * Common Keyboard actions and their associated keycode.
                 */
                KEY_CODE: {
                    COMMA: 188,
                    SEMICOLON: 186,
                    ENTER: 13,
                    ESCAPE: 27,
                    SPACE: 32,
                    PAGE_UP: 33,
                    PAGE_DOWN: 34,
                    END: 35,
                    HOME: 36,
                    LEFT_ARROW: 37,
                    UP_ARROW: 38,
                    RIGHT_ARROW: 39,
                    DOWN_ARROW: 40,
                    TAB: 9,
                    BACKSPACE: 8,
                    DELETE: 46
                },

                /**
                 * Vendor prefixed CSS properties to be used to support the given functionality in older browsers
                 * as well.
                 */
                CSS: {
                    /* Constants */
                    TRANSITIONEND: 'transitionend' + (isWebkit ? ' webkitTransitionEnd' : ''),
                    ANIMATIONEND: 'animationend' + (isWebkit ? ' webkitAnimationEnd' : ''),

                    TRANSFORM: vendorProperty('transform'),
                    TRANSFORM_ORIGIN: vendorProperty('transformOrigin'),
                    TRANSITION: vendorProperty('transition'),
                    TRANSITION_DURATION: vendorProperty('transitionDuration'),
                    ANIMATION_PLAY_STATE: vendorProperty('animationPlayState'),
                    ANIMATION_DURATION: vendorProperty('animationDuration'),
                    ANIMATION_NAME: vendorProperty('animationName'),
                    ANIMATION_TIMING: vendorProperty('animationTimingFunction'),
                    ANIMATION_DIRECTION: vendorProperty('animationDirection')
                },

                /**
                 * As defined in core/style/variables.scss
                 *
                 * $layout-breakpoint-xs:     600px !default;
                 * $layout-breakpoint-sm:     960px !default;
                 * $layout-breakpoint-md:     1280px !default;
                 * $layout-breakpoint-lg:     1920px !default;
                 *
                 */
                MEDIA: {
                    'xs': '(max-width: 599px)',
                    'gt-xs': '(min-width: 600px)',
                    'sm': '(min-width: 600px) and (max-width: 959px)',
                    'gt-sm': '(min-width: 960px)',
                    'md': '(min-width: 960px) and (max-width: 1279px)',
                    'gt-md': '(min-width: 1280px)',
                    'lg': '(min-width: 1280px) and (max-width: 1919px)',
                    'gt-lg': '(min-width: 1920px)',
                    'xl': '(min-width: 1920px)',
                    'landscape': '(orientation: landscape)',
                    'portrait': '(orientation: portrait)',
                    'print': 'print'
                },

                MEDIA_PRIORITY: [
                    'xl',
                    'gt-lg',
                    'lg',
                    'gt-md',
                    'md',
                    'gt-sm',
                    'sm',
                    'gt-xs',
                    'xs',
                    'landscape',
                    'portrait',
                    'print'
                ]
            };

            return self;
        }

    }

    if (typeof define === "function" && define.amd) {
        define("mediaQueries", [], function () {
            return window.mediaQueries;
        });
    }

});