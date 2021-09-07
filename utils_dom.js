import { Utils_reflection } from './utils_reflection.js';

var UTILS_dom = (function ()
{
});

UTILS_dom.turnObjToArray = function (obj) {
  return [].map.call(obj, (element) => element);
};

UTILS_dom.queryArray = function (obj, selector) {
  return UTILS_dom.turnObjToArray(obj.querySelector(selector));
};

UTILS_dom.queryAllArray = function (obj, selector) {
  return UTILS_dom.turnObjToArray(obj.querySelectorAll(selector));
};

UTILS_dom.map_shortcut = function (field_info) {
  if (field_info.t) {
    field_info.el_type = field_info.t;
  }
  if (field_info.c) {
    field_info.className = field_info.c;
  } else if (field_info.class) {
    field_info.className = field_info.class;
  }
};

UTILS_dom.createElement = function (field_info) {
  var el_field;
  UTILS_dom.map_shortcut(field_info);

  var fabrick = FABRICKs[field_info.el_type];

  if (fabrick) {
    el_field = fabrick(field_info);
  } else {
    // el_field = document.createElement( field_info.el_type );
    el_field = UTILS_dom.Create_generic(field_info);
  }

  return el_field;
};

UTILS_dom.createElements = function (...fields_info) {
  fields_info.forEach((f) => UTILS_dom.createElement(f));
};

UTILS_dom.create_field = function (field_meta, field_el, label) {
  var sub_field_div = UTILS_dom.createElement({ el_type: 'div', className: 'flex_grow_1' });
    var label_el = UTILS_dom.createElement({ el_type: 'div', className: 'font_size_70', text: (label) ? label : field_meta.label });
  !field_el && (field_el = UTILS_dom.createElement(field_meta));

  UTILS_dom.appendChilds(sub_field_div, label_el, field_el);

  sub_field_div.get_value = () => field_el.value;
  return sub_field_div;
};



UTILS_dom.Create_table = function (field_info) {
  var el_table = document.createElement('TABLE');

  // el_table.id = field_info.id;
  field_info.cellspacing && (el_table.cellSpacing = field_info.cellspacing);
  field_info.no_cell_click && (el_table.no_cell_click = field_info.no_cell_click);

  set_commun_params(el_table, field_info);
  return el_table;
};

UTILS_dom.appendChilds = function (parent, ...childs) {
  childs.forEach((child) => child && parent.appendChild(child));
};

UTILS_dom.createAndWarpWith = function (to_create, to_warp) {
  var el = UTILS_dom.createElement(to_create);
  el.appendChild(to_warp);

  return el;
};

UTILS_dom.createAndAppendChilds = function (to_appends, parent) {
  var el;
  to_appends.forEach(function (el_meta) {
    el = UTILS_dom.createElement(el_meta);
    el = UTILS_dom.getLastParent(el);
    parent.appendChild(el);
  });
};

UTILS_dom.getTable = function (el, predicat) {
  return UTILS_dom.getFirstParentWheretagName(el, 'TABLE' );
};

UTILS_dom.getFirstParentWheretagName = function (el, tagName) {
  var predicat = (el) => el.tagName == tagName;
  return UTILS_dom.getFirstParentWhere(el, predicat);
};

UTILS_dom.getFirstParentWhere = function (el, predicat) {
  var parentNode = el;

  while (parentNode != null && !predicat(parentNode)) {
    parentNode = parentNode.parentNode;
  }

  return parentNode;
};

UTILS_dom.getLastParent = function (el) {
  var parentNode = el;
  while (parentNode.parentNode != null) {
    parentNode = parentNode.parentNode;
  }

  return parentNode;
};

UTILS_dom.createAndAppendFields = function (to_appends, parent) {
  var el;
  to_appends.forEach(function (el_meta) {
    el_meta && (el = UTILS_dom.create_field(el_meta));
    el && parent.appendChild(el);
  });
};

UTILS_dom.insertAsFirst = function (to_insert, parent) {
  parent.insertBefore(to_insert, parent.childNodes[0]);
};

UTILS_dom.insertAfter = function (to_insert, el_before)
{
  el_before.parentNode.insertBefore(to_insert, el_before.nextSibling);
};

UTILS_dom.Clear_select = function (select)
{
  for (a in select.options)
  { select.options.remove(0); }
};

UTILS_dom.Clear_data_list = function (data_list)
{
  var childArray = [].slice.call(data_list.children);

  childArray.forEach(function (child)
  {
    data_list.removeChild(child);
  });
};

