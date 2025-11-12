const canvasBoard = document.getElementById('canvasBoard');
const propertyForm = document.getElementById('propertyForm');
const selectionInfo = document.getElementById('selectionInfo');
const cssOutput = document.getElementById('cssOutput');
const cssImport = document.getElementById('cssImport');

const baseTokens = {
  padY: '3px',
  padX: '10px',
  radius: '9px',
  fontWeight: '600',
  transition: '140ms ease',
  stroke: 'color-mix(in srgb, currentColor 12%, transparent)',
  focus: 'color-mix(in srgb, -moz-accent-color 65%, white 35%)',
  bg: '#f6f7f9',
  fg: '#111418',
  hover: '#eef1f6'
};

const darkTokens = {
  bg: '#1b1f26',
  fg: '#e9edf2',
  hover: '#222832',
  focus: 'color-mix(in srgb, -moz-accent-color 60%, black 40%)'
};

let elements = [];
let selectedId = null;

const deepClone = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const elementTemplates = {
  folder: {
    label: 'Nowy folder',
    background: '#f6f7f9',
    textColor: '#111418',
    borderColor: '#d0d5dd',
    borderWidth: '1px',
    borderRadius: '9px',
    paddingY: '6px',
    paddingX: '14px',
    fontWeight: '600',
    boxShadow: 'none',
    hoverShadow: '0 0 12px rgba(51, 102, 255, 0.25)',
    textShadow: 'none',
    customCSS: ''
  },
  subfolder: {
    label: 'Nowy podfolder',
    background: '#eef1f6',
    textColor: '#111418',
    borderColor: '#c8ceda',
    borderWidth: '1px',
    borderRadius: '10px',
    paddingY: '5px',
    paddingX: '12px',
    fontWeight: '600',
    boxShadow: 'none',
    hoverShadow: '0 0 10px rgba(51, 102, 255, 0.18)',
    textShadow: 'none',
    customCSS: ''
  },
  bookmark: {
    label: 'Nowa zakładka',
    background: '#ffffff',
    textColor: '#111418',
    borderColor: '#ccd2df',
    borderWidth: '1px',
    borderRadius: '6px',
    paddingY: '4px',
    paddingX: '10px',
    fontWeight: '500',
    boxShadow: 'none',
    hoverShadow: '0 0 8px rgba(51, 102, 255, 0.2)',
    textShadow: 'none',
    customCSS: ''
  }
};

const typeLabels = {
  folder: 'Folder',
  subfolder: 'Podfolder',
  bookmark: 'Zakładka'
};

const baseTokenDefinitions = [
  { key: 'padY', label: '--bm-pad-y', hint: 'Padding pionowy' },
  { key: 'padX', label: '--bm-pad-x', hint: 'Padding poziomy' },
  { key: 'radius', label: '--bm-radius', hint: 'Promień narożników' },
  { key: 'fontWeight', label: '--bm-fw', hint: 'Grubość pisma' },
  { key: 'transition', label: '--bm-transition', hint: 'Animacja hover' },
  { key: 'stroke', label: '--bm-stroke', hint: 'Kolor obramowania' },
  { key: 'focus', label: '--bm-focus', hint: 'Obrys focus' },
  { key: 'bg', label: '--bm-bg', hint: 'Kolor tła' },
  { key: 'fg', label: '--bm-fg', hint: 'Kolor tekstu' },
  { key: 'hover', label: '--bm-hover', hint: 'Kolor hover' }
];

const darkTokenDefinitions = [
  { key: 'bg', label: '--bm-bg (dark)', hint: 'Kolor tła' },
  { key: 'fg', label: '--bm-fg (dark)', hint: 'Kolor tekstu' },
  { key: 'hover', label: '--bm-hover (dark)', hint: 'Kolor hover' },
  { key: 'focus', label: '--bm-focus (dark)', hint: 'Obrys focus' }
];

function createId(prefix = 'el') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function addElement(type) {
  const template = elementTemplates[type];
  if (!template) return;
  const id = createId(type);
  const newElement = { id, type, ...deepClone(template) };
  elements = [...elements, newElement];
  selectElement(id);
  renderCanvas();
  renderCSS();
}

function selectElement(id) {
  selectedId = id;
  renderCanvas();
  renderProperties();
}

function getSelected() {
  return elements.find((item) => item.id === selectedId) || null;
}

