import React, { Component } from 'react';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';

const tduration = 1200;
const highlightColor = 'rgba(114,229,239,0.8)';

/* screen width awareness  */
//const screenW = window.screen.width * window.devicePixelRatio;

const innerW = window.innerWidth
console.log(window.innerWidth);
const marginInt = innerW * 0.1;

const margin = {
  top: marginInt,
  right: 0,
  bottom: 0,
  left: 0
};

// (rectW + pad) * 5 ~ 2/3 of innerW or less
const pad = innerW * 0.0067;
const rectW = innerW * 0.65 / 5 - pad;
const rectH = rectW;

const plotW = (rectW + pad) * 5;
const plotH = (rectW + pad) * 30;
const svgW = plotW + margin.left + margin.right;
const svgH = plotH + margin.top + margin.bottom;


const pstatusColors = {
  'notp': 'rgba(242,241,239,0.8)', //off white
  'pnotmeasured': 'rgba(108,122,137,0.8)', //blue grey
  'pmeasured': 'rgba(103,128,159,0.8)', //blue
};

const pstatusTextColors = {
  'notp': '#424242',
  'pnotmeasured': 'white',
  'pmeasured': 'white',
};

class Panels extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickID: null
    }

    this.drawSVG = this.drawSVG.bind(this);
    this.drawIcons = this.drawIcons.bind(this);
    this.moveIcons = this.moveIcons.bind(this);
    this.drawMentions = this.drawMentions.bind(this);
    this.scrollToActive = this.scrollToActive.bind(this);
    this.mentionBoxMouseover = this.mentionBoxMouseover.bind(this);
    this.mentionBoxMouseout = this.mentionBoxMouseout.bind(this);
    this.handleMouseover = this.handleMouseover.bind(this);
    this.handleMouseout = this.handleMouseout.bind(this);
    this.formatCitation = this.formatCitation.bind(this);
    this.polygonPoints = this.polygonPoints.bind(this);
    this.svgNode = React.createRef();
  }

  componentDidMount() {
    this.drawSVG();
  }

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

    // inject shadow filter for svg rects
    select(svgNode)
      .selectAll('filter#shadow')
      .data([0]) // bc enter selection, prevents appending new 'pattern' on re-render
      .enter()
      .append('filter')
      .attr('id', 'shadow')

    select(svgNode)
      .select('filter#shadow')
      .selectAll('feDropShadow')
      .data([0]) // bc enter selection, prevents appending new 'pattern' on re-render
      .enter()
      .append('feDropShadow')
      .attr('dx', '3.0')
      .attr('dy', '3.0')
      .attr('stdDeviation', '1.0')
      .attr('flood-color', 'rgba(0, 0, 0, 0.15)')

    select(svgNode)
      .selectAll('filter#shadowhover')
      .data([0]) // bc enter selection, prevents appending new 'pattern' on re-render
      .enter()
      .append('filter')
      .attr('id', 'shadowhover')

    select(svgNode)
      .select('filter#shadowhover')
      .selectAll('feDropShadow')
      .data([0]) // bc enter selection, prevents appending new 'pattern' on re-render
      .enter()
      .append('feDropShadow')
      .attr('dx', '12.0')
      .attr('dy', '12.0')
      .attr('stdDeviation', '1.0')
      .attr('flood-color', 'rgba(0, 0, 0, 0.15)')
    }

  polygonPoints(d) {
    const x = d.x * ( rectW + pad );
    const y = d.y * ( rectW + pad );

    const p1x = x + rectW / 2;
    const p1y = y + rectW * 0.3;
    const p2x = x + rectW * 0.3;
    const p2y = y + rectH / 2;
    const p3x = x + rectW / 2;
    const p3y = y + rectH - rectW * 0.3;
    const p4x = x + rectW - rectW * 0.3;
    const p4y = y + rectH / 2;

    const s = p1x.toString()+','+p1y.toString()+' '+p2x.toString()+','+p2y.toString()+' '+p3x.toString()+','+p3y.toString()+' '+p4x.toString()+','+p4y.toString();

    return s
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
      .attr('id', d => 't' + d.idx + '_rect' )
      .attr('width', rectW )
      .attr('height', rectH )
      .attr('x', d => d.x * ( rectW + pad ) )
      .attr('y', d => d.y * ( rectH + pad ) )
      .attr('fill', d => pstatusColors[d.pstatus] )
      .attr('stroke', 'none' )
      .attr('filter', 'url(#shadow)')
      .on('mouseover', this.handleMouseover )
      .on('mouseout', this.handleMouseout )
      .on('click', this.drawMentions )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.man')
      .data(this.props.data)
      .enter()
      .append('text')
      .attr('class', 'man')
      .attr('id', d => 't' + d.idx + '_man' )
      .attr('x', d => d.x * ( rectW + pad ) + rectW * 0.04 )
      .attr('y', d => d.y * ( rectH + pad ) + rectW * 0.12 )
      .text(d => d.Manufacturer)
      .attr('font-weight', 'bold')
      .attr('font-size', '16px')
      .attr('fill', d => pstatusTextColors[d.pstatus])

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.bran')
      .data(this.props.data)
      .enter()
      .append('text')
      .attr('class', 'bran')
      .attr('id', d => 't' + d.idx + '_bran' )
      .attr('x', d => d.x * ( rectW + pad ) + rectW * 0.04 )
      .attr('y', d => d.y * ( rectH + pad ) + rectW * 0.2 )
      .text(d => d.Brand)
      .attr('fill', d => pstatusTextColors[d.pstatus])

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.surf')
      .data(this.props.data)
      .enter()
      .append('text')
      .attr('class', 'surf')
      .attr('id', d => 't' + d.idx + '_surf' )
      .attr('x', d => d.x * ( rectW + pad ) + rectW * 0.04 )
      .attr('y', d => d.y * ( rectH + pad ) + rectW * 0.27 )
      .text(d => d.surfaceLetter)
      .attr('fill', d => pstatusTextColors[d.pstatus])

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.badge')
      .data(this.props.data)
      .enter()
      .append('text')
      .attr('class', 'badge')
      .attr('id', d => 't' + d.idx + '_badge' )
      .attr('x', d => d.x * ( rectW + pad ) + rectW * 0.82 )
      .attr('y', d => d.y * ( rectH + pad ) + rectW * 0.2 )
      .text(d => d.surfaceBadge ? "√" : '')
      .attr('fill', d => pstatusTextColors[d.pstatus])
      .attr('font-weight', 'bold')
      .attr('font-size', '36px')

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.freqticks')
      .data(this.props.data)
      .enter()
      .append('text')
      .attr('class', 'freqticks')
      .attr('id', d => 't' + d.idx + '_freqticks' )
      .attr('x', d => d.x * ( rectW + pad ) + rectW * 0.04 )
      .attr('y', d => d.y * ( rectH + pad ) + rectH - rectW * 0.06 )
      .text(d => '| '.repeat(d.numMentions))
      .attr('fill', d => pstatusTextColors[d.pstatus])
      .attr('font-size', '12px')

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('line.xaxis')
      .data(this.props.data)
      .enter()
      .append('line')
      .attr('class', 'xaxis')
      .attr('id', d => 't' + d.idx + '_xaxis' )
      .attr('x1', d => d.x * ( rectW + pad ) + rectW / 2 )
      .attr('y1', d => d.y * ( rectH + pad ) + rectW * 0.2 )
      .attr('x2', d => d.x * ( rectW + pad ) + rectW / 2 )
      .attr('y2', d => d.y * ( rectH + pad ) + rectH - rectW * 0.2 )
      .attr('stroke', d => pstatusTextColors[d.pstatus])

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('line.yaxis')
      .data(this.props.data)
      .enter()
      .append('line')
      .attr('class', 'yaxis')
      .attr('id', d => 't' + d.idx + '_yaxis' )
      .attr('x1', d => d.x * ( rectW + pad ) + rectW * 0.2 )
      .attr('y1', d => d.y * ( rectH + pad ) + rectH / 2 )
      .attr('x2', d => d.x * ( rectW + pad ) + rectW - rectW * 0.2 )
      .attr('y2', d => d.y * ( rectH + pad ) + rectH / 2 )
      .attr('stroke', d => pstatusTextColors[d.pstatus])

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('polygon.glyph')
      .data(this.props.data)
      .enter()
      .append('polygon')
      .attr('class', 'glyph')
      .attr('id', d => 't' + d.idx + '_glyph' )
      .attr('points', d => this.polygonPoints(d))
      .attr('stroke', d => pstatusTextColors[d.pstatus])
      .attr('fill', "none")

    }

  moveIcons() {
    const svgNode = this.svgNode.current;
    const transitionSettings = transition().duration(tduration)

    // you have to reset IDs but I'm not exactly sure why
    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('rect')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => d.x * ( rectW + pad ) )
        .attr('y', d => d.y * ( rectH + pad ) )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.man')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => d.x * ( rectW + pad ) + rectW * 0.04 )
        .attr('y', d => d.y * ( rectH + pad ) + rectW * 0.12 )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.bran')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => d.x * ( rectW + pad ) + rectW * 0.04 )
        .attr('y', d => d.y * ( rectH + pad ) + rectW * 0.2 )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.surf')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => d.x * ( rectW + pad ) + rectW * 0.04 )
        .attr('y', d => d.y * ( rectH + pad ) + rectW * 0.27 )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.badge')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => d.x * ( rectW + pad ) + rectW * 0.82 )
        .attr('y', d => d.y * ( rectH + pad ) + rectW * 0.2 )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.freqticks')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => d.x * ( rectW + pad ) + rectW * 0.04 )
        .attr('y', d => d.y * ( rectH + pad ) + rectH - rectW * 0.06 )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('line.xaxis')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x1', d => d.x * ( rectW + pad ) + rectW / 2 )
        .attr('y1', d => d.y * ( rectH + pad ) + rectW * 0.2 )
        .attr('x2', d => d.x * ( rectW + pad ) + rectW / 2 )
        .attr('y2', d => d.y * ( rectH + pad ) + rectH - rectW * 0.2 )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('line.yaxis')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x1', d => d.x * ( rectW + pad ) + rectW * 0.2 )
        .attr('y1', d => d.y * ( rectH + pad ) + rectH / 2 )
        .attr('x2', d => d.x * ( rectW + pad ) + rectW - rectW * 0.2 )
        .attr('y2', d => d.y * ( rectH + pad ) + rectH / 2 )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('polygon.glyph')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('points', d => this.polygonPoints(d))
  }

  formatCitation(s) {
    const l = s.split(" ");

    return "<b><i>"+l[0]+" "+l[1]+"</b></i>"+" "+l.slice(2).join(" ")
  }

  scrollToActive() {
    const x = select('#t' + this.state.clickID + '_rect').attr('x');
    const y = select('#t' + this.state.clickID + '_rect').attr('y');
    window.scrollTo(x,y);
  }

  // because pure html, cannot use 'attr'
  mentionBoxMouseover(e, d) {
    select('#activeGlyph')
      //.style('color', 'white')
      .style('border-color', 'white')
    }

  // because pure html, cannot use 'attr'
  mentionBoxMouseout(e, d) {
    select('#activeGlyph')
      //.style('color', '#424242')
      .style('border-color', '#424242')
    }

  drawMentions(e, d) {
    // removes previous mention box
    select('div.controlPanel')
      .select('#activeGlyph')
      .remove()

    // mention box
    select('div.controlPanel')
      .append('p')
      .attr('class', 'activeGlyph')
      .attr('id', 'activeGlyph')
      .text(d.Manufacturer + " " + d.Brand + " " + d.surfaceLetter )
      .on('mouseover', this.mentionBoxMouseover)
      .on('mouseout', this.mentionBoxMouseout)
      .on('click', this.scrollToActive)

    select('#t' + this.state.clickID + '_rect')
      .attr('fill', d => pstatusColors[d.pstatus])

    this.setState({ clickID: d.idx }, function () {
      select('#t' + this.state.clickID + '_rect')
        .attr('fill', highlightColor)
    })

    // removes previous mentions if any
    select('div.textPanel')
      .selectAll('div')
      .remove()

    // Is there a cleaner way?
    select('div.textPanel')
      .selectAll('div')
      .data(d['mentions'])
      .enter()
      .append('div')
      .html(d => "<a href=" + d.imgurl +" target='_blank' rel='noopener noreferrer'" +  ">" + "<p>" + "“" + d.words + "”" + "<br/><br/>" + this.formatCitation(d.citation) + "</p></a>")
    }

  // note: 'e' here is the mouse event itself, which we don't need
  handleMouseover(e, d) {
    select('#t' + d.idx + '_rect' )
      .attr('filter', 'url(#shadowhover)')
    }

  handleMouseout(e, d) {
    select('#t' + d.idx + '_rect' )
      .attr('filter', 'url(#shadow)')
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
