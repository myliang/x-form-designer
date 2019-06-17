import CellRange from './cell-range';
import Base from './base';
import { expr2xy, xy2expr } from './alphabet';

export default class Select extends Base {
  // select: [ref, refRange]
  constructor(merges) {
    super(['A1', 'A1:A1']);
    this.merges = merges;
  }

  get indexes() {
    return expr2xy(this.$[0]).reverse();
  }

  get range() {
    return CellRange.valueOf(this.$[1]);
  }

  get multiple() {
    return this.range.multiple();
  }

  get merged() {
    const {
      range, merges, indexes,
    } = this;
    if (range.multiple()) {
      const merge = merges.find(...indexes);
      if (merge) return merge.equals(range);
    }
    return false;
  }

  get single() {
    return this.merged || !this.multiple;
  }

  each(cb) {
    const { range } = this;
    const {
      sri, sci, eri, eci,
    } = range;
    const nmerges = this.merges.filter(range);
    for (let i = sri; i <= eri; i += 1) {
      for (let j = sci; j <= eci; j += 1) {
        const merge = nmerges.find(it => it.includes(i, j));
        if (merge) {
          if (merge.sri === i && merge.sci === j) {
            cb(i, j);
          }
          const [, cn] = merge.size();
          j += cn - 1;
        } else {
          cb(i, j);
        }
      }
    }
  }

  // set sri, sci
  s(ri, ci) {
    this.$[0] = xy2expr(ci, ri);
    // this.$[1] = `${this.$[0]}:${this.$[0]}`
    this.e(ri, ci);
  }

  // set eri, eci, sri, sci
  e(eri, eci) {
    const { range, merges, indexes } = this;
    const [ri, ci] = indexes;
    if (eri >= ri) {
      range.sri = ri;
      range.eri = eri;
    } else {
      range.sri = eri;
      range.eri = ri;
    }
    if (eci >= ci) {
      range.sci = ci;
      range.eci = eci;
    } else {
      range.sci = eci;
      range.eci = ci;
    }
    this.$[1] = merges.union(range).toString();
  }
}
