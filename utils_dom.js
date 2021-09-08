//--------------------------------------------------------------------------------------------
const utilsReflection = (function () {
});

utilsReflection.GetField = function (root, paramFieldPath) {
  const fieldPath = paramFieldPath;
  if (fieldPath === '') {
    return root;
  }

  const fields = fieldPath.split('.');
  let currentObj = root;

  fields.forEach((field) => {
    if (!currentObj) {
      console.warn('GET FIELD :  ', field, ' Is not set on ', root, fieldPath);
      return;
    }
    currentObj = currentObj[field];
  });

  return currentObj;
};
//--------------------------------------------------------------------------------------------


const utilsDom = (function () {
});

utilsDom.turnObjToArray = function (obj) {
  return [].map.call(obj, (element) => element);
};

utilsDom.queryArray = function (obj, selector) {
  return utilsDom.turnObjToArray(obj.querySelector(selector));
};

utilsDom.queryAllArray = function (obj, selector) {
  return utilsDom.turnObjToArray(obj.querySelectorAll(selector));
};

utilsDom.map_shortcut = function (fieldInfo) {
  if (fieldInfo.t) {
    fieldInfo.el_type = fieldInfo.t;
  }
  if (fieldInfo.c) {
    fieldInfo.className = fieldInfo.c;
  } else if (fieldInfo.class) {
    fieldInfo.className = fieldInfo.class;
  }
};

utilsDom.createElement = function (fieldInfo) {
  let el_field;
  utilsDom.map_shortcut(fieldInfo);

  const fabrick = FABRICKs[fieldInfo.el_type];

  if (fabrick) {
    el_field = fabrick(fieldInfo);
  } else {
    // el_field = document.createElement( fieldInfo.el_type );
    el_field = utilsDom.CreateGeneric(fieldInfo);
  }

  return el_field;
};

utilsDom.createElements = function (...fields_info) {
  fields_info.forEach((f) => utilsDom.createElement(f));
};

utilsDom.create_field = function (field_meta, field_el, label) {
  const sub_field_div = utilsDom.createElement({ el_type: 'div', className: 'flex_grow_1' });
  const label_el = utilsDom.createElement({ el_type: 'div', className: 'font_size_70', text: (label) || field_meta.label });
  !field_el && (field_el = utilsDom.createElement(field_meta));

  utilsDom.appendChilds(sub_field_div, label_el, field_el);

  sub_field_div.getValue = () => field_el.value;
  return sub_field_div;
};

utilsDom.CreateTable = function (fieldInfo) {
  const el_table = document.createElement('TABLE');

  // el_table.id = fieldInfo.id;
  fieldInfo.cellspacing && (el_table.cellSpacing = fieldInfo.cellspacing);
  fieldInfo.no_cell_click && (el_table.no_cell_click = fieldInfo.no_cell_click);

  setCommunParams(el_table, fieldInfo);
  return el_table;
};

utilsDom.appendChilds = function (parent, ...childs) {
  childs.forEach((child) => child && parent.appendChild(child));
};

utilsDom.createAndWarpWith = function (to_create, to_warp) {
  const el = utilsDom.createElement(to_create);
  el.appendChild(to_warp);

  return el;
};

utilsDom.createAndAppendChilds = function (to_appends, parent) {
  let el;
  to_appends.forEach((el_meta) => {
    el = utilsDom.createElement(el_meta);
    el = utilsDom.getLastParent(el);
    parent.appendChild(el);
  });
};

utilsDom.getTable = function (el, predicat) {
  return utilsDom.getFirstParentWheretagName(el, 'TABLE');
};

utilsDom.getFirstParentWheretagName = function (el, tagName) {
  const predicat = (el) => el.tagName == tagName;
  return utilsDom.getFirstParentWhere(el, predicat);
};

utilsDom.getFirstParentWhere = function (el, predicat) {
  let parentNode = el;

  while (parentNode != null && !predicat(parentNode)) {
    parentNode = parentNode.parentNode;
  }

  return parentNode;
};

utilsDom.getLastParent = function (el) {
  let parentNode = el;
  while (parentNode.parentNode != null) {
    parentNode = parentNode.parentNode;
  }

  return parentNode;
};

utilsDom.createAndAppendFields = function (to_appends, parent) {
  let el;
  to_appends.forEach((el_meta) => {
    el_meta && (el = utilsDom.create_field(el_meta));
    el && parent.appendChild(el);
  });
};

