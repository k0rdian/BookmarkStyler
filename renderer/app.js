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
    customCSS: '',
    shapeLayers: []
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
    customCSS: '',
    shapeLayers: []
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
    customCSS: '',
    shapeLayers: []
  }
};

const typeLabels = {
  folder: 'Folder',
  subfolder: 'Podfolder',
  bookmark: 'Zakładka'
};

const shapeTemplates = {
  circle: () => ({
    id: createId('shape'),
    type: 'radial',
    label: 'Okrąg',
    radius: 70,
    positionX: 22,
    positionY: 28,
    innerColor: '#ffd770',
    innerOpacity: 1,
    outerColor: '#ffecaa',
    outerOpacity: 0.4,
    innerStop: 35,
    outerStop: 60
  }),
  stripe: () => ({
    id: createId('shape'),
    type: 'linear',
    label: 'Pasek',
    angle: 135,
    startColor: '#7b2cff',
    startOpacity: 0.6,
    endColor: '#5920d2',
    endOpacity: 0,
    startStop: 0,
    endStop: 65
  }),
  glow: () => ({
    id: createId('shape'),
    type: 'soft-radial',
    label: 'Poświata',
    radius: 120,
    positionX: 50,
    positionY: 50,
    innerColor: '#ffffff',
    innerOpacity: 0.28,
    outerColor: '#ffffff',
    outerOpacity: 0,
    innerStop: 0,
    outerStop: 100
  })
};

const baseTokenDefinitions = [
  { key: 'padY', label: 'Odstęp pionowy', hint: 'Reguluje górny i dolny padding folderów' },
  { key: 'padX', label: 'Odstęp poziomy', hint: 'Reguluje lewy i prawy padding folderów' },
  { key: 'radius', label: 'Promień narożników', hint: 'Zaokrąglenie rogów folderów' },
  { key: 'fontWeight', label: 'Grubość pisma', hint: 'Wartość font-weight dla etykiet' },
  { key: 'transition', label: 'Animacja hover', hint: 'Czas i przebieg przejścia kolorów' },
  { key: 'stroke', label: 'Kolor obramowania', hint: 'Domyślny kolor linii wokół folderu' },
  { key: 'focus', label: 'Kolor obrysu focus', hint: 'Kolor obramowania po użyciu klawiatury' },
  { key: 'bg', label: 'Kolor tła', hint: 'Kolor bazowy folderu' },
  { key: 'fg', label: 'Kolor tekstu', hint: 'Kolor etykiety folderu' },
  { key: 'hover', label: 'Kolor hover', hint: 'Kolor tła po najechaniu' }
];

const darkTokenDefinitions = [
  { key: 'bg', label: 'Kolor tła (tryb ciemny)', hint: 'Bazowy kolor tła w ciemnym motywie' },
  { key: 'fg', label: 'Kolor tekstu (tryb ciemny)', hint: 'Kolor etykiety w ciemnym motywie' },
  { key: 'hover', label: 'Kolor hover (tryb ciemny)', hint: 'Kolor tła po najechaniu' },
  { key: 'focus', label: 'Kolor obrysu focus (tryb ciemny)', hint: 'Obramowanie po użyciu klawiatury' }
];

function createId(prefix = 'el') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  if (![3, 6].includes(normalized.length)) return null;
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;
  const int = parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function withAlpha(hex, alpha) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const safeAlpha = clamp(Number(alpha) || 0, 0, 1);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${safeAlpha.toFixed(2)})`;
}

function rgbToHex(r, g, b) {
  const toHex = (component) => clamp(Math.round(component), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function parseColorValue(value) {
  if (!value) {
    return { hex: '#000000', alpha: 1, supports: false };
  }
  const trimmed = value.trim();
  const hexMatch = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hexMatch) {
    const raw = hexMatch[1];
    if (raw.length === 3) {
      const expanded = raw.split('').map((char) => char + char).join('');
      return { hex: `#${expanded}`, alpha: 1, supports: true };
    }
    if (raw.length === 6) {
      return { hex: `#${raw}`, alpha: 1, supports: true };
    }
    const hex = `#${raw.slice(0, 6)}`;
    const alpha = parseInt(raw.slice(6, 8), 16) / 255;
    return { hex, alpha, supports: true };
  }
  const rgbMatch = trimmed.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length >= 3) {
      const [r, g, b] = parts;
      const alpha = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
      return {
        hex: rgbToHex(Number(r), Number(g), Number(b)),
        alpha: clamp(alpha, 0, 1),
        supports: true
      };
    }
  }
  return { hex: '#000000', alpha: 1, supports: false };
}

function parseNumeric(value, fallback = 0) {
  if (typeof value !== 'string') {
    return Number.isFinite(value) ? value : fallback;
  }
  const match = value.trim().match(/(-?\d+(?:\.\d+)?)/);
  if (!match) return fallback;
  return parseFloat(match[1]);
}

function detectUnit(value, fallback = 'px') {
  if (typeof value !== 'string') return fallback;
  const match = value.trim().match(/-?\d+(?:\.\d+)?\s*(.*)/);
  if (!match) return fallback;
  const unit = match[1].trim();
  return unit || fallback;
}

