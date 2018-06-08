odoo.define('web.inputmask_widgets', function (require) {
    "use strict";
    /*var bus = require('bus.bus').bus;*/
    var core = require('web.core');
    var translation = require('web.translation');
    var _t = translation._t;
    var form_widgets = require('web.form_widgets');
    var kanban_widgets = require('web_kanban.widgets');
    var WebClient = require('web.WebClient');
    var Notification = require('web.notification').Notification;
    var list_widget_registry = core.list_widget_registry;
    var QWeb = core.qweb;

    const DATA_INPUTMASK_DIASTOLIC_MIN = 'data-inputmask-diastolic-min';

    var InputMaskNotification = Notification.extend({
        template: "InputMaskNotification",
    
        init: function(parent, title, text, eid) {
            this._super(parent, title, text, true);
            this.eid = eid;
    
            this.events = _.extend(this.events || {}, {
                'click .link2event': function() {
                    var self = this;
    
                    this.rpc("/web/action/load", {
                        action_id: "calendar.action_calendar_event_notify",
                    }).then(function(r) {
                        r.res_id = self.eid;
                        return self.do_action(r);
                    });
                },
    
                'click .link2recall': function() {
                    this.destroy(true);
                },
    
                'click .link2showed': function() {
                    this.destroy(true);
                    this.rpc("/calendar/notify_ack");
                },
            });
        },
    });
    
    function mask_attrs(attrs) {
        var keyMask = 'data-inputmask';
        var attrsMask;
        attrsMask = Object.keys(attrs).reduce(function (filtered, key) {
            if (key.indexOf(keyMask) !== -1)
                filtered[key] = attrs[key];
            return filtered;
        }, {});
        if (!attrsMask)
            console.warn("The widget Mask expects the 'data-inputmask[-attribute]' attrsMask!");
        return attrsMask;
    }

    var AbstractFieldMask = {
        template: "FieldMask",
        attrsMask: {},
        maskType: undefined,
        init: function (field_manager, node) {
            this._super(field_manager, node);
            this.attrsMask =  _.extend({}, this.attrsMask, mask_attrs(node.attrs));
        },
        render_value: function () {
            this._super();
            const CE = 'contenteditable';
            parent = false;
            if (this.$input !== undefined) {
                this.$input.inputmask(this.maskType,
                    { "onincomplete": function() {
                            alert('inputmask incomplete');
                        },
                      "oncomplete": function() {
                            alert('inputmask complete');
                        },
                    });
                
                parent = this.$input.parent()
                this.add_sufix(parent)
            } else {
                this.$el.val(this.$el.text());
                this.add_sufix(parent)
            }
            if (CE in this.node.attrs || CE in this.attrsMask)
                this.$el.inputmask(this.maskType);
        },
        add_sufix: function (parent=false) {
            const SUFFIX = 'suffix';
            const CLASS = 'inline';
            const SCALE = 'scale';
            const MEASURE = 'measure';
            const MIN = 'min';
            const MAX = 'max';
            const SYSTOLIC_MIN = 'systolic-min';
            const SYSTOLIC_MAX = 'systolic-max';
            const DIASTOLIC_MIN = 'diastolic-min';
            const DIASTOLIC_MAX = 'diastolic-max';
            const TEMPERATURE_WIDGET = 'temperature_mask';
            const BLOODPRESSURE_WIDGET = 'bloodpressure_mask';

            const TIPSO = 'data-tipso';

            //var scale = '°C';
            //var measure = 'mmHg/mmHg';
            var suffix_value = undefined;

            if(TIPSO in this.node.attrs) {
                if (this.$input !== undefined)
                    this.$input.attr(TIPSO, this.node.attrs[TIPSO]);
                    this.$input.tipso({titleContent: 'Ayuda',});
            }
            if(this.widget == TEMPERATURE_WIDGET) {
                /*if(this.$input !== undefined) {
                    this.$input.change(function(e) {
                        alert( "Handler for .change() called." );
                    });
                }*/
                if(SCALE in this.node.attrs) {
                    if(this.node.attrs[SCALE])
                        suffix_value = this.node.attrs[SCALE]
                } else {
                    suffix_value = this.attrsMask['data-inputmask-scale'];
                }
                if(MIN in this.node.attrs) {
                    if (this.$input !== undefined)
                        this.$input.attr('data-inputmask-min', this.node.attrs[MIN])
                }
                if(MAX in this.node.attrs) {
                    if (this.$input !== undefined)
                        this.$input.attr('data-inputmask-max', this.node.attrs[MAX])
                }
            }
            
            if(this.widget == BLOODPRESSURE_WIDGET) {
                if(MIN in this.node.attrs && MAX in this.node.attrs) {
                    this.attrsMask[DATA_INPUTMASK_DIASTOLIC_MIN] = this.node.attrs[MIN],
                    this.attrsMask['data-inputmask-diastolic-max'] = this.node.attrs[MAX]
                    this.attrsMask['data-inputmask-systolic-min'] = this.node.attrs[MIN],
                    this.attrsMask['data-inputmask-systolic-max'] = this.node.attrs[MAX]
                }
                if(DIASTOLIC_MIN in this.node.attrs && DIASTOLIC_MAX in this.node.attrs) {
                    this.$input.attr(DATA_INPUTMASK_DIASTOLIC_MIN, this.node.attrs[DIASTOLIC_MIN]);
                    this.$input.attr('data-inputmask-diastolic-max', this.node.attrs[DIASTOLIC_MAX]);
                    this.attrsMask[DATA_INPUTMASK_DIASTOLIC_MIN] = this.node.attrs[DIASTOLIC_MIN],
                    this.attrsMask['data-inputmask-diastolic-max'] = this.node.attrs[DIASTOLIC_MAX]
                }
                if(SYSTOLIC_MIN in this.node.attrs && SYSTOLIC_MAX in this.node.attrs) {
                    this.$input.attr('data-inputmask-systolic-min', this.node.attrs[SYSTOLIC_MIN]);
                    this.$input.attr('data-inputmask-systolic-max', this.node.attrs[SYSTOLIC_MAX]);
                    this.attrsMask['data-inputmask-systolic-min'] = this.node.attrs[SYSTOLIC_MIN],
                    this.attrsMask['data-inputmask-systolic-max'] = this.node.attrs[SYSTOLIC_MAX]
                }
                if(MEASURE in this.node.attrs) {
                    if (this.node.attrs[MEASURE]) {
                        suffix_value = this.node.attrs[MEASURE]
                    }
                } else {
                    suffix_value = this.attrsMask['data-inputmask-measure'];
                }
                if(this.$input !== undefined) {
                    this.$input.change(function(e) {
                        var value = e.currentTarget.value.replace(/_/g, "").split("/");
                        if ( ! (value[0] >= $(this).attr('data-inputmask-systolic-min') && value[0] <= $(this).attr('data-inputmask-systolic-max')) ) {
                            /*alert('systolic out of range');*/
                            e.stopPropagation();
                            this.value = ""
                            $(this).focus().select();
                            $(this).tipso('show');
                        }
                        if ( ! (value[1] >= $(this).attr(DATA_INPUTMASK_DIASTOLIC_MIN) && value[1] <= $(this).attr('data-inputmask-diastolic-max')) ) {
                            /*alert('diastolic out of range');*/
                            e.stopPropagation();
                            this.value = ""
                            $(this).focus().select();
                            $(this).tipso('show');
                            $(this).tipso('update', 'content', 'New content!');
                        }
                    });
                    this.$input.blur(function(e) {
                        $(this).tipso('hide');
                    });
                    this.$input.focus(function(e) {
                        $(this).tipso('show');
                    });
                    this.$input.keypress(function(e) {
                        $(this).tipso('show');
                    });
                }
            }

            if (SUFFIX in this.node.attrs) {
                if (this.node.attrs[SUFFIX] == "true") {
                    var suffix = $("<span class='mask-suffix input-group-text'></span>").text(suffix_value);
                    var container_div = $('<div class="input-group mb-3"></div>');
                    var prefix_div = $('<div class="input-group-prepend"></div>');
                    var sufix_div = $('<div class="input-group-append"></div>');
                    
                    var domElement = $( this ).get( 0 );
                    var span = domElement.$el.parent()
                    if(span.is('td')) {
                        sufix_div.append(suffix);
                        container_div.append(prefix_div);
                        this.$el.addClass(CLASS);
                        this.$el.detach().appendTo(container_div);
                        container_div.append(sufix_div);
                        container_div.addClass(CLASS);
                        span.append(container_div);
                    } else {
                        this.$el.addClass(CLASS);
                    }
                }
            }
        },
    };

    var FieldMask = form_widgets.FieldChar.extend(AbstractFieldMask);

    var FieldIntegerMask = form_widgets.FieldFloat.extend(AbstractFieldMask, {
        attrsMask: {
            'contenteditable': false,
            'data-inputmask-alias': 'integer',
            'data-inputmask-min': -2147483648,
            'data-inputmask-max': 2147483647,
            'data-inputmask-autounmask': true,
            'data-inputmask-autogroup': true,
            'data-inputmask-groupseparator': _t.database.parameters.thousands_sep
        },
    });

    var FieldFloatMask = form_widgets.FieldFloat.extend(AbstractFieldMask, {
        attrsMask: {
            'contenteditable': false,
            'data-inputmask-alias': 'decimal',
            'data-inputmask-autounmask': true,
            'data-inputmask-autogroup': true,
            'data-inputmask-groupseparator': _t.database.parameters.thousands_sep,
            'data-inputmask-radixpoint': _t.database.parameters.decimal_point,
        },
    });

    var FieldTemperatureMask = form_widgets.FieldFloat.extend(AbstractFieldMask, {
        attrsMask: {
            'contenteditable': false,
            'data-inputmask-alias': 'decimal',
            'data-inputmask-min': -100,
            'data-inputmask-max': 100,
            'data-inputmask-scale': '°C',
            'data-inputmask-autounmask': true,
            'data-inputmask-autogroup': true,
            'data-inputmask-groupseparator': _t.database.parameters.thousands_sep,
            'data-inputmask-radixpoint': _t.database.parameters.decimal_point,
        },
    });

    var FieldBloodPressureMask = form_widgets.FieldFloat.extend(AbstractFieldMask, {
        attrsMask: {
            'contenteditable': false,
            'data-inputmask-alias': 'mask',
            DATA_INPUTMASK_DIASTOLIC_MIN: 105,
            'data-inputmask-diastolic-max': 160,
            'data-inputmask-systolic-min': 60,
            'data-inputmask-systolic-max': 100,
            'data-inputmask-measure': 'mmHg/mmHg',
            'data-inputmask-autounmask': false,
            'data-inputmask-autogroup': true,
            'data-inputmask-groupseparator': _t.database.parameters.thousands_sep
        },
    });

    var FieldRegexMask = FieldMask.extend({
        maskType: "Regex"
    });

    var ColumnMask = list_widget_registry.get('field.char').extend({
        attrsMask: {},
        $mask: undefined,
        init: function (id, tag, attrs) {
            this._super(id, tag, attrs);
            this.attrsMask = mask_attrs(attrs);
            if (this.attrsMask)
                this.$mask = $(jQuery.parseHTML(QWeb.render('Widget.mask', {widget: this}))).inputmask(undefined, {placeholder: '', greedy: false});
        },
        format: function (row_data, options) {
            var value = this._super(row_data, options);
            if(this.$mask) {
                this.$mask.val(value);
                value = this.$mask.val();
            }
            return value;
        }
    });

    var MaskWidget = kanban_widgets.AbstractField.extend({
        tagName: 'span',
        attrsMask: {},
        init: function(parent, field, $node) {
            this._super(parent, field, $node);
            this.attrsMask = mask_attrs(field.__attrs);
            if(this.attrsMask)
                this.$mask = $(jQuery.parseHTML(QWeb.render('Widget.mask', {widget: this}))).inputmask(undefined, {placeholder: '', greedy: false});
        },
        renderElement: function () {
            var value = this.field.raw_value;
            if(this.$mask)
                this.$mask.val(value);
                value = this.$mask.val();
            this.$el.text(value);
        }
    });

    core.form_widget_registry
        .add('mask', FieldMask)
        .add('integer_mask', FieldIntegerMask)
        .add('float_mask', FieldFloatMask)
        .add('mask_regex', FieldRegexMask) //@ Deprecated latest version FOR name conversion!
        .add('regex_mask', FieldRegexMask)
        .add('temperature_mask', FieldTemperatureMask)
        .add('bloodpressure_mask', FieldBloodPressureMask);

    core.form_widget_registry.add('mask_regex', FieldRegexMask);
    list_widget_registry.add('field.mask', ColumnMask);
    kanban_widgets.registry.add("mask", MaskWidget);

    return {FieldMask: FieldMask, FieldMaskRegex: FieldRegexMask, MaskWidget: MaskWidget};
});