utilsDom.insertAsFirst = function (to_insert, parent) {
  parent.insertBefore(to_insert, parent.childNodes[0]);
};

utilsDom.insertAfter = function (to_insert, el_before) {
  el_before.parentNode.insertBefore(to_insert, el_before.nextSibling);
};

utilsDom.ClearSelect = function (select) {
  for (a in select.options) { select.options.remove(0); }
};

utilsDom.ClearDataList = function (dataList) {
  const childArray = [].slice.call(dataList.children);

  childArray.forEach((child) => {
    dataList.removeChild(child);
  });
};

utilsDom.Clear = function (el) {
  if (el.type == 'select-one') {
    utilsDom.ClearSelect(el);
  } else {
    utilsDom.ClearDataList(el);
  }
};

const DONT_CLEAR = true;
utilsDom.add_option = function (el, data, fieldInfo, canHaveDouble) {
  if (!canHaveDouble && utilsDom.containOption(el, data)) return;

  utilsDom.populate(el, [data], fieldInfo, DONT_CLEAR);
};

utilsDom.containOption = function (el, data, fieldInfo) {
  return utilsDom.getOption(el, data);
};

utilsDom.removeOption = function (el, optionId) {
  utilsDom.getOption(el, optionId).remove();
};

utilsDom.getOption = function (el, optionId) {
  return el.querySelector(`#${optionId}`);
};

utilsDom.populate = function (el, datas, fieldInfo, DONT_CLEAR) {
  !fieldInfo && (fieldInfo = {});
  const path_label = (fieldInfo && fieldInfo.paths && fieldInfo.paths.label)
    ? fieldInfo.paths.label : 'label';
  const path_id = (fieldInfo && fieldInfo.paths && fieldInfo.paths.id)
    ? fieldInfo.paths.id : 'id';

  const item1 = datas[0];
  let option = null;
  if (!DONT_CLEAR) utilsDom.Clear(el);

  if (typeof (item1) === 'object') {
    datas.forEach((data) => {
      option = document.createElement('option');
      option.text = data[path_label]; // e.party_id;
      option.id = data[path_id];
      option.data = data;

      if (el.is_datalist) el.appendChild(option);
      else el.add(option);
    });
    if (fieldInfo.selected) {
      el.value = fieldInfo.selected;
    } else {
      el.value = item1[path_label];
    }

    el.getValue = function () {
      return el.selectedOptions[0].data;
    };
  } else {
    datas.forEach((data) => {
      option = document.createElement('option');
      option.text = data;
      option.id = data;
      option.dataset.data = JSON.stringify({ label: data, id: data });

      if (el.is_datalist) el.appendChild(option);
      else el.add(option);
    });

    el.getValue = function () {
      return el.selectedOptions[0].id;
    };
  }
};

const getDatas = function (fieldInfo) {
  let datas = (fieldInfo.values) ? fieldInfo.values : fieldInfo.data_getter();
  if (!datas || datas.length == 0) return null;

  if (datas.attrs) datas = datas.attrs;

  return datas;
};

//------------------------------------------------------------------------------------------------------------------------

utilsDom.CreateGeneric = function (fieldInfo) {
  const el = document.createElement(fieldInfo.el_type);
  setCommunParams(el, fieldInfo);

  return el;
};

utilsDom.CreateDataList = function (fieldInfo) {
  const listId = `${fieldInfo.label}_listId`;
  const el_field = document.createElement('SPAN');
  const el_input = document.createElement('INPUT');
  el_input.setAttribute('list', listId);
  el_input.className = 'input_datalist';

  const elDataList = document.createElement('DATALIST');
  elDataList.setAttribute('id', listId);
  elDataList.setAttribute('is_datalist', true);

  el_input.appendChild(elDataList);
  el_input.dataset.type = 'datalist';

  const datas = getDatas(fieldInfo);
  if (!datas) return el_input;

  el_input.getSelected = function () {
    return datas.find((el) => el.label == el_input.value);
  };

  utilsDom.populate(elDataList, datas, fieldInfo);

  return el_input;
};

utilsDom.CreateSelect = function (fieldInfo) {
  const el = document.createElement('select');

  const datas = getDatas(fieldInfo);
  if (!datas) return el;

  utilsDom.populate(el, datas, fieldInfo);
  setCommunParams(el, fieldInfo);

  return el;
};

utilsDom.MultiCreateSelect = function (fieldInfo) {
  const el = document.createElement('select');

  const datas = getDatas(fieldInfo);
  if (!datas) return el;

  utilsDom.populate(el, datas, fieldInfo);
  setCommunParams(el, fieldInfo);

  return el;
};