UTILS_dom.Clear = function (el)
{
  if (el.type == 'select-one' ) {
    UTILS_dom.Clear_select(el);
  } else {
    UTILS_dom.Clear_data_list(el);
  }
};

var DONT_CLEAR = true;
UTILS_dom.add_option = function (el, data, field_info, can_have_double) {
  if (!can_have_double && UTILS_dom.contain_option(el, data)) return;

  UTILS_dom.populate(el, [data], field_info, DONT_CLEAR);
};

UTILS_dom.contain_option = function (el, data, field_info) {
  return UTILS_dom.get_option(el, data);
};

UTILS_dom.remove_option = function (el, option_id) {
  UTILS_dom.get_option(el, option_id).remove();
};

UTILS_dom.get_option = function (el, option_id) {
  return el.querySelector('#' + option_id);
};

UTILS_dom.populate = function (el, datas, field_info, DONT_CLEAR) {
  !field_info && (field_info = {});
  var path_label = (field_info && field_info.paths && field_info.paths.label) ? 
    field_info.paths.label : 'label' ;
  var path_id = (field_info && field_info.paths && field_info.paths.id) ? 
    field_info.paths.id : 'id' ;

  var item1 = datas[0];
  var option = null;
  if (!DONT_CLEAR) UTILS_dom.Clear(el);

  if (typeof (item1) === 'object' ) {
    datas.forEach(function (data) {
      option = document.createElement('option');
      option.text = data[path_label]; // e.party_id;
      option.id = data[path_id];
      option.data = data;
      /* var dataset = ( field_info.data_path )?
          data[ field_info.data_path ] :
          data;
*/
      // option.dataset.data = JSON.stringify( dataset );

      if (el.is_datalist) el.appendChild(option);
      else el.add(option);
      });
    if (field_info.selected) {
      el.value = field_info.selected;
    } else {
      el.value = item1[path_label];
    }

    el.get_value = function () {
      // var id = el.selectedOptions[ 0 ].id;
      // return datas.find( (d)=> d.id == id );

      return el.selectedOptions[0].data;
    };
  } else {
    datas.forEach(function (data) {
      option = document.createElement('option');
      option.text = data; // e.party_id;
      option.id = data;
      option.dataset.data = JSON.stringify({ label: data, id: data });

      if (el.is_datalist) el.appendChild(option);
      else el.add(option);
    });

    el.get_value = function () {
      return el.selectedOptions[0].id;
    };
  }
};

var get_datas = function (field_info) {
  var datas = (field_info.values) ? field_info.values : field_info.data_getter();
  if (!datas || datas.length == 0) return null;

  if (datas.attrs) datas = datas.attrs;

  return datas;
};

//------------------------------------------------------------------------------------------------------------------------

UTILS_dom.Create_generic = function (field_info) {
  var el = document.createElement(field_info.el_type);
  set_commun_params(el, field_info);

  return el;
};

UTILS_dom.Create_dataList = function (field_info) {
  var list_id = `${field_info.label  }_list_id`;
  var el_field = document.createElement('SPAN');
  var el_input = document.createElement('INPUT');
  el_input.setAttribute('list', list_id);
  el_input.className = 'input_datalist';
  //  el_field.appendChild( el_input );

  var el_data_list = document.createElement('DATALIST');
  el_data_list.setAttribute('id', list_id);
  el_data_list.setAttribute('is_datalist', true);

  el_input.appendChild(el_data_list);
  el_input.dataset.type = 'datalist';

  var datas = get_datas(field_info);
  if (!datas) return el_input;

  el_input.get_selected = function () {
    return datas.find((el) => el.label == el_input.value);
  };

  UTILS_dom.populate(el_data_list, datas, field_info);
  // set_commun_params(el, field_info);

  return el_input;
};

UTILS_dom.Create_select = function (field_info) {
  var el = document.createElement("select");

  var datas = get_datas(field_info);
  if (!datas) return el;

  UTILS_dom.populate(el, datas, field_info);
  set_commun_params(el, field_info);

  return el;
};

UTILS_dom.Multi_create_select = function (field_info) {
  var el = document.createElement("select");

  var datas = get_datas(field_info);
  if (!datas) return el;

  UTILS_dom.populate(el, datas, field_info);
  set_commun_params(el, field_info);

  return el;
};