function renderCanvas() {
  canvasBoard.innerHTML = '';
  elements.forEach((element) => {
    const node = document.createElement('div');
    node.className = 'canvas__item';
    if (element.id === selectedId) {
      node.classList.add('is-selected');
    }
    node.dataset.id = element.id;
    node.dataset.type = typeLabels[element.type] || element.type;

    node.style.background = element.background;
    node.style.color = element.textColor;
    node.style.borderColor = element.borderColor;
    node.style.borderWidth = element.borderWidth;
    node.style.borderStyle = 'solid';
    node.style.borderRadius = element.borderRadius;
    node.style.padding = `${element.paddingY} ${element.paddingX}`;
    node.style.fontWeight = element.fontWeight;
    node.style.boxShadow = element.boxShadow;
    node.style.textShadow = element.textShadow;

    const label = document.createElement('div');
    label.className = 'canvas__item-label';
    label.textContent = element.label;

    const typeTag = document.createElement('div');
    typeTag.className = 'canvas__item-type';
    typeTag.textContent = typeLabels[element.type];

    const preview = document.createElement('div');
    preview.className = 'canvas__item-preview';
    preview.style.background = element.background;
    preview.style.borderRadius = element.borderRadius;
    preview.style.boxShadow = element.hoverShadow;
    preview.textContent = element.type === 'folder' ? 'F' : element.type === 'subfolder' ? 'SF' : 'Z';

    node.appendChild(label);
    node.appendChild(preview);
    node.appendChild(typeTag);

    node.addEventListener('click', () => selectElement(element.id));
    canvasBoard.appendChild(node);
  });

  if (!elements.length) {
    const empty = document.createElement('div');
    empty.className = 'canvas__empty';
    empty.textContent = 'Dodaj element, aby rozpocząć projektowanie.';
    empty.style.color = 'rgba(15, 23, 42, 0.45)';
    empty.style.fontSize = '14px';
    canvasBoard.appendChild(empty);
  }
}

function renderProperties() {
  const selected = getSelected();
  if (!selected) {
    selectionInfo.textContent = 'Brak zaznaczenia.';
    propertyForm.classList.add('hidden');
    return;
  }

  selectionInfo.textContent = `${typeLabels[selected.type]}: ${selected.label}`;
  propertyForm.classList.remove('hidden');

  propertyForm.innerHTML = `
    ${createTextField('label', 'Nazwa', selected.label)}
    ${createTextareaField('background', 'Tło', selected.background, 'Dowolna wartość CSS: kolor, gradient, itp.')}
    ${createColorField('textColor', 'Kolor tekstu', selected.textColor)}
    <div class="form-row">
      ${createColorField('borderColor', 'Kolor obramowania', selected.borderColor)}
      ${createTextField('borderWidth', 'Szerokość obramowania', selected.borderWidth)}
    </div>
    <div class="form-row">
      ${createTextField('paddingY', 'Padding pionowy', selected.paddingY)}
      ${createTextField('paddingX', 'Padding poziomy', selected.paddingX)}
    </div>
    <div class="form-row">
      ${createTextField('borderRadius', 'Promień narożników', selected.borderRadius)}
      ${createTextField('fontWeight', 'Grubość tekstu', selected.fontWeight)}
    </div>
    ${createTextField('boxShadow', 'Cień', selected.boxShadow)}
    ${createTextField('hoverShadow', 'Cień (hover)', selected.hoverShadow)}
    ${createTextField('textShadow', 'Cień tekstu', selected.textShadow)}
    ${createTextareaField('customCSS', 'Dodatkowe reguły', selected.customCSS, 'Wpisz dodatkowe deklaracje CSS, każdą w nowej linii.')}
  `;

  bindFormEvents();
}

function createTextField(name, label, value) {
  return `
    <div class="form-group">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" value="${escapeHtml(value)}" />
    </div>
  `;
}

function createTextareaField(name, label, value, placeholder = '') {
  return `
    <div class="form-group">
      <label for="${name}">${label}</label>
      <textarea id="${name}" name="${name}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>
    </div>
  `;
}

function createColorField(name, label, value) {
  const normalized = isValidHex(value) ? value : '#ffffff';
  return `
    <div class="form-group">
      <label for="${name}">${label}</label>
      <div class="color-row">
        <input type="color" data-role="color" data-target="${name}" value="${sanitizeColor(normalized)}" />
        <input id="${name}" name="${name}" value="${escapeHtml(value)}" />
      </div>
    </div>
  `;
}

function isValidHex(value) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value.trim());
}

