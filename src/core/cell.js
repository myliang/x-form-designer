import cellEval from './cell-evaluation';
import formula from './formula';
import helper from './helper';

function getCell() {
  const { rows, ri, ci } = this;
  return undefined || (rows[ri] && rows[ri].cells && rows[ri].cells[ci]);
}

function getCellOrNew() {
  const { rows, ri, ci } = this;
  rows[ri] = rows[ri] || { cells: {} };
  // rows[ri].cells = rows[ri].cells || {};
  rows[ri].cells[ci] = rows[ri].cells[ci] || {};
  this.$ = rows[ri].cells[ci];
  return this.$;
}

export default class Cell {
  constructor({ rows }, styles, ri, ci, mode = 'read') {
    this.styles = styles;
    this.rows = rows;
    this.ri = ri;
    this.ci = ci;
    if (mode === 'read') {
      this.$ = getCell.call(this);
    } else {
      this.$ = getCellOrNew.call(this);
    }
  }

  get value() {
    const { $ } = this;
    if (!$) return undefined;
    let { text } = $;
    if (text) {
      text = cellEval(text, formula.map, (x, y) => {
        const c = getCell.call(this, y, x);
        return '' || (c && c.text);
      });
      this.$.value = text;
    }
    return text;
  }

  get style() {
    const { $ } = this;
    return this.styles.getOrDefault(undefined || ($ && $.style));
  }

  get text() {
    const { $ } = this;
    return $ ? $.text : '';
  }

  // attr: font-name | font-italic | font-bold | font-size
  // textwrap | underline | align | valign | color | bgcolor | border | text
  update(attr, value) {
    const { $, styles } = this;
    if (attr === 'text') {
      $.text = value;
      return;
    }
    let nstyle = {};
    if ($.style !== undefined) {
      nstyle = helper.clone(styles.get($.style));
    }
    if (attr.startsWith('font')) {
      nstyle.font = nstyle.font || {};
      nstyle.font[attr.split('-')[1]] = value;
    } else if (attr === 'border') {
      if (value) {
        nstyle[attr] = Object.assign(nstyle[attr] || {}, value);
      } else {
        delete nstyle[attr];
      }
    } else {
      nstyle[attr] = value;
    }
    if (Object.keys(nstyle).length > 0) {
      $.style = styles.add(nstyle);
    }
  }

  static read(data, styles, ri, ci) {
    return new Cell(data, styles, ri, ci, 'read');
  }

  static write(data, styles, ri, ci) {
    return new Cell(data, styles, ri, ci, 'write');
  }
}