function shapeLayerToCss(shape) {
  if (!shape) return '';
  if (shape.type === 'linear') {
    const start = withAlpha(shape.startColor, shape.startOpacity);
    const end = withAlpha(shape.endColor, shape.endOpacity);
    const startStop = clamp(shape.startStop ?? 0, 0, 100);
    const endStop = clamp(shape.endStop ?? 100, 0, 100);
    return `linear-gradient(${shape.angle ?? 0}deg, ${start} ${startStop}%, ${end} ${endStop}%)`;
  }
  const inner = withAlpha(shape.innerColor, shape.innerOpacity);
  const outer = withAlpha(shape.outerColor, shape.outerOpacity);
  const radius = clamp(shape.radius ?? 60, 10, 240);
  const positionX = clamp(shape.positionX ?? 50, 0, 100);
  const positionY = clamp(shape.positionY ?? 50, 0, 100);
  const innerStop = clamp(shape.innerStop ?? 30, 0, 100);
  const outerStop = clamp(shape.outerStop ?? 70, innerStop + 1, 100);
  return `radial-gradient(${radius}px ${radius}px at ${positionX}% ${positionY}%, ${inner} 0%, ${inner} ${innerStop}%, ${outer} ${outerStop}%)`;
}

function computeBackground(element) {
  const layers = [];
  if (Array.isArray(element.shapeLayers) && element.shapeLayers.length) {
    element.shapeLayers.forEach((layer) => {
      const css = shapeLayerToCss(layer);
      if (css) {
        layers.push(css);
      }
    });
  }
  if (element.background) {
    layers.push(element.background);
  }
  return layers.join(', ');
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

    const background = computeBackground(element);
    node.style.background = background;
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
    preview.style.background = background;
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

  propertyForm.innerHTML = [
    createTextField('label', 'Nazwa', selected.label),
    createTextareaField('background', 'Tło bazowe', selected.background, 'Możesz wpisać kolor, gradient lub kilka warstw po przecinku.'),
    createColorField('textColor', 'Kolor tekstu', selected.textColor),
    `<div class="form-row">${createColorField('borderColor', 'Kolor obramowania', selected.borderColor)}${createSliderField('borderWidth', 'Szerokość obramowania', selected.borderWidth, { min: 0, max: 6, step: 1, unit: 'px' })}</div>`,
    `<div class="form-row">${createSliderField('paddingY', 'Padding pionowy', selected.paddingY, { min: 0, max: 30, step: 1, unit: 'px' })}${createSliderField('paddingX', 'Padding poziomy', selected.paddingX, { min: 0, max: 40, step: 1, unit: 'px' })}</div>`,
    createSliderField('borderRadius', 'Promień narożników', selected.borderRadius, { min: 0, max: 60, step: 1, unit: 'px' }),
    createSliderField('fontWeight', 'Grubość tekstu', selected.fontWeight, { min: 100, max: 900, step: 50, unit: '' }),
    createShadowSection('boxShadow', 'Cień', selected.boxShadow),
    createShadowSection('hoverShadow', 'Cień po najechaniu', selected.hoverShadow),
    createTextField('textShadow', 'Cień tekstu', selected.textShadow),
    createShapePanel(selected),
    createTextareaField('customCSS', 'Dodatkowe reguły', selected.customCSS, 'Wpisz dodatkowe deklaracje CSS, każdą w nowej linii.')
  ].join('');

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

function formatRangeLabel(value, unit) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return `${value}`;
  }
  return unit ? `${numeric}${unit}` : `${numeric}`;
}

function createSliderField(name, label, value, options = {}) {
  const { min = 0, max = 100, step = 1, unit = 'px' } = options;
  const normalizedUnit = unit === undefined ? 'px' : unit;
  const detectedUnit = detectUnit(value, normalizedUnit);
  const supportsSlider = normalizedUnit === '' || detectedUnit === normalizedUnit;
  const numericValue = clamp(parseNumeric(value, min), min, max);
  const sliderValue = supportsSlider ? numericValue : clamp(min, min, max);
  const currentDisplay = value || formatRangeLabel(sliderValue, normalizedUnit);
  const hiddenValue = value || formatRangeLabel(sliderValue, normalizedUnit);
  const disabledAttr = supportsSlider ? '' : 'disabled';
  return `
    <div class="form-group form-group--range" data-supports-range="${supportsSlider}">
      <label for="${name}">${label}<span class="range-value" data-value-for="${name}">${escapeHtml(currentDisplay)}</span></label>
      <div class="range-inputs">
        <input type="range" ${disabledAttr} data-role="range" data-target="${name}" data-unit="${normalizedUnit}" min="${min}" max="${max}" step="${step}" value="${sliderValue}" />
        <input type="number" ${disabledAttr} data-role="range-number" data-target="${name}" data-unit="${normalizedUnit}" min="${min}" max="${max}" step="${step}" value="${sliderValue}" />
      </div>
      <input id="${name}" name="${name}" value="${escapeHtml(hiddenValue)}" />
      ${supportsSlider ? '' : '<small class="range-hint">Suwak działa dla wartości w pikselach.</small>'}
    </div>
  `;
}

function syncRangeFromInput(name, value) {
  const slider = propertyForm.querySelector(`input[data-role="range"][data-target="${name}"]`);
  const number = propertyForm.querySelector(`input[data-role="range-number"][data-target="${name}"]`);
  const unit = slider?.getAttribute('data-unit') || number?.getAttribute('data-unit') || 'px';
  const display = propertyForm.querySelector(`[data-value-for="${name}"]`);
  if (!slider || slider.disabled) {
    if (display) {
      display.textContent = value;
    }
    return;
  }
  const supportsSlider = unit === '' || detectUnit(value, unit) === unit;
  if (!supportsSlider) {
    slider.disabled = true;
    if (number) number.disabled = true;
    if (display) display.textContent = value;
    const group = slider.closest('.form-group');
    if (group) {
      group.setAttribute('data-supports-range', 'false');
    }
    return;
  }
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const numeric = clamp(parseNumeric(value, min), min, max);
  slider.disabled = false;
  slider.value = numeric;
  if (number) {
    number.disabled = false;
    number.value = numeric;
  }
  if (display) {
    display.textContent = formatRangeLabel(numeric, unit);
  }
  const group = slider.closest('.form-group');
  if (group) {
    group.setAttribute('data-supports-range', 'true');
  }
}