function sanitizeColor(value) {
  if (!isValidHex(value)) {
    return '#ffffff';
  }
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return value;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bindFormEvents() {
  propertyForm.querySelectorAll('input, textarea, select').forEach((field) => {
    field.addEventListener('input', handlePropertyChange);
  });
  propertyForm.querySelectorAll('input[data-role="color"]').forEach((picker) => {
    picker.addEventListener('input', (event) => {
      const target = event.target.getAttribute('data-target');
      const input = propertyForm.querySelector(`input[name="${target}"]`);
      if (input) {
        input.value = event.target.value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });
}

function handlePropertyChange(event) {
  const selected = getSelected();
  if (!selected) return;
  const { name, value } = event.target;
  if (!name) return;

  const cleaned = value.trim();
  const updated = { ...selected, [name]: cleaned };

  elements = elements.map((item) => (item.id === selected.id ? updated : item));
  renderCanvas();
  renderCSS();
  selectionInfo.textContent = `${typeLabels[updated.type]}: ${updated.label}`;
}

function renderTokens() {
  const tokenGrid = document.getElementById('tokenGrid');
  const darkGrid = document.getElementById('darkTokenGrid');
  tokenGrid.innerHTML = '';
  darkGrid.innerHTML = '';

  baseTokenDefinitions.forEach((token) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';
    wrapper.innerHTML = `
      <label>${token.label}<br /><small>${token.hint}</small></label>
      <input name="${token.key}" value="${baseTokens[token.key]}" />
    `;
    wrapper.querySelector('input').addEventListener('input', (event) => {
      baseTokens[token.key] = event.target.value;
      renderCSS();
    });
    tokenGrid.appendChild(wrapper);
  });

  darkTokenDefinitions.forEach((token) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';
    wrapper.innerHTML = `
      <label>${token.label}<br /><small>${token.hint}</small></label>
      <input name="${token.key}" value="${darkTokens[token.key]}" />
    `;
    wrapper.querySelector('input').addEventListener('input', (event) => {
      darkTokens[token.key] = event.target.value;
      renderCSS();
    });
    darkGrid.appendChild(wrapper);
  });
}

function generateSelector(element) {
  const base = ':is(#PlacesToolbarItems, #PlacesChevronPopup)';
  const label = element.label.replace(/"/g, '\\"');
  if (element.type === 'folder') {
    return `${base} > toolbarbutton.bookmark-item:is([container],[type="menu"],[itemtype="folder"])[label="${label}"]`;
  }
  if (element.type === 'subfolder') {
    return `${base} :is(toolbarbutton.bookmark-item, menu.bookmark-item)[label="${label}"]`;
  }
  return `${base} .bookmark-item:not([container])[label="${label}"]`;
}

function generateCSS() {
  const tokens = `:root{\n  --bm-pad-y: ${baseTokens.padY}; --bm-pad-x: ${baseTokens.padX};\n  --bm-radius: ${baseTokens.radius}; --bm-fw: ${baseTokens.fontWeight};\n  --bm-transition: ${baseTokens.transition};\n  --bm-stroke: ${baseTokens.stroke};\n  --bm-focus: ${baseTokens.focus};\n  --bm-bg: ${baseTokens.bg}; --bm-fg: ${baseTokens.fg}; --bm-hover: ${baseTokens.hover};\n}\n@media (prefers-color-scheme: dark){\n  :root{ --bm-bg:${darkTokens.bg}; --bm-fg:${darkTokens.fg}; --bm-hover:${darkTokens.hover}; --bm-focus:${darkTokens.focus}; }\n}\n`; 

  const base = `:root{ --bm-selector: toolbarbutton.bookmark-item:is([container],[type="menu"],[itemtype="folder"]); }\n\n#PlacesToolbarItems > .bookmark-item,\n#PlacesChevronPopup > .bookmark-item{\n  -moz-appearance: none !important;\n}\n\n#PlacesToolbarItems > :is(.bookmark-item[container], .bookmark-item[type="menu"], .bookmark-item[itemtype="folder"]),\n#PlacesChevronPopup > :is(.bookmark-item[container], .bookmark-item[type="menu"], .bookmark-item[itemtype="folder"]){\n  -moz-appearance: none !important;\n  padding: var(--bm-pad-y) var(--bm-pad-x) !important;\n  border-radius: var(--bm-radius) !important;\n  font-weight: var(--bm-fw) !important;\n  line-height: 1.1 !important;\n  background: var(--bm-bg) !important;\n  color: var(--bm-fg) !important;\n  border: 1px solid var(--bm-stroke) !important;\n  background-clip: padding-box !important;\n  box-shadow: none !important;\n  text-shadow: none !important;\n  transition: background-color var(--bm-transition), outline-color var(--bm-transition) !important;\n}\n\n#PlacesToolbarItems > :is(.bookmark-item[container], .bookmark-item[type="menu"], .bookmark-item[itemtype="folder"]):hover,\n#PlacesChevronPopup > :is(.bookmark-item[container], .bookmark-item[type="menu"], .bookmark-item[itemtype="folder"]):hover{\n  background: var(--bm-hover) !important;\n}\n\n#PlacesToolbarItems > :is(.bookmark-item[container], .bookmark-item[type="menu"], .bookmark-item[itemtype="folder"]):focus-visible,\n#PlacesChevronPopup > :is(.bookmark-item[container], .bookmark-item[type="menu"], .bookmark-item[itemtype="folder"]):focus-visible{\n  outline: 2px solid var(--bm-focus) !important;\n  outline-offset: 2px !important;\n}\n\n`;

  const blocks = elements.map((element) => {
    const selector = generateSelector(element);
    const meta = JSON.stringify({ id: element.id, type: element.type, label: element.label });

    const declarations = [
      `background: ${element.background} !important;`,
      `color: ${element.textColor} !important;`,
      `border-color: ${element.borderColor} !important;`,
      `border-width: ${element.borderWidth} !important;`,
      'border-style: solid !important;',
      `border-radius: ${element.borderRadius} !important;`,
      `padding: ${element.paddingY} ${element.paddingX} !important;`,
      `font-weight: ${element.fontWeight} !important;`,
      `box-shadow: ${element.boxShadow} !important;`,
      `text-shadow: ${element.textShadow} !important;`
    ];

    const customRules = element.customCSS
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => (line.endsWith(';') ? line : `${line};`));

    const hover = element.hoverShadow && element.hoverShadow.toLowerCase() !== 'none'
      ? `\n${selector}:hover{\n  box-shadow: ${element.hoverShadow} !important;\n}`
      : '';

    const block = `/* BookmarkStyler: ${meta} */\n${selector}{\n  ${declarations.concat(customRules).join('\n  ')}\n}${hover}`;
    return block;
  });

  return `/* ===== BookmarkStyler wygenerowany kod ===== */\n\n${tokens}${base}${blocks.join('\n\n')}`.trim();
}

function renderCSS() {
  cssOutput.value = generateCSS();
}

function duplicateElement() {
  const selected = getSelected();
  if (!selected) return;
  const clone = deepClone(selected);
  clone.id = createId(selected.type);
  clone.label = `${selected.label} kopia`;
  elements = [...elements, clone];
  selectElement(clone.id);
  renderCanvas();
  renderCSS();
}

function deleteElement() {
  if (!selectedId) return;
  elements = elements.filter((element) => element.id !== selectedId);
  selectedId = null;
  renderCanvas();
  renderProperties();
  renderCSS();
}

function handleShapeQuick(action) {
  const selected = getSelected();
  if (!selected) return;
  if (action === 'circle') {
    updateSelected('borderRadius', '999px');
  } else if (action === 'pill') {
    updateSelected('borderRadius', '999px');
  } else if (action === 'rounded') {
    updateSelected('borderRadius', '12px');
  }
}

function updateSelected(key, value) {
  const selected = getSelected();
  if (!selected) return;
  const updated = { ...selected, [key]: value };
  elements = elements.map((item) => (item.id === selected.id ? updated : item));
  renderCanvas();
  renderProperties();
  renderCSS();
}

function copyCssToClipboard() {
  const css = cssOutput.value;
  if (window.bookmarkStyler && typeof window.bookmarkStyler.copyToClipboard === 'function') {
    window.bookmarkStyler.copyToClipboard(css);
  } else {
    navigator.clipboard?.writeText(css).catch(() => {});
  }
}

function importCSS() {
  const raw = cssImport.value.trim();
  if (!raw) return;
  try {
    const importedTokens = parseTokens(raw);
    if (importedTokens) {
      Object.assign(baseTokens, importedTokens.baseTokens);
      Object.assign(darkTokens, importedTokens.darkTokens);
    }
    const parsedElements = parseElements(raw);
    if (parsedElements.length) {
      elements = parsedElements;
      selectedId = parsedElements[0]?.id || null;
      renderCanvas();
      renderProperties();
    }
    renderTokens();
    renderCSS();
  } catch (error) {
    alert('Nie udało się zaimportować kodu. Upewnij się, że wklejasz kod wygenerowany przez BookmarkStyler.');
    console.error(error);
  }
}

function parseTokens(raw) {
  const baseMatch = raw.match(/:root\s*\{([^}]+)\}/);
  const darkMatch = raw.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{[^}]*:root\s*\{([^}]+)\}/);
  if (!baseMatch) return null;
  const baseBody = baseMatch[1];
  const darkBody = darkMatch ? darkMatch[1] : '';

  const nextBase = { ...baseTokens };
  baseBody.split(';').forEach((entry) => {
    const [property, value] = entry.split(':');
    if (!property || !value) return;
    const key = property.trim().replace('--bm-', '');
    if (key in nextBase) {
      nextBase[key] = value.trim();
    }
  });

  const nextDark = { ...darkTokens };
  darkBody.split(';').forEach((entry) => {
    const [property, value] = entry.split(':');
    if (!property || !value) return;
    const cleanKey = property.trim().replace('--bm-', '');
    if (cleanKey in nextDark) {
      nextDark[cleanKey] = value.trim();
    }
  });

  return { baseTokens: nextBase, darkTokens: nextDark };
}

