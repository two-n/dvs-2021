import { CLASSES as C } from '../../globals/constants';
import { select } from 'd3'
import './style.scss';

export default class DropDown {
  constructor(parent, options, selected, callback, sort = true) {

    this.parent = parent;
    this.selected = selected;
    this.options = options;
    this.callback = callback;
    // sort options alphabetically and bring selected option to front
    if (sort) this.options.sort((a, b) => a == selected ? -1 : b == selected ? 1 : a > b ? 1 : -1);

    this.el = this.parent
      .selectAll(`div.${C.FILTER}`)
      .data([0])
      .join("div")
      .attr("class", C.FILTER)
      .attr("tabindex", 0)

    this.el
      .on("click", function (e) {
        e.stopPropagation();
        const isOpen = select(this).classed(C.OPEN);
        select(this).classed(C.OPEN, !isOpen);
      })
      .on("keydown", function (e) {
        if (e.key === "Enter") {
          e.stopPropagation();
          const isOpen = select(this).classed(C.OPEN);
          select(this).classed(C.OPEN, !isOpen);
        }
      })
      .selectAll(`div.${C.OPTION}`)
      .data(this.options, d => d)
      .join("div")
      .attr("class", C.OPTION)
      .attr("tabindex", 0)
      .classed(C.SELECTED, d => d === this.selected)
      .html(d => d)
      .on("click", function (e, d) {
        e.stopPropagation();
        select(this.parentNode).classed(C.OPEN, false);
        callback(d);
      })
      .on("keydown", function (e, d) {
        if (e.key === "Enter") {
          e.stopPropagation();
          select(this.parentNode).classed(C.OPEN, false);
          callback(d);
        }
      })
  };
}