utilsDom.CreateRadio = function (fieldInfo) {
  const el_field = document.createElement('span');
  el_field.type = 'radio';
  const { vals } = fieldInfo;
  let el;
  let label;
  let first = true;
  if (fieldInfo.value) {
    first = false;
  }

  vals.forEach((val) => {
    el = document.createElement('input');
    el.type = 'radio';
    el.name = (fieldInfo.name) ? fieldInfo.name : (fieldInfo.id) ? fieldInfo.id : null;
    el.id = val.value;
    el.value = val.value;
    label = utilsDom.CreateLabel({ text: val.label, value: val.value }, el);

    el_field.appendChild(label);

    if (el.id == fieldInfo.value) {
      el.checked = true;
    }
    if (first) {
      first = false;
      el.checked = true;
    }
  });

  setCommunParams(el_field, fieldInfo);

  return el_field;
};

utilsDom.CreateLabel = function (fieldInfo, el) {
  const el_label = document.createElement('LABEL');

  const id = (el) ? el.id : fieldInfo.id;
  el_label.setAttribute('for', id);
  el_label.innerText = fieldInfo.text;

  (el) && (el_label.appendChild(el));
  fieldInfo.className && (el_label.className = fieldInfo.className);

  return el_label;
};

utilsDom.CreateTemplate = function (fieldInfo) {
  const el = document.createElement('TEMPLATE');
  setCommunParams(el, fieldInfo);

  return el;
};

utilsDom.CreateDiv = function (fieldInfo) {
  const el = document.createElement('DIV');
  setCommunParams(el, fieldInfo);

  return el;
};

utilsDom.CreateButton = function (fieldInfo) {
  const el = document.createElement('BUTTON');
  setCommunParams(el, fieldInfo);

  return el;
};

utilsDom.CreateInput = function (fieldInfo) {
  const el = document.createElement('INPUT');
  el.getValue = function () {
    return el.value;
  };
  setCommunParams(el, fieldInfo);

  return el;
};

utilsDom.CreateCheckbox = function (fieldInfo) {
  const el = document.createElement('INPUT');
  fieldInfo.type = 'checkbox';
  el.getValue = () => (el.checked);
  setCommunParams(el, fieldInfo);

  return el;
};

utilsDom.CreatePath = function (fieldInfo) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttributeNS(null, 'd', fieldInfo.d);

  fieldInfo.className && el.setAttributeNS(null, 'class', fieldInfo.className);
  fieldInfo.parent && fieldInfo.parent.appendChild(el);
  fieldInfo.id && el.setAttributeNS(null, 'id', fieldInfo.id);

  return el;
};

utilsDom.CreateCircle = function (fieldInfo) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  el.setAttributeNS(null, 'r', fieldInfo.rayon);

  setCommunParams(el, fieldInfo);

  return el;
};

utilsDom.CreateSvg = function (fieldInfo) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('width', fieldInfo.width);
  el.setAttribute('height', fieldInfo.height);

  setCommunParams(el, fieldInfo);

  return el;
};

utilsDom.CreateSpan = function (fieldInfo) {
  const el = document.createElement('SPAN');
  setCommunParams(el, fieldInfo);

  return el;
};

utilsDom.CreateStyle = function (fieldInfo) {
  const el = document.createElement('STYLE');
  const css = fieldInfo.text;
  el.appendChild(document.createTextNode(css));
  el.type = 'text/css';

  document.head.appendChild(el);

  return el;
};

utilsDom.CreateImg = function (fieldInfo) {
  const el = document.createElement('IMG');
  el.src = fieldInfo.src;
  el.alt = fieldInfo.alt;

  setCommunParams(el, fieldInfo);

  return el;
};

