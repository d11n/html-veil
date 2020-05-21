(function main (CONFIG) {
    var veils = {}
    var veils_meta = {}

    function Veil (params) {
        construct_veil.call(this, params || {})
    }
    Veil.get = get_veil
    Veil.destroy = destroy_veil
    Veil.prototype.inject = inject_veil
    Veil.prototype.remove = remove_veil
    Veil.prototype.is_activated = is_veil_activated
    Veil.prototype.is_deactivated = is_veil_deactivated
    Veil.prototype.activate = activate_veil
    Veil.prototype.deactivate = deactivate_veil
    Veil.prototype.toggle = toggle_veil
    Object.freeze(Veil)
    return export_veil(Veil)

    ///////////

    function get_veil (html_id) {
        return veils[ html_id || CONFIG.default_html_id ]
    }
    function destroy_veil (html_id) {
        var veil = get_veil(html_id)
        if (veil) {
            veil.remove()
            delete veils[veil.html_id]
        }
        return true
    }

    function export_veil (veil_class) {
        try {
            module.exports = veil_class
        } catch (no_common_js) {
            window.Veil = veil_class
        }
        return true
    }

    function construct_veil (params) {
        var veil = this
        var uniq_id = generate_uniq_id()
        var html_id = params.html_id && 'string' === typeof params.html_id
            ? params.html_id
            : CONFIG.default_html_id
        var uniq_html_id = html_id + '-' + uniq_id
        var z_index = set_z_index(params.z_index, 1000)
        var color = set_color(params.color, 'rgba(0, 0, 0, 0.7)')
        var element = null

        Object.defineProperties(veil, {
            uniq_id: { value: uniq_id },
            uniq_html_id: { value: uniq_html_id },
            html_id: {
                enumerable: true,
                value: html_id,
            },
            z_index: {
                enumerable: true,
                get: get_z_index,
                set: set_z_index,
            },
            color: {
                enumerable: true,
                get: get_color,
                set: set_color,
            },
            element: {
                enumerable: true,
                get: get_element,
                set: set_element,
            },
        })
        Object.seal(veil)
        return veils[html_id] = veil

        ///////////

        function get_z_index () {
            return z_index
        }
        function set_z_index (new_z_index, default_z_index) {
            // Negative z-indices do not make since for an HTML veil.
            return z_index = 'number' === typeof new_z_index
                ? Math.abs( Math.floor(new_z_index) ) // discard fraction
                : new_z_index && 'string' === typeof new_z_index
                    && parseFloat(new_z_index) === Number(new_z_index)
                        ? Math.abs( Math.floor( Number(new_z_index) ) )
                        : default_z_index || z_index
        }
        function get_color () {
            return color
        }
        function set_color (new_color, default_color) {
            return color = 'string' === typeof new_color
                ? new_color
                : default_color || color
        }
        function get_element () {
            return element
        }
        function set_element (new_element) {
            if (!(null === new_element || new_element instanceof HTMLElement)) {
                throw new TypeError(
                    'A Veil\'s element must be an instance of HTMLElement'
                )
            }
            return element = new_element
        }
    }

    function throw_injection_error () {
        throw new Error(
            'Veils must be inject()ed before they can do anything'
        )
    }
    function remove_veil () {
        var veil = this
        veil.element.parentElement.removeChild(veil.element)
        veil.element = null; // prop is not configurable, so not deletable
        delete veils_meta[veil.html_id]
        return true
    }
    function inject_veil () {
        var veil = this
        var meta = veils_meta[veil.html_id] = {}
        meta.veil_selector = '[data-id="' + veil.uniq_html_id + '"]'
        if (!document.querySelector(meta.veil_selector)) {
            meta.loading_class
                = veil.html_id + '-loading-' + veil.uniq_id
            var is_loading
                = -1 !== document.documentElement.className
                    .indexOf(' ' + meta.loading_class)
            if (!is_loading) {
                document.documentElement.className += ' ' + meta.loading_class
                meta.activated_class
                    = CONFIG.package_name + '-activated'
                    + ' ' + veil.html_id + '-activated'
                    + ' ' + veil.html_id
                    + '-activated-' + veil.uniq_id
                meta.activated_selector
                    = '.' + veil.html_id
                    + '-activated-' + veil.uniq_id
                meta.changing_state_class
                    = CONFIG.package_name + '-activated'
                    + ' ' + veil.html_id + '-changing_state'
                    + ' ' + veil.html_id
                    + '-changing_state-' + veil.uniq_id
                meta.changing_state_selector
                    = '.' + veil.html_id
                    + '-changing_state-' + veil.uniq_id
                document.body
                    ? put_veil_in_body()
                    : document.addEventListener(
                        'DOMContentLoaded',
                        put_veil_in_body
                    )
            }
        }
        return true

        ///////////

        function put_veil_in_body () {
            veil.element = document.body.appendChild(build_veil_element())
            veil.element.addEventListener(
                'transitionend', // IE 10+ only
                handle_veil_transitionend
            )
            document.documentElement.className
                = document.documentElement.className
                    .replace(' ' + meta.loading_class, '')
            return veil.element

            ///////////

            function handle_veil_transitionend () {
                end_veil_state_change.call(veil)
            }
            function build_veil_element () {
                var veil_element = document.createElement('div')
                veil_element.id = veil.html_id
                veil_element.className = CONFIG.package_name
                veil_element.setAttribute('data-id', veil.uniq_html_id)
                veil_element.style = [
                    'position: fixed;',
                    'top: 0;',
                    'left: 0;',
                    'right: 0;',
                    'bottom: 0;',
                ].join(' ')
                veil_element.appendChild(build_veil_style_element())
                return veil_element

                ///////////

                function build_veil_style_element () {
                    var veil_style_element = document.createElement('style')
                    veil_style_element.appendChild(document.createTextNode([
                        meta.veil_selector + ' {' // essentially "off" state
                            + ' z-index: -1;'
                            + ' background-color: ' + veil.color + ';'
                            + ' opacity: 0;'
                            + ' transition-property: opacity;'
                            + ' transition-duration: 0.5s;'
                            + ' transition-timing-function: linear;'
                            + ' transition-delay: 0s;'
                            + ' }'
                            ,
                        meta.changing_state_selector + ' {'
                            + ' z-index: ' + veil.z_index + ';'
                            + ' }'
                            ,
                        meta.activated_selector + ' {'
                            + ' z-index: ' + veil.z_index + ';'
                            + ' opacity: 1;'
                            + ' }'
                            ,
                    ].join('\n')))
                    return veil_style_element
                }
            }
        }
    }

    function is_veil_activated () {
        var veil = this
        var meta = veils_meta[veil.html_id]
        !meta && throw_injection_error()
        var html_classes = veil.element.className
        return html_classes.indexOf(meta.activated_class) >= 0
    }
    function is_veil_deactivated () {
        var veil = this
        var meta = veils_meta[veil.html_id]
        !meta && throw_injection_error()
        var html_classes = veil.element.className
        return -1 === html_classes.indexOf(meta.activated_class)
    }
    function activate_veil (params) {
        var veil = this
        var meta = veils_meta[veil.html_id]
        !meta && throw_injection_error()
        if (veil.is_deactivated()) {
            veil.element.className
                = CONFIG.package_name
                + ' ' + meta.changing_state_class
                + ' ' + meta.activated_class
            if (params.deactivator) {
                veil.element.addEventListener('click', handle_veil_click)
            }
        }
        return true

        ///////////

        function handle_veil_click (click_event) {
            if (veil.is_activated()) {
                veil.deactivate()
                params.deactivator()
                veil.element.removeEventListener('click', handle_veil_click)
            }
            return true
        }
    }
    function deactivate_veil () {
        var veil = this
        var meta = veils_meta[veil.html_id]
        !meta && throw_injection_error()
        if (veil.is_activated()) {
            veil.element.className
                = CONFIG.package_name
                + ' ' + meta.changing_state_class
        }
        return true
    }
    function toggle_veil (params) {
        var veil = this
        return veil.is_activated()
            ? veil.deactivate(params)
            : veil.activate(params)
    }
    function end_veil_state_change () {
        var veil = this
        var meta = veils_meta[veil.html_id]
        !meta && throw_injection_error()
        veil.element.className = veil.element.className
            .replace(' ' + meta.changing_state_class, '')
        return true
    }

    function generate_uniq_id (length) {
        var uniq_id_array = []
        var uniq_id_length = 'number' === typeof length
            ? Math.floor(length)
            : 64
        var legal_chars
            = '1234567890'
            + 'QWERTYUIOPASDFGHJKLZXCVBNM'
            + 'qwertyuiopasdfghjklzxcvbnm'
        var count_legal_chars = legal_chars.length
        for (var i = 0, n = uniq_id_length - 1; i <= n; i++) {
            uniq_id_array.push(
                legal_chars[ Math.floor(Math.random() * count_legal_chars) ]
            )
        }
        return uniq_id_array.join('')
    }
}(
    { package_name: 'html-veil', default_html_id: 'veil' }
))
