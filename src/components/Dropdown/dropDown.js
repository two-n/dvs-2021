import { CLASSES as C, COLUMN_LABELS } from '../../globals/constants';
import { select } from 'd3'
import './style.scss';

export default class DropDown {
  constructor(parent, options, selected, callback) {
    this.parent = parent;
    this.selected = selected;
    this.options = options;
    this.callback = callback;
    // sort options alphabetically and bring selected option to front
    this.options.sort((a, b) => a == selected ? -1 : b == selected ? 1 : a > b ? 1 : -1);

    this.el = this.parent
      .selectAll(`div.${C.FILTER}`)
      .data([0])
      .join("div")
      .attr("class", C.FILTER)

    this.el
      .on("click", function (e) {
        e.stopPropagation();
        const isOpen = select(this).classed(C.OPEN);
        select(this).classed(C.OPEN, !isOpen);
      })
      .selectAll(`div.${C.OPTION}`)
      .data(this.options, d => d)
      .join("div")
      .attr("class", C.OPTION)
      .classed(C.SELECTED, d => d === this.selected)
      .html(d => COLUMN_LABELS[d])
      .on("click", function (e, d) {
        e.stopPropagation();
        select(this.parentNode).classed(C.OPEN, false);
        callback(d);
      });
  };
}