UTILS_dom.Create_radio = function (field_info) {
  var el_field = document.createElement("span");
  el_field.type = "radio";
  var {vals} = field_info, 
el, 
label, 
first = true;
  if (field_info.value) {
    first = false;
  }

  vals.forEach(function (val) {
    el = document.createElement('input');
    el.type = 'radio';
    el.name = (field_info.name) ? field_info.name : (field_info.id) ? field_info.id : null;
    el.id = val.value;
    el.value = val.value;
    label = UTILS_dom.Create_label({ text: val.label, value: val.value }, el);

    // label.appendChild( el );
    el_field.appendChild(label);

    if (el.id == field_info.value) {
      el.checked = true;
    }
    if (first) {
      first = false;
      el.checked = true;
    }
  });

  set_commun_params(el_field, field_info);

  return el_field;
};

UTILS_dom.Create_label = function (field_info, el) {
  var el_label = document.createElement("LABEL");

  var id = (el) ? el.id : field_info.id;
  el_label.setAttribute('for', id);
  el_label.innerText = field_info.text;

  (el) && (el_label.appendChild(el));
  field_info.className && (el_label.className = field_info.className);

  // set_commun_params(el_label, field_info);

  return el_label;
};

UTILS_dom.Create_template = function (field_info) {
  var el = document.createElement("TEMPLATE");
  set_commun_params(el, field_info);

  return el;
};

UTILS_dom.Create_div = function (field_info) {
  var el = document.createElement("DIV");
  set_commun_params(el, field_info);

  return el;
};

UTILS_dom.Create_button = function (field_info) {
  var el = document.createElement("BUTTON");
  set_commun_params(el, field_info);

  return el;
};

UTILS_dom.Create_input = function (field_info) {
  var el = document.createElement("INPUT");
  el.get_value = function () {
    return el.value;
  };
  set_commun_params(el, field_info);

  return el;
};

UTILS_dom.Create_checkbox = function (field_info) {
  var el = document.createElement("INPUT");
  field_info.type = "checkbox";
  el.get_value = () => (el.checked);
  set_commun_params(el, field_info);

  return el;
};

UTILS_dom.Create_path = function (field_info) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttributeNS(null, 'd', field_info.d);
  //  set_commun_params(el, field_info);
  field_info.className && el.setAttributeNS(null, 'class', field_info.className);
  field_info.parent && field_info.parent.appendChild(el);
  field_info.id && el.setAttributeNS(null, 'id', field_info.id);

  return el;
};

UTILS_dom.Create_circle = function (field_info) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  el.setAttributeNS(null, 'r', field_info.rayon);

  set_commun_params(el, field_info);

  return el;
};

UTILS_dom.Create_svg = function (field_info) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('width', field_info.width);
  el.setAttribute('height', field_info.height);

  set_commun_params(el, field_info);

  return el;
};

UTILS_dom.Create_span = function (field_info) {
  var el = document.createElement("SPAN");
  set_commun_params(el, field_info);

  return el;
};

UTILS_dom.Create_style = function (field_info) {
  var el = document.createElement("STYLE");
  var css = field_info.text;
  el.appendChild(document.createTextNode(css));
  el.type = 'text/css';

  document.head.appendChild(el);

  return el;
};

UTILS_dom.Create_img = function (field_info) {
  var el = document.createElement("IMG");
  el.src = field_info.src;
  el.alt = field_info.alt;

  set_commun_params(el, field_info);

  return el;
};