function setCommunParams(el, fieldInfo) {
  if (fieldInfo.context) {
    fieldInfo = applyDatasToTemplate(fieldInfo.context.template, fieldInfo.context.data);
    fieldInfo.el = el;
  }

  if (fieldInfo.el_type == 'svg') {
    fieldInfo.className && (el.setAttribute('class', fieldInfo.className));
    fieldInfo.height && (el.setAttribute('height', fieldInfo.height));
    fieldInfo.width && (el.setAttribute('width', fieldInfo.width));

    fieldInfo.fill && (el.setAttribute('fill', fieldInfo.fill));
    fieldInfo.viewBox && (el.setAttribute('viewBox', fieldInfo.viewBox));
  } else {
    fieldInfo.className && (el.className = fieldInfo.className);
    fieldInfo.height && (el.height = fieldInfo.height);
    fieldInfo.width && (el.width = fieldInfo.width);
  }

  fieldInfo.el = el;

  fieldInfo.id && (el.id = fieldInfo.id);
  el.name = (fieldInfo.name) ? fieldInfo.name : (fieldInfo.id) ? fieldInfo.id : null;
  fieldInfo.type && (el.type = fieldInfo.type);
  fieldInfo.text && (el.innerText = fieldInfo.text);
  fieldInfo.styles && set_styles(el, fieldInfo.styles);
  fieldInfo.type && (el.type = fieldInfo.type);
  fieldInfo.value && (el.value = fieldInfo.value);

  fieldInfo.onclick && (el.onclick = fieldInfo.onclick);
  fieldInfo.dataset && setDataset(el, fieldInfo.dataset);
  fieldInfo.required && (el.required = true);

  fieldInfo.for && createForChilds(el, fieldInfo.for, fieldInfo);

  if (fieldInfo.childs) {
    fieldInfo.childs.forEach((child) => {
      self.appendChild(el, child, fieldInfo);
    });
  }

  fieldInfo.childsInfos && createChilds(el, fieldInfo.childsInfos, fieldInfo);

  fieldInfo.parent && setParent(el, fieldInfo.parent);
  fieldInfo.binding && setBinding(el, fieldInfo.binding);
  fieldInfo.model && setModel(el, fieldInfo.model, fieldInfo.id);

  fieldInfo.label && setUpLabel(el, fieldInfo.label);
  fieldInfo.warpper && setUpWarpper(el, fieldInfo.warpper);
  fieldInfo.on_scroll && setUpScroll(el, fieldInfo.on_scroll);
  fieldInfo.transitionCb && setUpTransitionCb(el, fieldInfo.transitionCb);
  fieldInfo.reactor && setUpReactor(el, fieldInfo.reactor);

  if (!fieldInfo.is_child) {
    secondPass(fieldInfo);
  }
}

function setUpReactor(el, reactor) {
  Object.keys(reactor).forEach((event_name) => {
    el[event_name] = reactor[event_name];
  });
}

function setUpTransitionCb(el, transitionCb) {
  el.addEventListener('transitionend', transitionCb, false);
}

function setUpScroll(el, on_scroll) {
  el.onscroll = on_scroll;
}

function secondPass(fieldInfo, parentFieldInfo, rootElInfo) {
  let back_up;

  if (!rootElInfo) {
    rootElInfo = fieldInfo;
    rootElInfo.expander = [];
  }

  fieldInfo.toExpand && utilsDom.setUpExpander(fieldInfo.el, fieldInfo.toExpand, fieldInfo.onExpand, rootElInfo);
  fieldInfo.el && (fieldInfo.el.lastExpand = rootElInfo.lastExpand);

  back_up = rootElInfo.lastExpand;

  if (fieldInfo.is_expanded) {
    rootElInfo.lastExpand = fieldInfo.el;
    rootElInfo.expander.push(fieldInfo.el);
    // console.log(" parent_extander_id set on : "  + child.id, parentFieldInfo.id );
  }

  fieldInfo.childs && (fieldInfo.childs.forEach(
    (child) => {
      back_up = rootElInfo.lastExpand;
      secondPass(child, fieldInfo, rootElInfo);
      if (rootElInfo.lastExpand != back_up) {
        if (back_up && !back_up.childs_expand) {
          back_up.childs_expand = [];
        }

        back_up && back_up.childs_expand.push(rootElInfo.lastExpand);
        rootElInfo.lastExpand = back_up;
      }
    },
  ));

  rootElInfo.lastExpand = back_up;
}

function getTemplate(d, idToFind) {
  if (d.id == idToFind) {
    return d;
  }

  for (let i = 0; i < d.childs.length; i++) {
    const child = d.childs[i];
    const match = getTemplate(child, idToFind);
    if (match) {
      return match;
    }
  }

  return null;
}

