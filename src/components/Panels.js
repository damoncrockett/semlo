import React, { Component } from 'react';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { scaleLinear } from 'd3-scale';

const screenW = window.screen.width * window.devicePixelRatio;
const marginInt = Math.round( screenW / 45 );
const margin = {top: marginInt, right: marginInt, bottom: marginInt, left: marginInt};
const plotW = Math.round( screenW * 0.33 );
const plotH = plotW * 5;
const svgW = plotW + margin.left + margin.right;
const svgH = plotH + margin.top + margin.bottom;
const rectW = Math.round( plotW / 5 );
const rectH = rectW * 2;

const pstatusColors = {
  'notp': 'rgba(242,241,239,0.5)', //off white
  'pnotmeasured': 'rgba(108,122,137,0.5)', //blue grey
  'pmeasured': 'rgba(103,128,159,0.5)', //blue
};

class Panels extends Component {
  constructor(props) {
    super(props);

    this.drawSVG = this.drawSVG.bind(this);
    this.drawIcons = this.drawIcons.bind(this);
    this.moveIcons = this.moveIcons.bind(this);
    this.drawText = this.drawText.bind(this);
    this.handleMouseover = this.handleMouseover.bind(this);
    this.handleMouseout = this.handleMouseout.bind(this);
    this.svgNode = React.createRef();
  }

  componentDidMount() {
    this.drawSVG();
  }

  // Probably not how you're supposed to use this function, but it works ---
  // the conditionals are necessary at least for any functions that set state,
  // because state changes always trigger componentDidUpdate
  componentDidUpdate(prevProps, prevState) {
    // conditional prevents infinite loop
    if (prevProps.data === null && prevProps.data !== this.props.data) {
      this.drawIcons();
    }

    if (prevProps.data !== null && prevProps.data !== this.props.data) {
      this.moveIcons();
    }
  }

  drawSVG() {
    const svgNode = this.svgNode.current;

    select(svgNode)
      .selectAll('g.plotCanvas')
      .data([0]) // bc enter selection, prevents appending new 'g' on re-render
      .enter()
      .append('g')
      .attr('class', 'plotCanvas') // purely semantic
      .attr('transform', `translate(${margin.left},${margin.top})`);
    }

  drawIcons() {
    const svgNode = this.svgNode.current;

    // This selection is non-empty only the first time
    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('rect')
      .data(this.props.data)
      .enter()
      .append('rect')
      .attr('id', d => d.mentionType )
      .attr('width', rectW )
      .attr('height', rectH )
      .attr('x', d => d.x * rectW )
      .attr('y', d => d.y * rectH )
      .attr('fill', 'dodgerblue')
      .on('mouseover', this.handleMouseover )
      .on('mouseout', this.handleMouseout )

    }

  moveIcons() {
    const svgNode = this.svgNode.current;
    const transitionSettings = transition().duration(this.props.tduration)

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('rect')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => d.x * rectW )
        .attr('y', d => d.y * rectH )
  }

  drawText() {
    return null
  }

  // note: 'e' here is the mouse event itself, which we don't need
  handleMouseover(e, d) {
    select('#' + d.mentionType )
      .attr('width', rectW * 0.625 )
      .attr('height', rectH * 0.625 )

    }

  handleMouseout(e, d) {
    select('#' + d.mentionType )
      .attr('width', rectW )
      .attr('height', rectH )

    }

  render() {
    return (
      <div>
        <div className='iconPanel'>
          <svg
          ref={this.svgNode}
          width={svgW}
          height={svgH}
          />
        </div>
        <div className='textPanel'>
        </div>
      </div>
    );
  }
}

export default Panels;
