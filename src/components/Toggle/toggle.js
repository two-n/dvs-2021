import { CLASSES as C, TEXT } from '../../globals/constants';
import './style.scss';

export default class Toggle {
  constructor(parent, options, selected, onToggle) {
    this.parent = parent;
    this.options = options
    this.selected = selected; // 0 or 1 (corresponding to label index and T/F)
    this.onToggle = onToggle;
    this.el = this.parent
      .append('div')
      .attr('class', C.TOGGLE)

    this.options = this.el.selectAll(`div.${C.OPTION}`)
      .data(options)
      .join('div')
      .attr('class', C.OPTION)
      .classed(C.SELECTED, (d) => d.val === this.selected)
      .text((d) => TEXT.TOGGLE[d.text])
      .on('click', (e, d) => this.handleToggle(d.val));

    this.switch = this.el.append('label').attr('class', 'switch');

    this.input = this.switch.append('input')
      .attr('type', 'checkbox')
      .on('change', (e) => this.handleToggle(e.target.checked));

    this.switch.append('span').attr('class', 'slider');
  }

  /** can be called from either input or from option
   * if called from OPTION, gets an index value as 'selected' parameter
   * if called from INPUT, recieves the value from the checkbox.checked property
  */
  handleToggle(selected = null) {
    this.options.classed(C.SELECTED, (d) => d.val === selected);
    this.input.property('checked', selected);
    this.onToggle(selected);
  }
}