// parentFieldInfo'CHILDS got reset here since they are supposed to be created here
// but Template are stored as childs
// FOR NOW JUST KEEP AS BACKUP
function createForChilds(el, forInfos, parentFieldInfo) {
  let child_infos;
  let data;
  const templates = forInfos.template;
  const generated_childs = [];

  for (let index = 0; index < forInfos.datas.length; index += 1) {
    data = forInfos.datas[index];

    if (forInfos.hasMultiTemplates) {
      if (!data.type) {
        console.error('CANT SELECT TEMPLATE SINCE NO TYPE FOUND IN DATA');
        return;
      }

      const template = getTemplate(templates, data.type);

      if (data.type == 'filter') {
        debugger;
      }
      child_infos = applyDatasToTemplate(template, data, index, forInfos);
    } else if (typeof (forInfos.template) === 'function') {
      child_infos = forInfos.template(data, index);
    } else {
      child_infos = applyDatasToTemplate(forInfos.template, data, index);
    }

    generated_childs.push(child_infos);
  }

  parentFieldInfo.childs = generated_childs;
}

function generateForVariables(forString, templateJson, datas) {
  const forInstructionParts = forString.split(' ');
  const forItemLabel = forInstructionParts[0];
  const forDatasName = forInstructionParts[2];

  datas = datas[forItemLabel];
  const forVariables = {
    datas,
    template: templateJson,
    hasMultiTemplates: true,
    forItemLabel,
    forDatasName,
    forString,
  };

  return forVariables;
}

// Replace {{ var_path }} by data[ var_path ]
// Recursive on childs
function applyDatasToTemplate(templateJson, data, index, forInfos, isNotFirstIterration) {
  const regex = /(?<={{)[a-z ._]+(?=}})/gm;
  let template = templateJson;

  if (!isNotFirstIterration) {
    template = JSON.parse(JSON.stringify(templateJson));
  }

  if (templateJson.for && typeof (templateJson.for == 'string')) {
    templateJson.for = generateForVariables(templateJson.for, templateJson, data);
    forInfos = templateJson.for;
    createForChilds(null, forInfos, template);
    return template;
  }

  template.data = data;
  for (var prop in template) {
    var val = template[prop];
    if (typeof (val) === 'string') {
      const allJsParts = val.match(regex);

      if (allJsParts && allJsParts.length > 0) {
        allJsParts.forEach((jsPart) => {
          // IN ORDER TO work with utilsReflection.GetField
          const newData = {};
          newData[forInfos.forItemLabel] = data;
          data = newData;
          //----------------------------------------------------------

          const value = utilsReflection.GetField(data, jsPart.trim());
          val = val.replace(`{{${jsPart}}}`, value);
          template[prop] = val;
        });
      }
      console.log(template[prop]);
    }
  }

  template.childs.forEach((child) => {
    child.parentFieldInfo = template;
    applyDatasToTemplate(child, data, index, forInfos, true);
  });

  return template;
}

self.appendChild = function (parentEl, child, parentFieldInfo) {
  var back_up;
  utilsDom.map_shortcut(child);

  if (child.el_type) {
    if (!parentFieldInfo.bus)// || parentFieldInfo.toExpand )
    {
      parentFieldInfo.bus = {};
      !parentFieldInfo.bus.backUpLastExpand && (parentFieldInfo.bus.backUpLastExpand = []);
    }
    if (parentFieldInfo.toExpand) {
      var back_up = parentFieldInfo.bus.lastExpand;
      parentFieldInfo.bus.lastExpand = parentFieldInfo;
      if (!parentFieldInfo.bus.expander) {
        parentFieldInfo.bus.expander = [];
      }

      parentFieldInfo.bus.expander.push(parentEl);
    }
    child.bus = parentFieldInfo.bus;
    child.bus[parentFieldInfo.id] = 1;
    child.is_child = true;
    const child_el = utilsDom.createElement(child);

    parentEl.appendChild(child_el);
    if (parentFieldInfo.toExpand) {
      parentFieldInfo.bus.lastExpand = back_up;
    }
  } else {
    parentEl.appendChild(child);
  }
};

var set_styles = function (el, styles) {
  let style;
  for (style in styles) {
    el.style[style] = styles[style];
  }
};

var createChilds = function (el, childsInfos) {
  childsInfos.forEach((infos) => {
    el.appendChild(utilsDom.createElement(infos));
  });
};

var setModel = function (el, model, id) {
  if (el.type == 'radio') {
    for (const child_i in el.children) {
      if (child_i == 'length') return;
      const child = el.children[child_i].children[0];
      child.onclick = (e) => model[id] = e.target.value;
      if (model[id] == child.id) child.checked = true;
    }
  } else {
    el.onchange = (e) => model[id] = el.value;
  }
  model[id] && (el.value = model[id]);
};