function set_commun_params(el, field_info) {
    if (field_info.context) {
    field_info = apply_datas_to_template(field_info.context.template, field_info.context.data);
    field_info.el = el;
  }

  if (field_info.el_type == 'svg' ) {
    field_info.className && (el.setAttribute('class', field_info.className));
    field_info.height && (el.setAttribute('height', field_info.height));
    field_info.width && (el.setAttribute('width', field_info.width));

    field_info.fill && (el.setAttribute('fill', field_info.fill));
    field_info.viewBox && (el.setAttribute('viewBox', field_info.viewBox));
  } else {
    field_info.className && (el.className = field_info.className);
    field_info.height && (el.height = field_info.height);
    field_info.width && (el.width = field_info.width);
  }

  field_info.el = el;

  field_info.id && (el.id = field_info.id);
  el.name = (field_info.name) ? field_info.name : (field_info.id) ? field_info.id : null;
  field_info.type && (el.type = field_info.type);
  field_info.text && (el.innerText = field_info.text);
  field_info.styles && set_styles(el, field_info.styles);
  field_info.type && (el.type = field_info.type);
  field_info.value && (el.value = field_info.value);

  field_info.onclick && (el.onclick = field_info.onclick);
  field_info.dataset && set_dataset(el, field_info.dataset);
  field_info.required && (el.required = true);

  field_info.for && create_for_childs(el, field_info.for, field_info);

  if (field_info.childs) {
    field_info.childs.forEach(function (child) {
      self.appendChild(el, child, field_info);
    });
  }

  field_info.childs_infos && create_childs(el, field_info.childs_infos, field_info);

  field_info.parent && set_parent(el, field_info.parent);
  field_info.binding && set_binding(el, field_info.binding);
  field_info.model && set_model(el, field_info.model, field_info.id);

  field_info.label && setUp_label(el, field_info.label);
  field_info.warpper && setUp_warpper(el, field_info.warpper);
  field_info.on_scroll && setUp_scroll(el, field_info.on_scroll);
  field_info.transitionCb && setUp_transitionCb(el, field_info.transitionCb);
  field_info.reactor && setUp_reactor(el, field_info.reactor);

  if (!field_info.is_child) {
    second_pass(field_info);
  }
  }

function setUp_reactor(el, reactor) {
  Object.keys(reactor).forEach(function (event_name) {
    el[event_name] = reactor[event_name];
  });
  //  debugger;
}

function setUp_transitionCb(el, transitionCb) {
  el.addEventListener('transitionend', transitionCb, false);
}

function setUp_scroll(el, on_scroll) {
  el.onscroll = on_scroll;
}

function second_pass(field_info, parent_field_info, root_el_info) {
  var back_up;

  if (!root_el_info) {
    root_el_info = field_info;
    root_el_info.expander = [];
  }

  field_info.to_expand && UTILS_dom.setUp_expander(field_info.el, field_info.to_expand, field_info.on_expand, root_el_info);
  field_info.el && (field_info.el.last_expand = root_el_info.last_expand);

  back_up = root_el_info.last_expand;

  if (field_info.is_expanded) {
    root_el_info.last_expand = field_info.el;
    root_el_info.expander.push(field_info.el);
    // console.log(" parent_extander_id set on : "  + child.id, parent_field_info.id );
  }

  field_info.childs && (field_info.childs.forEach(
    function (child) {
      back_up = root_el_info.last_expand;
      second_pass(child, field_info, root_el_info);
      if (root_el_info.last_expand != back_up) {
        if (back_up && !back_up.childs_expand) {
          back_up.childs_expand = [];
        }

        back_up && back_up.childs_expand.push(root_el_info.last_expand);

        root_el_info.last_expand = back_up;  
        //  debugger;
      }
    }
));

  root_el_info.last_expand = back_up;
}

function get_template(d, id_to_find)
{
  if (d.id == id_to_find)
  {
    return d;
  }
  else {
    for (var i = 0; i < d.childs.length; i++) {
      var child = d.childs[i];
      var match = get_template(child, id_to_find);
      if (match) {
        return match;
      }
    }
  }

  return null;
}

// parent_field_info'CHILDS got reset here since they are supposed to be created here
// but Template are stored as childs
// FOR NOW JUST KEEP AS BACKUP
function create_for_childs(el, for_infos, parent_field_info) {
  var child_infos;
  var data;
  var templates = for_infos.template;
  var generated_childs = [];

  for (var index = 0; index < for_infos.datas.length; index++) {
    // debugger;
    data = for_infos.datas[index];

    if (for_infos.has_multi_templates) {
      if (!data.type) {
        console.error("CANT SELECT TEMPLATE SINCE NO TYPE FOUND IN DATA");
        return;
      }

      // debugger;
      var template = get_template(templates, data.type);
      // var template  = for_infos.multi_templates.querySelector( "#" + data.type );

      if (data.type == 'filter' ) {
        debugger;
      }
      child_infos = apply_datas_to_template(template, data, index, for_infos);
    } else if (typeof (for_infos.template) === 'function' ) {
      child_infos = for_infos.template(data, index);
    } else {
      child_infos = apply_datas_to_template(for_infos.template, data, index);
    }

    generated_childs.push(child_infos);
  }

  // parent_field_info.childs = [];
  parent_field_info.childs = generated_childs;
}