function handleRangeControl(event) {
  const target = event.target;
  const name = target.getAttribute('data-target');
  if (!name) return;
  const unit = target.getAttribute('data-unit') || 'px';
  let numeric = parseFloat(target.value);
  if (!Number.isFinite(numeric)) {
    numeric = 0;
  }
  const min = parseFloat(target.min);
  const max = parseFloat(target.max);
  if (Number.isFinite(min)) {
    numeric = Math.max(numeric, min);
  }
  if (Number.isFinite(max)) {
    numeric = Math.min(numeric, max);
  }
  propertyForm.querySelectorAll(`input[data-target="${name}"][data-role="range"]`).forEach((input) => {
    input.value = numeric;
  });
  propertyForm.querySelectorAll(`input[data-target="${name}"][data-role="range-number"]`).forEach((input) => {
    input.value = numeric;
  });
  const display = propertyForm.querySelector(`[data-value-for="${name}"]`);
  if (display) {
    display.textContent = formatRangeLabel(numeric, unit);
  }
  const hidden = propertyForm.querySelector(`input[name="${name}"]`);
  if (hidden) {
    hidden.value = formatRangeLabel(numeric, unit);
    hidden.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

const shadowDefaults = {
  boxShadow: {
    offsetX: 0,
    offsetY: 10,
    blur: 26,
    spread: 0,
    color: '#3366ff',
    opacity: 0.28
  },
  hoverShadow: {
    offsetX: 0,
    offsetY: 12,
    blur: 32,
    spread: 0,
    color: '#7b2cff',
    opacity: 0.35
  }
};

function parseShadowValue(value) {
  const trimmed = (value || '').trim();
  if (!trimmed || trimmed.toLowerCase() === 'none') {
    return {
      enabled: false,
      supports: true,
      ...shadowDefaults.boxShadow,
      raw: 'none'
    };
  }
  const regex = /^(?:inset\s+)?(-?\d+(?:px)?)\s+(-?\d+(?:px)?)(?:\s+(-?\d+(?:px)?))?(?:\s+(-?\d+(?:px)?))?\s+(.*)$/i;
  const match = trimmed.match(regex);
  if (!match) {
    return { enabled: true, supports: false, raw: trimmed };
  }
  const [, offsetXRaw, offsetYRaw, blurRaw = '0px', spreadRaw = '0px', colorRaw] = match;
  const values = [offsetXRaw, offsetYRaw, blurRaw, spreadRaw];
  const pxOnly = values.every((token) => !token || /px$/i.test(token.trim()));
  const colorInfo = parseColorValue(colorRaw);
  const supports = pxOnly && colorInfo.supports;
  return {
    enabled: true,
    supports,
    offsetX: parseNumeric(offsetXRaw, 0),
    offsetY: parseNumeric(offsetYRaw, 0),
    blur: parseNumeric(blurRaw, 0),
    spread: parseNumeric(spreadRaw, 0),
    color: colorInfo.hex,
    opacity: colorInfo.alpha,
    raw: trimmed
  };
}

function buildShadowValue(shadow) {
  const offsetX = `${shadow.offsetX}px`;
  const offsetY = `${shadow.offsetY}px`;
  const blur = `${shadow.blur}px`;
  const spread = `${shadow.spread}px`;
  const color = withAlpha(shadow.color, shadow.opacity);
  return `${offsetX} ${offsetY} ${blur} ${spread} ${color}`.trim();
}

function createShadowSlider(target, prop, label, value, min, max) {
  const numeric = clamp(parseNumeric(value, 0), min, max);
  return `
    <div class="shadow-control">
      <div class="shadow-control__label">
        <span>${label}</span>
        <span class="shadow-control__value" data-shadow-value="${target}:${prop}">${numeric}px</span>
      </div>
      <div class="shadow-control__inputs">
        <input type="range" data-role="shadow-range" data-target="${target}" data-prop="${prop}" min="${min}" max="${max}" step="1" value="${numeric}" />
        <input type="number" data-role="shadow-number" data-target="${target}" data-prop="${prop}" min="${min}" max="${max}" step="1" value="${numeric}" />
      </div>
    </div>
  `;
}

function createShadowColorControls(target, parsed) {
  const opacityPercent = Math.round(clamp(parsed.opacity ?? 0.25, 0, 1) * 100);
  return `
    <div class="shadow-color">
      <div class="shadow-control__label">
        <span>Kolor i przezroczystość</span>
        <span class="shadow-control__value" data-shadow-opacity="${target}">${opacityPercent}%</span>
      </div>
      <div class="shadow-color__inputs">
        <input type="color" data-role="shadow-color" data-target="${target}" value="${sanitizeColor(parsed.color)}" />
        <input type="range" data-role="shadow-opacity" data-target="${target}" min="0" max="100" step="1" value="${opacityPercent}" />
      </div>
    </div>
  `;
}

function createShadowSection(name, label, value) {
  const parsed = parseShadowValue(value);
  const enabled = parsed.enabled && parsed.raw !== 'none';
  const controlsDisabled = !enabled || !parsed.supports;
  const sectionControls = parsed.supports
    ? [
        createShadowSlider(name, 'offsetX', 'Przesunięcie X', parsed.offsetX, -40, 40),
        createShadowSlider(name, 'offsetY', 'Przesunięcie Y', parsed.offsetY, -40, 40),
        createShadowSlider(name, 'blur', 'Rozmycie', parsed.blur, 0, 120),
        createShadowSlider(name, 'spread', 'Rozszerzenie', parsed.spread, -20, 60),
        createShadowColorControls(name, parsed)
      ].join('')
    : '';
  const hint = parsed.supports ? '' : '<p class="shadow-hint">Wartość zawiera niestandardowe składniki – edytuj ją poniżej ręcznie.</p>';
  return `
    <section class="shadow-group" data-shadow="${name}">
      <div class="shadow-group__header">
        <h3>${label}</h3>
        <label class="shadow-toggle">
          <input type="checkbox" data-role="shadow-toggle" data-target="${name}" ${enabled ? 'checked' : ''} />
          <span>${enabled ? 'Włączone' : 'Wyłączone'}</span>
        </label>
      </div>
      <div class="shadow-controls ${controlsDisabled ? 'is-disabled' : ''}" data-shadow-controls="${name}">${sectionControls}</div>
      ${hint}
      <div class="shadow-manual">
        <label for="${name}">Wartość CSS</label>
        <input id="${name}" name="${name}" data-role="shadow-string" value="${escapeHtml(value || (enabled ? parsed.raw : 'none'))}" />
      </div>
    </section>
  `;
}

function createShapePanel(element) {
  const shapes = Array.isArray(element.shapeLayers) ? element.shapeLayers : [];
  const items = shapes.map((shape, index) => createShapeItem(shape, index + 1)).join('');
  const empty = shapes.length
    ? ''
    : '<p class="shape-panel__empty">Brak dodatkowych kształtów. Dodaj dekorację z panelu po lewej lub przyciskiem poniżej.</p>';
  return `
    <section class="shape-panel" data-shape-panel>
      <div class="shape-panel__header">
        <h3>Warstwy tła</h3>
        <div class="shape-panel__actions">
          <button type="button" class="btn btn--ghost" data-action="add-shape" data-shape="circle">Okrąg</button>
          <button type="button" class="btn btn--ghost" data-action="add-shape" data-shape="stripe">Pasek</button>
          <button type="button" class="btn btn--ghost" data-action="add-shape" data-shape="glow">Poświata</button>
        </div>
      </div>
      ${empty}
      <div class="shape-panel__items">${items}</div>
    </section>
  `;
}

function createShapeItem(shape, index) {
  const title = shape.label ? escapeHtml(shape.label) : `Warstwa ${index}`;
  const typeLabel = shape.type === 'linear' ? 'Gradient liniowy' : 'Gradient radialny';
  let controls = '';
  if (shape.type === 'linear') {
    controls = [
      createShapeSliderControl(shape, 'angle', 'Kąt', shape.angle ?? 135, { min: 0, max: 360, step: 1, suffix: '°' }),
      createShapeSliderControl(shape, 'startStop', 'Początek koloru', shape.startStop ?? 0, { min: 0, max: 100, step: 1, suffix: '%' }),
      createShapeSliderControl(shape, 'endStop', 'Koniec koloru', shape.endStop ?? 100, { min: 0, max: 100, step: 1, suffix: '%' }),
      createShapeColorControl(shape, 'startColor', 'startOpacity', 'Kolor początkowy'),
      createShapeColorControl(shape, 'endColor', 'endOpacity', 'Kolor końcowy')
    ].join('');
  } else {
    controls = [
      createShapeSliderControl(shape, 'radius', 'Promień', shape.radius ?? 80, { min: 20, max: 240, step: 1, suffix: 'px' }),
      createShapeSliderControl(shape, 'positionX', 'Pozycja X', shape.positionX ?? 50, { min: 0, max: 100, step: 1, suffix: '%' }),
      createShapeSliderControl(shape, 'positionY', 'Pozycja Y', shape.positionY ?? 50, { min: 0, max: 100, step: 1, suffix: '%' }),
      createShapeSliderControl(shape, 'innerStop', 'Granica wewnętrzna', shape.innerStop ?? 30, { min: 0, max: 100, step: 1, suffix: '%' }),
      createShapeSliderControl(shape, 'outerStop', 'Granica zewnętrzna', shape.outerStop ?? 70, { min: 0, max: 100, step: 1, suffix: '%' }),
      createShapeColorControl(shape, 'innerColor', 'innerOpacity', 'Kolor wewnętrzny'),
      createShapeColorControl(shape, 'outerColor', 'outerOpacity', 'Kolor zewnętrzny')
    ].join('');
  }
  return `
    <article class="shape-item" data-shape-id="${shape.id}">
      <header class="shape-item__header">
        <div>
          <strong>${title}</strong>
          <span class="shape-item__type">${typeLabel}</span>
        </div>
        <button type="button" class="shape-remove" data-action="remove-shape" data-shape-id="${shape.id}">Usuń</button>
      </header>
      <div class="shape-item__controls">${controls}</div>
    </article>
  `;
}

function createShapeSliderControl(shape, prop, label, value, options = {}) {
  const { min = 0, max = 100, step = 1, suffix = '' } = options;
  const numeric = clamp(parseNumeric(value, min), min, max);
  return `
    <div class="shape-control">
      <div class="shape-control__label">
        <span>${label}</span>
        <span class="shape-control__value" data-shape-value="${shape.id}:${prop}">${numeric}${suffix}</span>
      </div>
      <div class="shape-control__inputs">
        <input type="range" data-role="shape-slider" data-shape-id="${shape.id}" data-prop="${prop}" data-suffix="${suffix}" min="${min}" max="${max}" step="${step}" value="${numeric}" />
        <input type="number" data-role="shape-number" data-shape-id="${shape.id}" data-prop="${prop}" data-suffix="${suffix}" min="${min}" max="${max}" step="${step}" value="${numeric}" />
      </div>
    </div>
  `;
}

function createShapeColorControl(shape, colorProp, opacityProp, label) {
  const color = sanitizeColor(shape[colorProp] || '#ffffff');
  const opacityPercent = Math.round(clamp(shape[opacityProp] ?? 1, 0, 1) * 100);
  return `
    <div class="shape-color">
      <div class="shape-control__label">
        <span>${label}</span>
        <span class="shape-control__value" data-shape-opacity="${shape.id}:${opacityProp}">${opacityPercent}%</span>
      </div>
      <div class="shadow-color__inputs">
        <input type="color" data-role="shape-color" data-shape-id="${shape.id}" data-prop="${colorProp}" value="${color}" />
        <input type="range" data-role="shape-opacity" data-shape-id="${shape.id}" data-prop="${opacityProp}" min="0" max="100" step="1" value="${opacityPercent}" />
      </div>
    </div>
  `;
}

function updateShadowValue(name, value) {
  const input = propertyForm.querySelector(`input[name="${name}"]`);
  if (!input) return;
  const next = value === 'none' ? 'none' : buildShadowValue(value);
  input.value = next;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  syncShadowControls(name, next);
}

function mutateShadow(name, mutator) {
  const input = propertyForm.querySelector(`input[name="${name}"]`);
  if (!input) return;
  const current = input.value;
  const parsed = parseShadowValue(current);
  if (!parsed.supports) return;
  const defaults = shadowDefaults[name] || shadowDefaults.boxShadow;
  const state = parsed.raw === 'none'
    ? { ...defaults }
    : {
        offsetX: parsed.offsetX,
        offsetY: parsed.offsetY,
        blur: parsed.blur,
        spread: parsed.spread,
        color: parsed.color,
        opacity: parsed.opacity
      };
  mutator(state);
  updateShadowValue(name, state);
}

function syncShadowControls(name, rawValue) {
  const parsed = parseShadowValue(rawValue);
  const controls = propertyForm.querySelector(`[data-shadow-controls="${name}"]`);
  const toggle = propertyForm.querySelector(`input[data-role="shadow-toggle"][data-target="${name}"]`);
  if (toggle) {
    const label = toggle.nextElementSibling;
    if (label) {
      label.textContent = parsed.enabled && parsed.raw !== 'none' ? 'Włączone' : 'Wyłączone';
    }
    toggle.checked = parsed.enabled && parsed.raw !== 'none';
  }
  if (!controls) return;
  const disabled = !parsed.supports || !parsed.enabled || parsed.raw === 'none';
  controls.classList.toggle('is-disabled', disabled);
  propertyForm.querySelectorAll(`input[data-role="shadow-range"][data-target="${name}"]`).forEach((slider) => {
    slider.disabled = disabled;
    if (!disabled) {
      const prop = slider.getAttribute('data-prop');
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const value = clamp(parsed[prop] ?? 0, min, max);
      slider.value = value;
      const display = propertyForm.querySelector(`[data-shadow-value="${name}:${prop}"]`);
      if (display) {
        display.textContent = `${value}px`;
      }
    }
  });
  propertyForm.querySelectorAll(`input[data-role="shadow-number"][data-target="${name}"]`).forEach((input) => {
    input.disabled = disabled;
    if (!disabled) {
      const prop = input.getAttribute('data-prop');
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      const value = clamp(parsed[prop] ?? 0, min, max);
      input.value = value;
    }
  });
  const colorInput = propertyForm.querySelector(`input[data-role="shadow-color"][data-target="${name}"]`);
  if (colorInput) {
    colorInput.disabled = disabled;
    if (!disabled) {
      colorInput.value = sanitizeColor(parsed.color || '#000000');
    }
  }
  const opacityInput = propertyForm.querySelector(`input[data-role="shadow-opacity"][data-target="${name}"]`);
  if (opacityInput) {
    const percent = Math.round(clamp(parsed.opacity ?? 0.25, 0, 1) * 100);
    opacityInput.disabled = disabled;
    opacityInput.value = percent;
    const label = propertyForm.querySelector(`[data-shadow-opacity="${name}"]`);
    if (label) {
      label.textContent = `${percent}%`;
    }
  }
}

function handleShadowRange(event) {
  const name = event.target.getAttribute('data-target');
  const prop = event.target.getAttribute('data-prop');
  if (!name || !prop) return;
  if (event.target.disabled) return;
  let numeric = parseFloat(event.target.value);
  if (!Number.isFinite(numeric)) numeric = 0;
  const min = parseFloat(event.target.min);
  const max = parseFloat(event.target.max);
  if (Number.isFinite(min)) numeric = Math.max(numeric, min);
  if (Number.isFinite(max)) numeric = Math.min(numeric, max);
  propertyForm.querySelectorAll(`input[data-role="shadow-range"][data-target="${name}"][data-prop="${prop}"]`).forEach((input) => {
    input.value = numeric;
  });
  propertyForm.querySelectorAll(`input[data-role="shadow-number"][data-target="${name}"][data-prop="${prop}"]`).forEach((input) => {
    input.value = numeric;
  });
  const display = propertyForm.querySelector(`[data-shadow-value="${name}:${prop}"]`);
  if (display) {
    display.textContent = `${numeric}px`;
  }
  mutateShadow(name, (shadow) => {
    shadow[prop] = numeric;
  });
}

function handleShadowColor(event) {
  const name = event.target.getAttribute('data-target');
  if (!name || event.target.disabled) return;
  const value = event.target.value;
  mutateShadow(name, (shadow) => {
    shadow.color = value;
  });
}

function handleShadowOpacity(event) {
  const name = event.target.getAttribute('data-target');
  if (!name || event.target.disabled) return;
  let percent = parseInt(event.target.value, 10);
  if (!Number.isFinite(percent)) percent = 0;
  percent = clamp(percent, 0, 100);
  const label = propertyForm.querySelector(`[data-shadow-opacity="${name}"]`);
  if (label) {
    label.textContent = `${percent}%`;
  }
  mutateShadow(name, (shadow) => {
    shadow.opacity = percent / 100;
  });
}

function handleShadowToggle(event) {
  const name = event.target.getAttribute('data-target');
  if (!name) return;
  if (!event.target.checked) {
    updateShadowValue(name, 'none');
    return;
  }
  const defaults = shadowDefaults[name] || shadowDefaults.boxShadow;
  updateShadowValue(name, { ...defaults });
}

function addShapeLayer(kind) {
  const selected = getSelected();
  if (!selected) return;
  const factory = shapeTemplates[kind];
  if (typeof factory !== 'function') return;
  const layer = factory();
  const nextLayers = Array.isArray(selected.shapeLayers) ? [...selected.shapeLayers, layer] : [layer];
  const updated = { ...selected, shapeLayers: nextLayers };
  elements = elements.map((item) => (item.id === selected.id ? updated : item));
  renderCanvas();
  renderCSS();
  renderProperties();
}

function updateShapeLayer(shapeId, updates) {
  const selected = getSelected();
  if (!selected) return;
  const layers = Array.isArray(selected.shapeLayers) ? selected.shapeLayers : [];
  let changed = false;
  const nextLayers = layers.map((layer) => {
    if (layer.id !== shapeId) return layer;
    const merged = { ...layer, ...updates };
    if (merged.type === 'linear') {
      merged.startStop = clamp(merged.startStop ?? 0, 0, 100);
      merged.endStop = clamp(merged.endStop ?? 100, merged.startStop ?? 0, 100);
    } else {
      merged.radius = clamp(merged.radius ?? 80, 20, 240);
      merged.positionX = clamp(merged.positionX ?? 50, 0, 100);
      merged.positionY = clamp(merged.positionY ?? 50, 0, 100);
      merged.innerStop = clamp(merged.innerStop ?? 30, 0, 99);
      merged.outerStop = clamp(merged.outerStop ?? 70, merged.innerStop + 1, 100);
    }
    merged.innerOpacity = clamp(merged.innerOpacity ?? layer.innerOpacity ?? 1, 0, 1);
    merged.outerOpacity = clamp(merged.outerOpacity ?? layer.outerOpacity ?? 1, 0, 1);
    merged.startOpacity = clamp(merged.startOpacity ?? layer.startOpacity ?? 1, 0, 1);
    merged.endOpacity = clamp(merged.endOpacity ?? layer.endOpacity ?? 1, 0, 1);
    changed = true;
    return merged;
  });
  if (!changed) return;
  const updated = { ...selected, shapeLayers: nextLayers };
  elements = elements.map((item) => (item.id === selected.id ? updated : item));
  renderCanvas();
  renderCSS();
}

function removeShapeLayer(shapeId) {
  const selected = getSelected();
  if (!selected) return;
  const layers = Array.isArray(selected.shapeLayers) ? selected.shapeLayers : [];
  const nextLayers = layers.filter((layer) => layer.id !== shapeId);
  const updated = { ...selected, shapeLayers: nextLayers };
  elements = elements.map((item) => (item.id === selected.id ? updated : item));
  renderCanvas();
  renderCSS();
  renderProperties();
}

function syncShapeControls(shapeId) {
  const selected = getSelected();
  if (!selected) return;
  const layer = selected.shapeLayers?.find((item) => item.id === shapeId);
  if (!layer) return;
  const pairs = layer.type === 'linear'
    ? [
        ['angle', layer.angle ?? 135, '°'],
        ['startStop', layer.startStop ?? 0, '%'],
        ['endStop', layer.endStop ?? 100, '%']
      ]
    : [
        ['radius', layer.radius ?? 80, 'px'],
        ['positionX', layer.positionX ?? 50, '%'],
        ['positionY', layer.positionY ?? 50, '%'],
        ['innerStop', layer.innerStop ?? 30, '%'],
        ['outerStop', layer.outerStop ?? 70, '%']
      ];
  pairs.forEach(([prop, rawValue, suffix]) => {
    propertyForm.querySelectorAll(`input[data-role="shape-slider"][data-shape-id="${shapeId}"][data-prop="${prop}"]`).forEach((input) => {
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      const value = clamp(rawValue, min, max);
      input.value = value;
    });
    propertyForm.querySelectorAll(`input[data-role="shape-number"][data-shape-id="${shapeId}"][data-prop="${prop}"]`).forEach((input) => {
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      const value = clamp(rawValue, min, max);
      input.value = value;
    });
    const label = propertyForm.querySelector(`[data-shape-value="${shapeId}:${prop}"]`);
    if (label) {
      label.textContent = `${Math.round(rawValue * 100) / 100}${suffix}`;
    }
  });
  const colorPairs = layer.type === 'linear'
    ? [
        ['startColor', 'startOpacity'],
        ['endColor', 'endOpacity']
      ]
    : [
        ['innerColor', 'innerOpacity'],
        ['outerColor', 'outerOpacity']
      ];
  colorPairs.forEach(([colorProp, opacityProp]) => {
    const colorInput = propertyForm.querySelector(`input[data-role="shape-color"][data-shape-id="${shapeId}"][data-prop="${colorProp}"]`);
    if (colorInput) {
      colorInput.value = sanitizeColor(layer[colorProp] || '#ffffff');
    }
    const opacityInput = propertyForm.querySelector(`input[data-role="shape-opacity"][data-shape-id="${shapeId}"][data-prop="${opacityProp}"]`);
    if (opacityInput) {
      const percent = Math.round(clamp(layer[opacityProp] ?? 1, 0, 1) * 100);
      opacityInput.value = percent;
      const label = propertyForm.querySelector(`[data-shape-opacity="${shapeId}:${opacityProp}"]`);
      if (label) {
        label.textContent = `${percent}%`;
      }
    }
  });
}

function handleShapeSlider(event) {
  const shapeId = event.target.getAttribute('data-shape-id');
  const prop = event.target.getAttribute('data-prop');
  if (!shapeId || !prop) return;
  let numeric = parseFloat(event.target.value);
  if (!Number.isFinite(numeric)) numeric = 0;
  const min = parseFloat(event.target.min);
  const max = parseFloat(event.target.max);
  if (Number.isFinite(min)) numeric = Math.max(numeric, min);
  if (Number.isFinite(max)) numeric = Math.min(numeric, max);
  propertyForm.querySelectorAll(`input[data-role="shape-slider"][data-shape-id="${shapeId}"][data-prop="${prop}"]`).forEach((input) => {
    input.value = numeric;
  });
  propertyForm.querySelectorAll(`input[data-role="shape-number"][data-shape-id="${shapeId}"][data-prop="${prop}"]`).forEach((input) => {
    input.value = numeric;
  });
  const suffix = event.target.getAttribute('data-suffix') || '';
  const label = propertyForm.querySelector(`[data-shape-value="${shapeId}:${prop}"]`);
  if (label) {
    label.textContent = `${numeric}${suffix}`;
  }
  updateShapeLayer(shapeId, { [prop]: numeric });
  syncShapeControls(shapeId);
}

function handleShapeColor(event) {
  const shapeId = event.target.getAttribute('data-shape-id');
  const prop = event.target.getAttribute('data-prop');
  if (!shapeId || !prop) return;
  updateShapeLayer(shapeId, { [prop]: event.target.value });
  syncShapeControls(shapeId);
}

function handleShapeOpacity(event) {
  const shapeId = event.target.getAttribute('data-shape-id');
  const prop = event.target.getAttribute('data-prop');
  if (!shapeId || !prop) return;
  let percent = parseInt(event.target.value, 10);
  if (!Number.isFinite(percent)) percent = 0;
  percent = clamp(percent, 0, 100);
  const label = propertyForm.querySelector(`[data-shape-opacity="${shapeId}:${prop}"]`);
  if (label) {
    label.textContent = `${percent}%`;
  }
  updateShapeLayer(shapeId, { [prop]: percent / 100 });
  syncShapeControls(shapeId);
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
  propertyForm.querySelectorAll('input[name], textarea[name], select[name]').forEach((field) => {
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
  propertyForm.querySelectorAll('input[data-role="range"]').forEach((slider) => {
    slider.addEventListener('input', handleRangeControl);
  });
  propertyForm.querySelectorAll('input[data-role="range-number"]').forEach((input) => {
    input.addEventListener('input', handleRangeControl);
    input.addEventListener('change', handleRangeControl);
  });
  propertyForm.querySelectorAll('[data-action="add-shape"]').forEach((button) => {
    button.addEventListener('click', () => addShapeLayer(button.getAttribute('data-shape')));
  });
  propertyForm.querySelectorAll('[data-action="remove-shape"]').forEach((button) => {
    button.addEventListener('click', () => removeShapeLayer(button.getAttribute('data-shape-id')));
  });
  propertyForm.querySelectorAll('input[data-role="shadow-range"]').forEach((input) => {
    input.addEventListener('input', handleShadowRange);
  });
  propertyForm.querySelectorAll('input[data-role="shadow-number"]').forEach((input) => {
    input.addEventListener('input', handleShadowRange);
  });
  propertyForm.querySelectorAll('input[data-role="shadow-color"]').forEach((input) => {
    input.addEventListener('input', handleShadowColor);
  });
  propertyForm.querySelectorAll('input[data-role="shadow-opacity"]').forEach((input) => {
    input.addEventListener('input', handleShadowOpacity);
  });
  propertyForm.querySelectorAll('input[data-role="shadow-toggle"]').forEach((input) => {
    input.addEventListener('change', handleShadowToggle);
  });
  propertyForm.querySelectorAll('input[data-role="shape-slider"]').forEach((input) => {
    input.addEventListener('input', handleShapeSlider);
  });
  propertyForm.querySelectorAll('input[data-role="shape-number"]').forEach((input) => {
    input.addEventListener('input', handleShapeSlider);
  });
  propertyForm.querySelectorAll('input[data-role="shape-color"]').forEach((input) => {
    input.addEventListener('input', handleShapeColor);
  });
  propertyForm.querySelectorAll('input[data-role="shape-opacity"]').forEach((input) => {
    input.addEventListener('input', handleShapeOpacity);
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
  syncRangeFromInput(name, cleaned);
  if (name === 'boxShadow' || name === 'hoverShadow') {
    syncShadowControls(name, cleaned);
  }
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
    const meta = JSON.stringify({
      id: element.id,
      type: element.type,
      label: element.label,
      shapeLayers: Array.isArray(element.shapeLayers) ? element.shapeLayers : []
    });
    const background = computeBackground(element);

    const declarations = [
      `background: ${background} !important;`,
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
  if (Array.isArray(clone.shapeLayers)) {
    clone.shapeLayers = clone.shapeLayers.map((layer) => ({ ...layer, id: createId('shape') }));
  }
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
  addShapeLayer(action);
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

function pickCssValue(body, property) {
  const regex = new RegExp(`${property}\\s*:\\s*([^;]+);`, 'i');
  const match = body.match(regex);
  if (!match) return null;
  return match[1].replace(/!important/gi, '').trim();
}

function inferSelectorMeta(selector) {
  const labelMatch = selector.match(/\[label\s*=\s*"([^\"]+)"\]/);
  if (!labelMatch) return null;
  const label = labelMatch[1];
  let type = 'folder';
  if (/\.bookmark-item\s*:not\(\[container\]\)/.test(selector)) {
    type = 'bookmark';
  } else if (/:is\(toolbarbutton\.bookmark-item,\s*menu\.bookmark-item\)/.test(selector) || /menu\.bookmark-item/.test(selector)) {
    type = 'subfolder';
  }
  return { label, type };
}

function parseFallbackElements(raw) {
  const hoverMap = new Map();
  const hoverRegex = /([^{}@]+):hover\s*\{([^{}]+)\}/g;
  let hoverMatch;
  while ((hoverMatch = hoverRegex.exec(raw)) !== null) {
    const selector = hoverMatch[1].trim();
    const meta = inferSelectorMeta(selector);
    if (!meta) continue;
    const key = `${meta.type}|${meta.label}`;
    hoverMap.set(key, hoverMatch[2]);
  }

  const blockRegex = /([^{}@]+)\{([^{}]+)\}/g;
  const seen = new Set();
  const items = [];
  let match;
  while ((match = blockRegex.exec(raw)) !== null) {
    const selector = match[1].trim();
    if (!selector || selector.startsWith('@') || selector.includes(':hover')) continue;
    if (!/label\s*=/.test(selector)) continue;
    const meta = inferSelectorMeta(selector);
    if (!meta) continue;
    const key = `${meta.type}|${meta.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const base = elementTemplates[meta.type] ? deepClone(elementTemplates[meta.type]) : deepClone(elementTemplates.folder);
    const parsed = { ...base, id: createId(meta.type), type: meta.type, label: meta.label, shapeLayers: [] };
    const body = match[2];
    parsed.background = pickCssValue(body, 'background') || parsed.background;
    parsed.textColor = pickCssValue(body, 'color') || parsed.textColor;
    parsed.borderColor = pickCssValue(body, 'border-color') || parsed.borderColor;
    parsed.borderWidth = pickCssValue(body, 'border-width') || parsed.borderWidth;
    parsed.borderRadius = pickCssValue(body, 'border-radius') || parsed.borderRadius;
    const padding = pickCssValue(body, 'padding');
    if (padding) {
      const [py, px] = padding.split(/\s+/);
      parsed.paddingY = py || parsed.paddingY;
      parsed.paddingX = px || parsed.paddingX;
    }
    parsed.fontWeight = pickCssValue(body, 'font-weight') || parsed.fontWeight;
    parsed.boxShadow = pickCssValue(body, 'box-shadow') || parsed.boxShadow;
    parsed.textShadow = pickCssValue(body, 'text-shadow') || parsed.textShadow;

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

    const hoverBody = hoverMap.get(key);
    if (hoverBody) {
      const hoverValue = pickCssValue(hoverBody, 'box-shadow');
      if (hoverValue) {
        parsed.hoverShadow = hoverValue;
      }
    }

    items.push(parsed);
  }

  return items;
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
        label: meta.label,
        shapeLayers: Array.isArray(meta.shapeLayers)
          ? meta.shapeLayers.map((layer) => ({ ...layer, id: layer.id || createId('shape') }))
          : []
      };
      parsed.background = pickCssValue(body, 'background') || parsed.background;
      parsed.textColor = pickCssValue(body, 'color') || parsed.textColor;
      parsed.borderColor = pickCssValue(body, 'border-color') || parsed.borderColor;
      parsed.borderWidth = pickCssValue(body, 'border-width') || parsed.borderWidth;
      parsed.borderRadius = pickCssValue(body, 'border-radius') || parsed.borderRadius;
      const padding = pickCssValue(body, 'padding');
      if (padding) {
        const [py, px] = padding.split(/\s+/);
        parsed.paddingY = py || parsed.paddingY;
        parsed.paddingX = px || parsed.paddingX;
      }
      parsed.fontWeight = pickCssValue(body, 'font-weight') || parsed.fontWeight;
      parsed.boxShadow = pickCssValue(body, 'box-shadow') || parsed.boxShadow;
      parsed.textShadow = pickCssValue(body, 'text-shadow') || parsed.textShadow;
      parsed.shapeLayers = Array.isArray(parsed.shapeLayers) ? parsed.shapeLayers : [];

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
        const hoverMatch = pickCssValue(hoverBody, 'box-shadow');
        parsed.hoverShadow = hoverMatch || parsed.hoverShadow;
      }
      items.push(parsed);
    } catch (error) {
      console.warn('Nie udało się sparsować bloku CSS', error);
    }
  }
  if (items.length) {
    return items;
  }
  return parseFallbackElements(raw);
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