utilsDom.ClearRows = function (tableEl) {
  if (tableEl.rows.length == 0) return;

  const header = tableEl.rows[0];
  tableEl.innerHTML = '';
  tableEl.appendChild(header);
};

var setParent = function (el, parent) {
  parent.appendChild(el);
};

var setBinding = function (el, binding_infos) {
  binding_infos.data.binder.Add_subject(binding_infos.data_name, () => binding_infos.getter(el), el, null, binding_infos);
};

var setUpWarpper = function (el, warpper_infos) {
  const warpperEl = utilsDom.createElement(warpper_infos);
  const el_to_append = (el.parentNode) ? el.parentNode : el;
  warpperEl.appendChild(el_to_append);

  warpper_infos[el.id] = warpperEl;
};

var setUpLabel = function (el, labelInfos) {
  labelInfos = (typeof (labelInfos) === 'string') ? { text: labelInfos } : labelInfos;
  labelInfos.el = utilsDom.CreateLabel(labelInfos, el);
};

function setDataset(el, dataset) {
  for (const i in dataset) {
    if (typeof (dataset[i]) === 'object') el.dataset[i] = JSON.stringify(dataset[i]);
    else el.dataset[i] = dataset[i];
  }
}

utilsDom.setUpExpander = function (button, elToExpand, onExpand, rootElInfo) {
  if (typeof (elToExpand) === 'string') {
    elToExpand = rootElInfo.el.querySelector(elToExpand);
  }

  elToExpand.classList.add('closed_table');
  if (rootElInfo.lastExpand) {
    button._parentExpand = rootElInfo.lastExpand;
  }

  if (rootElInfo._parentExpand) {
    elToExpand._parentExpand = rootElInfo._parentExpand;
  } else {
    elToExpand._parentExpand = rootElInfo.lastExpand;
  }

  if (button.onclick) {
    button.expand_onclick = function () { button.onclick = (ev) => expand(elToExpand, onExpand, button, ev); button.onclick(); };
  } else {
    button.onclick = (ev) => expand(elToExpand, onExpand, button, ev);
    button.resize = (heigthChange) => expand(elToExpand, onExpand, button, null, true, heigthChange);
  }
};

function expand(el, onExpand, button, ev, mustResizeUp, heigthChange) {
  ev && ev.stopPropagation();
  if (typeof (el) === 'string') {
    const toExpands = dic_dic_get(button, 'toExpand', {});
    el = document.querySelector(el);
  }

  fastdom.measure(() => {
    heigthChange = (heigthChange) || 0;
    let toAdd = el.scrollHeight + heigthChange;
    const { height } = el.style;

    fastdom.mutate(() => {
      if (height && !mustResizeUp) {
        toAdd *= -1;
        el.style.height = null;
        el.style.opacity = 0;
        el.classList.add('closed_table');
        el.classList.remove('open_table');
      } else {
        el.style.height = `${toAdd}px`;
        el.style.opacity = 1;
        el.lastHeight = el.style.height;
        el.classList.remove('closed_table');
        el.classList.add('open_table');
      }

      onExpand && onExpand(el, height, button, toAdd);
      bubbleHeightChange(el, toAdd);
    });
  });
}

function getAllTableParent(el, array, isNotFirst) {
  const currentParent = el._parentExpand;
  array = (array) || [];
  if (currentParent) {
    array.push(currentParent);
    getAllTableParent(currentParent, array, true);
  }
  if (!isNotFirst) {
    return array.reverse();
  }
}

function bubbleHeightChange(el, change) {
  const parents = getAllTableParent(el);
  parents.forEach((currentParent) => {
    const height = change + currentParent.offsetHeight;
    currentParent.style.height = `${height}px`;
  });
}

const FABRICKs = {
  select: utilsDom.CreateSelect,
  radio: utilsDom.CreateRadio,
  label: utilsDom.CreateLabel,
  div: utilsDom.CreateDiv,
  button: utilsDom.CreateButton,
  input: utilsDom.CreateInput,
  span: utilsDom.CreateSpan,
  dataList: utilsDom.CreateDataList,
  table: utilsDom.CreateTable,
  checkbox: utilsDom.CreateCheckbox,
  path: utilsDom.CreatePath,
  svg: utilsDom.CreateSvg,
  circle: utilsDom.CreateCircle,
  img: utilsDom.CreateImg,
  template: utilsDom.CreateTemplate,
  style: utilsDom.CreateStyle,
};

// window.utilsDom = utilsDom;
export { utilsDom };