function parseElements(raw) {
  const elementRegex = /\/\* BookmarkStyler: ([^*]+) \*\/\s*([^{}]+)\{([\s\S]*?)\}(?:\s*\2:hover\{([\s\S]*?)\})?/g;
  const items = [];
  let match;
  while ((match = elementRegex.exec(raw)) !== null) {
    try {
      const meta = JSON.parse(match[1].trim());
      const selector = match[2];
      const body = match[3];
      const hoverBody = match[4] || '';
      const base = elementTemplates[meta.type] ? deepClone(elementTemplates[meta.type]) : deepClone(elementTemplates.folder);
      const parsed = {
        ...base,
        id: meta.id || createId(meta.type),
        type: meta.type,
        label: meta.label
      };
      const getValue = (prop) => {
        const regex = new RegExp(`${prop}\\s*:\\s*([^;]+);`, 'i');
        const res = body.match(regex);
        if (!res) return null;
        return res[1].replace(/!important/gi, '').trim();
      };
      parsed.background = getValue('background') || parsed.background;
      parsed.textColor = getValue('color') || parsed.textColor;
      parsed.borderColor = getValue('border-color') || parsed.borderColor;
      parsed.borderWidth = getValue('border-width') || parsed.borderWidth;
      parsed.borderRadius = getValue('border-radius') || parsed.borderRadius;
      const padding = getValue('padding');
      if (padding) {
        const [py, px] = padding.split(/\s+/);
        parsed.paddingY = py || parsed.paddingY;
        parsed.paddingX = px || parsed.paddingX;
      }
      parsed.fontWeight = getValue('font-weight') || parsed.fontWeight;
      parsed.boxShadow = getValue('box-shadow') || parsed.boxShadow;
      parsed.textShadow = getValue('text-shadow') || parsed.textShadow;

      const customLines = body
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !/^background\s*:/.test(line) &&
          !/^color\s*:/.test(line) &&
          !/^border-(color|width|style|radius)\s*:/.test(line) &&
          !/^padding\s*:/.test(line) &&
          !/^font-weight\s*:/.test(line) &&
          !/^box-shadow\s*:/.test(line) &&
          !/^text-shadow\s*:/.test(line));

      parsed.customCSS = customLines
        .map((line) => line.replace(/!important/gi, '').trim())
        .join('\n');

      if (hoverBody) {
        const hoverMatch = hoverBody.match(/box-shadow\s*:\s*([^;]+);/i);
        parsed.hoverShadow = hoverMatch ? hoverMatch[1].replace(/!important/gi, '').trim() : parsed.hoverShadow;
      }
      items.push(parsed);
    } catch (error) {
      console.warn('Nie udało się sparsować bloku CSS', error);
    }
  }
  return items;
}

function init() {
  renderTokens();
  renderCanvas();
  renderCSS();

  document.querySelectorAll('[data-action="add"]').forEach((button) => {
    button.addEventListener('click', () => addElement(button.dataset.type));
  });

  document.querySelectorAll('.shape-button').forEach((button) => {
    button.addEventListener('click', () => handleShapeQuick(button.dataset.shape));
  });

  document.getElementById('duplicateBtn').addEventListener('click', duplicateElement);
  document.getElementById('deleteBtn').addEventListener('click', deleteElement);
  document.getElementById('copyCssBtn').addEventListener('click', () => {
    copyCssToClipboard();
    cssOutput.classList.add('copied');
    setTimeout(() => cssOutput.classList.remove('copied'), 900);
  });
  document.getElementById('refreshCssBtn').addEventListener('click', renderCSS);
  document.getElementById('importBtn').addEventListener('click', (event) => {
    event.preventDefault();
    importCSS();
  });
}

init();