function generate_for_variables(for_string, template_json, datas) {
  var for_instruction_parts = for_string.split(' ');
  var for_item_label = for_instruction_parts[0];
  var for_datas_name = for_instruction_parts[2];

  datas = datas[for_item_label];
  var for_variables =     {
      datas,
      template: template_json,
      has_multi_templates: true,
      for_item_label,
      for_datas_name,
      for_string,
    };

  return for_variables;
}

// Replace {{ var_path }} by data[ var_path ]
// Recursive on childs
function apply_datas_to_template(template_json, data, index, for_infos, is_not_first_iterration) {
  var regex = /(?<={{)[a-z ._]+(?=}})/gm;
  var template = template_json;

  if (!is_not_first_iterration) {
    template = JSON.parse(JSON.stringify(template_json));
  }

  if (template_json.for && typeof (template_json.for == 'string' )) {
    template_json.for = generate_for_variables(template_json.for, template_json, data);
    for_infos = template_json.for;
    create_for_childs(null, for_infos, template);
    return template;
  }

  template.data = data;
  for (var prop in template) {
    var val = template[prop];
    if (typeof (val) === 'string' ) {
      var all_js_parts = val.match(regex);

      if (all_js_parts && all_js_parts.length > 0) {
        all_js_parts.forEach(function (js_part) {
          // IN ORDER TO work with Utils_reflection.Get_field
          var new_data = {};
          new_data[for_infos.for_item_label] = data;
          data = new_data;
          //----------------------------------------------------------

          var value = Utils_reflection.Get_field(data, js_part.trim());
          val = val.replace("{{" + js_part + '}}', value);
          template[prop] = val;
        });
      }
      console.log(template[prop]);
    }
  }

  template.childs.forEach(function (child) {
    child.parent_field_info = template;
    apply_datas_to_template(child, data, index, for_infos, true);
  });

  return template;
}

self.appendChild = function (parent_el, child, parent_field_info) {
  var back_up;
  UTILS_dom.map_shortcut(child);

  if (child.el_type) {
    if (!parent_field_info.bus)// || parent_field_info.to_expand )
    {
      parent_field_info.bus = {};
      !parent_field_info.bus.back_up_last_expand && (parent_field_info.bus.back_up_last_expand = []);
      }
    if (parent_field_info.to_expand) {
      var back_up = parent_field_info.bus.last_expand;
      parent_field_info.bus.last_expand = parent_field_info;
      if (!parent_field_info.bus.expander ) {
        parent_field_info.bus.expander = [];
      }

      parent_field_info.bus.expander.push(parent_el);
    }
    child.bus = parent_field_info.bus;
    child.bus[parent_field_info.id] = 1;
    child.is_child = true;
    var child_el = UTILS_dom.createElement(child);

    parent_el.appendChild(child_el);
    if (parent_field_info.to_expand) {
      parent_field_info.bus.last_expand = back_up;
    }
  } else {
    parent_el.appendChild(child);
  }
};

var set_styles = function (el, styles) {
  var style;
  for (style in styles) {
    el.style[style] = styles[style];
  }
};

var create_childs = function (el, childs_infos) {
  childs_infos.forEach(function (infos) {
    el.appendChild(UTILS_dom.createElement(infos));
  });
};

var set_model = function (el, model, id) {
  if (el.type == 'radio' ) {
    for (let child_i in el.children) {
      if (child_i == 'length') return;
      var child = el.children[child_i].children[0];
      child.onclick =           (e) => model[id] = e.target.value;
      if (model[id] == child.id) child.checked = true;
    };
  } else {
    el.onchange = (e) => model[id] = el.value;
  }
  model[id] && (el.value = model[id]);
};

UTILS_dom.Clear_rows = function (table_el) {
  if (table_el.rows.length == 0) return;

  var header = table_el.rows[0];
  table_el.innerHTML = '';
  table_el.appendChild(header);
};

var set_parent = function (el, parent) {
  parent.appendChild(el);
};

var set_binding = function (el, binding_infos) {
  binding_infos.data.binder.Add_subject(binding_infos.data_name, () => binding_infos.getter(el), el, null, binding_infos);
};

var setUp_warpper = function (el, warpper_infos) {
  var warpper_el = UTILS_dom.createElement(warpper_infos);
  var el_to_append = (el.parentNode) ? el.parentNode : el;
  warpper_el.appendChild(el_to_append);

  warpper_infos[el.id] = warpper_el;
};

var setUp_label = function (el, label_infos) {
  label_infos = (typeof (label_infos) == "string") ? { text: label_infos } : label_infos;
  label_infos.el = UTILS_dom.Create_label(label_infos, el);
};

