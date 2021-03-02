import React, { Component } from 'react';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { scaleLinear } from 'd3-scale';

const tduration = 3000;
const highlightColor = 'rgba(114,229,239,0.8)';

/* screen width awareness  */
const screenW = window.screen.width * window.devicePixelRatio;
const marginInt = Math.round( screenW / 45 );

const margin = {
  top: marginInt,
  right: marginInt,
  bottom: marginInt,
  left: marginInt
};

/* General code for later
const plotW = Math.round( screenW * 0.33 );
const plotH = plotW * 7;
const svgW = plotW + margin.left + margin.right;
const svgH = plotH + margin.top + margin.bottom;
const rectW = Math.round( plotW / 7 );
const rectH = rectW;
*/

// some hard coded geometry for now
const rectW = 256;
const rectH = 256;
const plotW = 1280;
const plotH = rectW * 34
const svgW = plotW + margin.left + margin.right;
const svgH = plotH + margin.top + margin.bottom;

const pstatusColors = {
  'notp': 'rgba(242,241,239,0.8)', //off white
  'pnotmeasured': 'rgba(108,122,137,0.8)', //blue grey
  'pmeasured': 'rgba(103,128,159,0.8)', //blue
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
      this.moveText();
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
      .attr('id', d => 't' + d.idx )
      .attr('width', rectW )
      .attr('height', rectH )
      .attr('x', d => d.x * ( rectW + 1 ) )
      .attr('y', d => d.y * ( rectH + 1 ) )
      .attr('fill', d => pstatusColors[d.pstatus] )
      .on('mouseover', this.handleMouseover )
      .on('mouseout', this.handleMouseout )
      .on('click', this.drawText )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text')
      .data(this.props.data)
      .enter()
      .append('text')
      .attr('id', d => 't' + d.idx + '_text' )
      .attr('x', d => d.x * ( rectW + 1 ) + 10 )
      .attr('y', d => d.y * ( rectH + 1 ) + 20 )
      .text(d => d.mentionType)

    }

  moveIcons() {
    const svgNode = this.svgNode.current;
    const transitionSettings = transition().duration(tduration)

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('rect')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => d.x * ( rectW + 1 ) )
        .attr('y', d => d.y * ( rectH + 1 ) )
  }

  moveText() {
    const svgNode = this.svgNode.current;
    const transitionSettings = transition().duration(tduration)

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => d.x * ( rectW + 1 ) + 10 )
        .attr('y', d => d.y * ( rectH + 1 ) + 20 )
  }

  drawText(e, d) {
    select('div.textPanel')
      .selectAll('p')
      .remove()

    select('div.textPanel')
      .selectAll('p')
      .data(d['mentions'])
      .enter()
      .append('p')
      .text(d => d)
    }

  // note: 'e' here is the mouse event itself, which we don't need
  handleMouseover(e, d) {
    select('#t' + d.idx )
      .attr('fill', highlightColor )

    }

  handleMouseout(e, d) {
    select('#t' + d.idx )
      .attr('fill', d => pstatusColors[d.pstatus] )

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
        <div className='scrollBox'>
          <div className='textPanel'>
          </div>
        </div>
      </div>
    );
  }
}

export default Panels;