function set_dataset(el, dataset) {
  for (var i in dataset)
  {
    if (typeof (dataset[i]) === 'object' ) el.dataset[i] = JSON.stringify(dataset[i]);
    else el.dataset[i] = dataset[i];
  }
}
    
UTILS_dom.setUp_expander2 = function (button, el_to_expand, on_expand, bus) {
    if (typeof (el_to_expand) === 'string') {
    el_to_expand = bus.el.querySelector(el_to_expand);
  }

  el_to_expand.classList.add('closed_table');
  button.dataset.is_extander = true;
  if (bus) {
    if (!bus.setUp_expander ) {
      bus.setUp_expander = [];
    }

    bus.setUp_expander.push(button);

    if (!button.bus) {
      button.bus = [];
    }

    button.bus.push(bus);
    if (bus.last_expand) {
      button._parent_expand = bus.last_expand.el;
    }
  }
  el_to_expand._parent_expand = button;

  button.onclick = (ev) => expand(el_to_expand, on_expand, button, ev);
};

UTILS_dom.setUp_expander = function (button, el_to_expand, on_expand, root_el_info) {
    if (typeof (el_to_expand) === 'string') {
    el_to_expand = root_el_info.el.querySelector(el_to_expand);
  }

  el_to_expand.classList.add('closed_table');
  //  button.dataset.is_extander  = true;
  if (root_el_info.last_expand) {
    button._parent_expand = root_el_info.last_expand;
  }

  if (root_el_info._parent_expand) {
    el_to_expand._parent_expand = root_el_info._parent_expand;
  } else {
    el_to_expand._parent_expand = root_el_info.last_expand;
  }

  if (button.onclick) {
    button.expand_onclick = function () { button.onclick = (ev) => expand(el_to_expand, on_expand, button, ev); button.onclick(); };
  } else {
    button.onclick = (ev) => expand(el_to_expand, on_expand, button, ev);
    button.resize = (heigth_change) => expand(el_to_expand, on_expand, button, null, true, heigth_change);
    }
};

function expand(el, on_expand, button, ev, must_resize_up, heigth_change) {
  ev && ev.stopPropagation();
  if (typeof (el) === 'string') {
    var to_expands = dic_dic_get(button, 'to_expand', {});
    el = document.querySelector(el);
    }

  fastdom.measure(() => {
    heigth_change = ( heigth_change ) || 0;
    var to_add = el.scrollHeight + heigth_change;
    var {height} = el.style;

    fastdom.mutate(() 
      => {
      if (height && !must_resize_up) {
          to_add *= -1;
          el.style.height = null;
          el.style.opacity = 0;
          el.classList.add('closed_table');
          el.classList.remove('open_table');
        } else {
          el.style.height = `${to_add  }px`;
          el.style.opacity = 1;
          el.last_height = el.style.height;
          el.classList.remove('closed_table');
          el.classList.add('open_table');
        }

      on_expand && on_expand(el, height, button, to_add);
      bubble_height_change(el, to_add);
      });
  });
}

function get_all_table_parent(el, array, is_not_first) {
  var current_parent = el._parent_expand;
  array = ( array ) || [];
  if (current_parent) {
    array.push(current_parent);
    get_all_table_parent(current_parent, array, true);
  }
  if (!is_not_first) {
    return array.reverse();
  }
}

function bubble_height_change(el, change) {
  var parents = get_all_table_parent(el);
  parents.forEach(function (current_parent) {

    var height = change + current_parent.offsetHeight;
    current_parent.style.height = `${height  }px`;
  });
}

var FABRICKs =   {
    select  : UTILS_dom.Create_select,
    radio   : UTILS_dom.Create_radio,
    label   : UTILS_dom.Create_label,
    div   : UTILS_dom.Create_div,
    button  : UTILS_dom.Create_button,
    input   : UTILS_dom.Create_input,
    span    : UTILS_dom.Create_span,
    dataList  : UTILS_dom.Create_dataList,
    table   : UTILS_dom.Create_table,
    checkbox  : UTILS_dom.Create_checkbox,
    path    : UTILS_dom.Create_path,
    svg   : UTILS_dom.Create_svg,
    circle  : UTILS_dom.Create_circle,
    img   : UTILS_dom.Create_img,
    template  : UTILS_dom.Create_template,
    style   : UTILS_dom.Create_style,
  };

// window.UTILS_dom = UTILS_dom;
export { UTILS_dom };
