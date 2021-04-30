import React, { Component } from 'react';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { scaleLinear, scaleQuantile } from 'd3-scale';
import { ticks } from 'd3-array'
import flattenDeep from 'lodash/flattenDeep';
import { uniq } from 'lodash';

const tduration = 1200;
const highlightColor = 'rgba(114,229,239,0.8)';
const circleColor = 'rgba(255,255,255,0.25)';
const circleStroke = 'none';
const circleHighlight = 'none';
const circleHighlightStroke = 'rgba(254, 129, 94, 1.0)';

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
//const plotH = (rectW + pad) * 30;
const plotH = (rectW + pad) * 6;
const svgW = plotW + margin.left + margin.right;
const svgH = plotH + margin.top + margin.bottom;
const dotSize = 7;

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

// paper universes

const pColorMax = 28.08;
const pColorMin = -3.1;
const pTextureMax = 180.27250309159484;
const pTextureMin = -3.9971336306021867;
const pThicknessMax = 0.459375;
const pThicknessMin = 0.062375;
const pGlossMax = 141.71197509765625;
const pGlossMin = 0.28917333483695984;

// SemLo universe after 1945-1965 filtering
//const sColorMax = 18.41;
const sColorMax = 15.45;
const sColorMin = -1.69;
//const sTextureMax = 15.103586592116208;
const sTextureMax = 9.171872622172028;
const sTextureMin = -3.8666978117214135;
const sThicknessMax = 0.459375;
const sThicknessMin = 0.13044444444444445;
//const sGlossMax = 141.71197509765625;
const sGlossMax = 114.32791137695312;
const sGlossMin = 0.5542057752609253;

const pColorScale = scaleLinear().domain([pColorMin,pColorMax]).range([0,rectW * 0.3]);
const pTextureScale = scaleLinear().domain([pTextureMin,pTextureMax]).range([0,rectW * 0.3]);
const pThicknessScale = scaleLinear().domain([pThicknessMin,pThicknessMax]).range([0,rectW * 0.3]);
const pGlossScale = scaleLinear().domain([pGlossMin,pGlossMax]).range([0,rectW * 0.3]);

const sColorScale = scaleLinear().domain([sColorMin,sColorMax]).range([0,rectW * 0.3]);
const sTextureScale = scaleLinear().domain([sTextureMin,sTextureMax]).range([0,rectW * 0.3]);
const sThicknessScale = scaleLinear().domain([sThicknessMin,sThicknessMax]).range([0,rectW * 0.3]);
const sGlossScale = scaleLinear().domain([sGlossMin,sGlossMax]).range([0,rectW * 0.3]);

const pColorScaleQ = scaleLinear().domain([0,100]).range([0,rectW * 0.3]);
const pTextureScaleQ = scaleLinear().domain([0,100]).range([0,rectW * 0.3]);
const pThicknessScaleQ = scaleLinear().domain([0,100]).range([0,rectW * 0.3]);
const pGlossScaleQ = scaleLinear().domain([0,100]).range([0,rectW * 0.3]);

const sColorScaleQ = scaleLinear().domain([0,100]).range([0,rectW * 0.3]);
const sTextureScaleQ = scaleLinear().domain([0,100]).range([0,rectW * 0.3]);
const sThicknessScaleQ = scaleLinear().domain([0,100]).range([0,rectW * 0.3]);
const sGlossScaleQ = scaleLinear().domain([0,100]).range([0,rectW * 0.3]);

class Panels extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickIDs: [] // push to this array whatever is clicked
    }

    this.drawSVG = this.drawSVG.bind(this);
    this.drawIcons = this.drawIcons.bind(this);
    this.moveIcons = this.moveIcons.bind(this);
    this.highlightIcons = this.highlightIcons.bind(this);
    this.highlightFill = this.highlightFill.bind(this);
    this.highlightStroke = this.highlightStroke.bind(this);
    this.drawMentions = this.drawMentions.bind(this);
    this.handleMouseover = this.handleMouseover.bind(this);
    this.handleMouseout = this.handleMouseout.bind(this);
    this.dotMouseover = this.dotMouseover.bind(this);
    this.dotMouseout = this.dotMouseout.bind(this);
    this.formatCitation = this.formatCitation.bind(this);
    this.zeroPoint = this.zeroPoint.bind(this);
    this.glyphOrigin = this.glyphOrigin.bind(this);
    this.colorScale = this.colorScale.bind(this);
    this.textureScale = this.textureScale.bind(this);
    this.thicknessScale = this.thicknessScale.bind(this);
    this.glossScale = this.glossScale.bind(this);
    this.jitter = this.jitter.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    //this.polygonPoints = this.polygonPoints.bind(this);
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

    if (prevProps.universe !== this.props.universe) {
      this.moveIcons();
    }

    if (prevProps.dotScale !== this.props.dotScale) {
      this.moveIcons();
    }

    if (prevProps.jitter !== this.props.jitter) {
      this.moveIcons();
    }

    if (prevProps.designationHighlight !== this.props.designationHighlight) {
      this.highlightIcons();
    }

    if (prevProps.designationString !== this.props.designationString) {
      this.highlightIcons();
    }

    if (prevProps.submittedSearch !== this.props.submittedSearch) {
      this.handleSearch();
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

/*
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
*/

  // a fudge here that will break if rectW !== rectH
  zeroPoint(coord) {
    return coord * ( rectW + pad )
  }

  glyphOrigin(coord) {
    return this.zeroPoint(coord) + rectW / 2
  }

  jitter(coord) {
    if (this.props.jitter===false) {
      return this.glyphOrigin(coord)
    } else if (this.props.jitter===true) {
      return this.glyphOrigin(coord) + Math.random() * ( Math.round( Math.random() ) ? 1 : -1 ) * pad
    }
  }

  colorScale(d) {
    if (this.props.universe==='semlo') {
      if (this.props.dotScale==='linear') {
        return sColorScale(d.val)
      } else if (this.props.dotScale==='quantile') {
        return sColorScaleQ(d.valqs)
      }
    } else if (this.props.universe==='phenome') {
      if (this.props.dotScale==='linear') {
        return pColorScale(d.val)
      } else if (this.props.dotScale==='quantile') {
        return pColorScaleQ(d.valqp)
      }
    }
  }

  textureScale(d) {
    if (this.props.universe==='semlo') {
      if (this.props.dotScale==='linear') {
        return sTextureScale(d.val)
      } else if (this.props.dotScale==='quantile') {
        return sTextureScaleQ(d.valqs)
      }
    } else if (this.props.universe==='phenome') {
      if (this.props.dotScale==='linear') {
        return pTextureScale(d.val)
      } else if (this.props.dotScale==='quantile') {
        return pTextureScaleQ(d.valqp)
      }
    }
  }

  thicknessScale(d) {
    if (this.props.universe==='semlo') {
      if (this.props.dotScale==='linear') {
        return sThicknessScale(d.val)
      } else if (this.props.dotScale==='quantile') {
        return sThicknessScaleQ(d.valqs)
      }
    } else if (this.props.universe==='phenome') {
      if (this.props.dotScale==='linear') {
        return pThicknessScale(d.val)
      } else if (this.props.dotScale==='quantile') {
        return pThicknessScaleQ(d.valqp)
      }
    }
  }

  glossScale(d) {
    if (this.props.universe==='semlo') {
      if (this.props.dotScale==='linear') {
        return sGlossScale(d.val)
      } else if (this.props.dotScale==='quantile') {
        return sGlossScaleQ(d.valqs)
      }
    } else if (this.props.universe==='phenome') {
      if (this.props.dotScale==='linear') {
        return pGlossScale(d.val)
      } else if (this.props.dotScale==='quantile') {
        return pGlossScaleQ(d.valqp)
      }
    }
  }

  dotMouseover(e, d) {

    const dotType = e.target.className.baseVal;

    select('div.controlPanel')
      .append('p')
      .attr('id', 'detail')
      .attr('class', 'detail')
      .text(d.val.toFixed(3) + " " + dotType + " | " + d.colorword + " · " + d.glossword + " · " + d.textureword + " · " + d.weightword + " · " + d.year )

  }

  dotMouseout(e, d) {

    select('div.controlPanel')
      .select('#detail')
      .remove()

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
      .attr('x', d => this.zeroPoint(d.x) )
      .attr('y', d => this.zeroPoint(d.y) )
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
      .attr('x', d => this.zeroPoint(d.x) + rectW * 0.04 )
      .attr('y', d => this.zeroPoint(d.y) + rectW * 0.12 )
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
      .attr('x', d => this.zeroPoint(d.x) + rectW * 0.04 )
      .attr('y', d => this.zeroPoint(d.y) + rectW * 0.2 )
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
      .attr('x', d => this.zeroPoint(d.x) + rectW * 0.04 )
      .attr('y', d => this.zeroPoint(d.y) + rectW * 0.27 )
      .text(d => d.surfaceLetter)
      .attr('fill', d => pstatusTextColors[d.pstatus])

/*
    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.badge')
      .data(this.props.data)
      .enter()
      .append('text')
      .attr('class', 'badge')
      .attr('id', d => 't' + d.idx + '_badge' )
      .attr('x', d => this.zeroPoint(d.x) + rectW * 0.82 )
      .attr('y', d => this.zeroPoint(d.y) + rectW * 0.2 )
      .text(d => d.surfaceBadge ? "√" : '')
      .attr('fill', d => pstatusTextColors[d.pstatus])
      .attr('font-weight', 'bold')
      .attr('font-size', '36px')
*/
    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.freqticks')
      .data(this.props.data)
      .enter()
      .append('text')
      .attr('class', 'freqticks')
      .attr('id', d => 't' + d.idx + '_freqticks' )
      .attr('x', d => this.zeroPoint(d.x) + rectW * 0.04 )
      .attr('y', d => this.zeroPoint(d.y) + rectH - rectW * 0.06 )
      .text(d => '| '.repeat(d.numMentions))
      .attr('fill', d => pstatusTextColors[d.pstatus])
      .attr('font-size', '12px')

    const pmeasured = this.props.data.filter(d => d.pstatus === 'pmeasured');

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('line.yaxis')
      .data(pmeasured)
      .enter()
      .append('line')
      .attr('class', 'yaxis')
      .attr('id', d => 't' + d.idx + '_yaxis' )
      .attr('x1', d => this.glyphOrigin(d.x) )
      .attr('y1', d => this.zeroPoint(d.y) + rectH * 0.2 )
      .attr('x2', d => this.glyphOrigin(d.x) )
      .attr('y2', d => this.zeroPoint(d.y) + rectH - rectH * 0.2 )
      .attr('stroke', d => pstatusTextColors[d.pstatus])

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('line.xaxis')
      .data(pmeasured)
      .enter()
      .append('line')
      .attr('class', 'xaxis')
      .attr('id', d => 't' + d.idx + '_xaxis' )
      .attr('x1', d => this.zeroPoint(d.x) + rectW * 0.2 )
      .attr('y1', d => this.glyphOrigin(d.y) )
      .attr('x2', d => this.zeroPoint(d.x) + rectW - rectW * 0.2 )
      .attr('y2', d => this.glyphOrigin(d.y) )
      .attr('stroke', d => pstatusTextColors[d.pstatus])

    let colorPoints = this.props.data.filter(d => d.color !== "");
    colorPoints = colorPoints.map(d => d.color);
    colorPoints = flattenDeep(colorPoints);

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('circle.colorPoint')
      .data(colorPoints)
      .enter()
      .append('circle')
      .attr('class', 'colorPoint')
      .attr('id', d => '_' + d.pm + '_colorPoint')
      .attr('stroke','none')
      .attr('fill', circleColor)
      .attr('cx', d => this.jitter(d.x)  )
      .attr('cy', d => this.glyphOrigin(d.y) - this.colorScale(d) )
      .attr('r', dotSize)
      .on('mouseover', this.dotMouseover)
      .on('mouseout', this.dotMouseout)

    let texturePoints = this.props.data.filter(d => d.texture !== "");
    texturePoints = texturePoints.map(d => d.texture);
    texturePoints = flattenDeep(texturePoints);

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('circle.texturePoint')
      .data(texturePoints)
      .enter()
      .append('circle')
      .attr('class', 'texturePoint')
      .attr('id', d => '_' + d.pm + '_texturePoint')
      .attr('stroke','none')
      .attr('fill', circleColor)
      .attr('cx', d => this.jitter(d.x) )
      .attr('cy', d => this.glyphOrigin(d.y) + this.textureScale(d) )
      .attr('r', dotSize)
      .on('mouseover', this.dotMouseover)
      .on('mouseout', this.dotMouseout)

    let thicknessPoints = this.props.data.filter(d => d.thickness !== "");
    thicknessPoints = thicknessPoints.map(d => d.thickness);
    thicknessPoints = flattenDeep(thicknessPoints);

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('circle.thicknessPoint')
      .data(thicknessPoints)
      .enter()
      .append('circle')
      .attr('class', 'thicknessPoint')
      .attr('id', d => '_' + d.pm + '_thicknessPoint')
      .attr('stroke','none')
      .attr('fill', circleColor)
      .attr('cx', d => this.glyphOrigin(d.x) - this.thicknessScale(d) )
      .attr('cy', d => this.jitter(d.y) )
      .attr('r', dotSize)
      .on('mouseover', this.dotMouseover)
      .on('mouseout', this.dotMouseout)

    let glossPoints = this.props.data.filter(d => d.gloss !== "");
    glossPoints = glossPoints.map(d => d.gloss);
    glossPoints = flattenDeep(glossPoints);

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('circle.glossPoint')
      .data(glossPoints)
      .enter()
      .append('circle')
      .attr('class', 'glossPoint')
      .attr('id', d => '_' + d.pm + '_glossPoint')
      .attr('stroke','none')
      .attr('fill', circleColor)
      .attr('cx', d => this.glyphOrigin(d.x) + this.glossScale(d) )
      .attr('cy', d => this.jitter(d.y) )
      .attr('r', dotSize)
      .on('mouseover', this.dotMouseover)
      .on('mouseout', this.dotMouseout)

/*
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
*/


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
        .attr('x', d => this.zeroPoint(d.x) )
        .attr('y', d => this.zeroPoint(d.y) )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.man')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => this.zeroPoint(d.x) + rectW * 0.04 )
        .attr('y', d => this.zeroPoint(d.y) + rectW * 0.12 )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.bran')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => this.zeroPoint(d.x) + rectW * 0.04 )
        .attr('y', d => this.zeroPoint(d.y) + rectW * 0.2 )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.surf')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => this.zeroPoint(d.x) + rectW * 0.04 )
        .attr('y', d => this.zeroPoint(d.y) + rectW * 0.27 )
/*
    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.badge')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => this.zeroPoint(d.x) + rectW * 0.82 )
        .attr('y', d => this.zeroPoint(d.y) + rectW * 0.2 )
*/
    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('text.freqticks')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('x', d => this.zeroPoint(d.x) + rectW * 0.04 )
        .attr('y', d => this.zeroPoint(d.y) + rectH - rectW * 0.06 )

    const pmeasured = this.props.data.filter(d => d.pstatus === 'pmeasured');

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('line.yaxis')
      .data(pmeasured)
      .transition(transitionSettings)
        .attr('x1', d => this.glyphOrigin(d.x) )
        .attr('y1', d => this.zeroPoint(d.y) + rectH * 0.2 )
        .attr('x2', d => this.glyphOrigin(d.x) )
        .attr('y2', d => this.zeroPoint(d.y) + rectH - rectH * 0.2 )

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('line.xaxis')
      .data(pmeasured)
      .transition(transitionSettings)
        .attr('x1', d => this.zeroPoint(d.x) + rectW * 0.2 )
        .attr('y1', d => this.glyphOrigin(d.y) )
        .attr('x2', d => this.zeroPoint(d.x) + rectW - rectW * 0.2 )
        .attr('y2', d => this.glyphOrigin(d.y) )

/*
    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('polygon.glyph')
      .data(this.props.data)
      .transition(transitionSettings)
        .attr('points', d => this.polygonPoints(d))

*/
    let colorPoints = this.props.data.filter(d => d.color !== "");
    colorPoints = colorPoints.map(d => d.color);
    colorPoints = flattenDeep(colorPoints);

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('circle.colorPoint')
      .data(colorPoints)
      .transition(transitionSettings)
        .attr('cx', d => this.jitter(d.x) )
        .attr('cy', d => this.glyphOrigin(d.y) - this.colorScale(d) )

    let texturePoints = this.props.data.filter(d => d.texture !== "");
    texturePoints = texturePoints.map(d => d.texture);
    texturePoints = flattenDeep(texturePoints);

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('circle.texturePoint')
      .data(texturePoints)
      .transition(transitionSettings)
        .attr('cx', d => this.jitter(d.x) )
        .attr('cy', d => this.glyphOrigin(d.y) + this.textureScale(d) )

    let thicknessPoints = this.props.data.filter(d => d.thickness !== "");
    thicknessPoints = thicknessPoints.map(d => d.thickness);
    thicknessPoints = flattenDeep(thicknessPoints);

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('circle.thicknessPoint')
      .data(thicknessPoints)
      .transition(transitionSettings)
        .attr('cx', d => this.glyphOrigin(d.x) - this.thicknessScale(d) )
        .attr('cy', d => this.jitter(d.y) )


    let glossPoints = this.props.data.filter(d => d.gloss !== "");
    glossPoints = glossPoints.map(d => d.gloss);
    glossPoints = flattenDeep(glossPoints);

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('circle.glossPoint')
      .data(glossPoints)
      .transition(transitionSettings)
        .attr('cx', d => this.glyphOrigin(d.x) + this.glossScale(d) )
        .attr('cy', d => this.jitter(d.y) )

  }

  highlightFill(d) {
    if (this.props.designationHighlight===false) {
      return circleColor
    } else if (this.props.designationHighlight==true) {
      if (d.colorword===this.props.designationString || d.glossword===this.props.designationString || d.textureword===this.props.designationString || d.weightword===this.props.designationString ) {
        return circleHighlight
      } else {
        return circleColor
      }
    }
  }

  highlightStroke(d) {
    if (this.props.designationHighlight===false) {
      return circleStroke
    } else if (this.props.designationHighlight==true) {
      if (d.colorword===this.props.designationString || d.glossword===this.props.designationString || d.textureword===this.props.designationString || d.weightword===this.props.designationString ) {
        return circleHighlightStroke
      } else {
        return circleStroke
      }
    }
  }

  highlightIcons() {

    const svgNode = this.svgNode.current;

    let colorPoints = this.props.data.filter(d => d.color !== "");
    colorPoints = colorPoints.map(d => d.color);
    colorPoints = flattenDeep(colorPoints);

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('circle.colorPoint')
      .data(colorPoints)
      .attr('fill', d => this.highlightFill(d) )
      .attr('stroke', d => this.highlightStroke(d) )

    let texturePoints = this.props.data.filter(d => d.texture !== "");
    texturePoints = texturePoints.map(d => d.texture);
    texturePoints = flattenDeep(texturePoints);

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('circle.texturePoint')
      .data(texturePoints)
      .attr('fill', d => this.highlightFill(d) )
      .attr('stroke', d => this.highlightStroke(d) )

    let thicknessPoints = this.props.data.filter(d => d.thickness !== "");
    thicknessPoints = thicknessPoints.map(d => d.thickness);
    thicknessPoints = flattenDeep(thicknessPoints);

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('circle.thicknessPoint')
      .data(thicknessPoints)
      .attr('fill', d => this.highlightFill(d) )
      .attr('stroke', d => this.highlightStroke(d) )

    let glossPoints = this.props.data.filter(d => d.gloss !== "");
    glossPoints = glossPoints.map(d => d.gloss);
    glossPoints = flattenDeep(glossPoints);

    select(svgNode)
      .select('g.plotCanvas')
      .selectAll('circle.glossPoint')
      .data(glossPoints)
      .attr('fill', d => this.highlightFill(d) )
      .attr('stroke', d => this.highlightStroke(d) )

  }

  formatCitation(s) {
    const l = s.split(" ");

    return "<b><i>"+l[0]+" "+l[1]+"</b></i>"+" "+l.slice(2).join(" ")
  }

  handleSearch() {
    // removes everything in the text panel
    select('div.textPanel')
      .selectAll('p')
      .remove()

    const clickedData = this.props.data.filter(d => this.state.clickIDs.includes(d.idx));

    // resets clicked (highlighted) rects to normal color
    clickedData.forEach((item, i) => {
      select('#t' + item.idx + '_rect')
        .attr('fill', pstatusColors[item.pstatus])
    });

    // actual text search
    const searchedMentions = this.props.mentionsAsUnits.filter(d => d.words.includes(this.props.submittedSearch));
    const searchIDs = uniq(searchedMentions.map(d => d.idx));

    // reset clickIDs to the unique idxs in the search results
    this.setState({ clickIDs: searchIDs })

    // filter main data file by searchIDs
    const searchedData = this.props.data.filter(d => searchIDs.includes(d.idx));

    // highlight the rects and draw the activeGlyphs
    searchedData.forEach((item, i) => {
      select('#t' + item.idx + '_rect')
        .attr('fill', highlightColor)

      // mention box
      select('div.textPanel')
        .append('p')
        .attr('class', 'activeGlyph')
        .attr('id', 't' + item.idx + '_activeGlyph')
        .text(item.Manufacturer + " " + item.Brand + " " + item.surfaceLetter )
        .on('click', function() {
          const x = select('#t' + item.idx + '_rect').attr('x');
          const y = select('#t' + item.idx + '_rect').attr('y');
          window.scrollTo(x,y);
        })

      select('div.textPanel')
        .select('#t' + item.idx + '_activeGlyph')
        .selectAll('div')
        .data(searchedMentions.filter(d => d.idx === item.idx))
        .enter()
        .append('div')
        .html(d => "<a href=" + d.imgurl +" target='_blank' rel='noopener noreferrer'" +  ">" + "<p>" + "“" + d.words + "”" + "<br/><br/>" + this.formatCitation(d.citation) + "</p></a>")
    });
  }

  drawMentions(e, d) {

    const clickedData = this.props.data.filter(d => this.state.clickIDs.includes(d.idx) );

    if ( this.props.multiclick===false ) {

      // removes everything in the text panel
      select('div.textPanel')
        .selectAll('p')
        .remove()

      // resets highlighted rect colors to normal
      clickedData.forEach((item, i) => {
        select('#t' + item.idx + '_rect')
          .attr('fill', pstatusColors[item.pstatus])
      });

      // reset clickIDs to be only this idx
      this.setState({ clickIDs: [d.idx] })

      // highlight the rect we are clicking
      select('#t' + d.idx + '_rect')
        .attr('fill', highlightColor)

      // mention box
      select('div.textPanel')
        .append('p')
        .attr('class', 'activeGlyph')
        .attr('id', 't' + d.idx + '_activeGlyph')
        .text(d.Manufacturer + " " + d.Brand + " " + d.surfaceLetter )
        .on('click', function() {
          const x = select('#t' + d.idx + '_rect').attr('x');
          const y = select('#t' + d.idx + '_rect').attr('y');
          window.scrollTo(x,y);
        })

      // drawing the mentions themselves
      select('div.textPanel')
        .select('#t' + d.idx + '_activeGlyph')
        .selectAll('div')
        .data(d['mentions'])
        .enter()
        .append('div')
        .html(d => "<a href=" + d.imgurl +" target='_blank' rel='noopener noreferrer'" +  ">" + "<p>" + "“" + d.words + "”" + "<br/><br/>" + this.formatCitation(d.citation) + "</p></a>")

    } else if ( this.props.multiclick===true ) {

        // if the idx of the rect you're clicking is already clicked, un-click it
        if ( this.state.clickIDs.includes(d.idx) ) {
          select('#t' + d.idx + '_rect')
            .attr('fill', pstatusColors[d.pstatus])

          select('div.textPanel')
            .select('#t' + d.idx + '_activeGlyph')
            .remove()

          // we remove this d.idx from clickIDs list
          this.setState(state => ({
            clickIDs: this.state.clickIDs.filter(item => item !== d.idx)
          }))

        } else { // if it's not clicked, click it

            this.setState(state => ({
              clickIDs: [...this.state.clickIDs, d.idx]
            }))

            select('#t' + d.idx + '_rect')
              .attr('fill', highlightColor)

            // mention box
            select('div.textPanel')
              .append('p')
              .attr('class', 'activeGlyph')
              .attr('id', 't' + d.idx + '_activeGlyph')
              .text(d.Manufacturer + " " + d.Brand + " " + d.surfaceLetter )
              .on('click', function() {
                const x = select('#t' + d.idx + '_rect').attr('x');
                const y = select('#t' + d.idx + '_rect').attr('y');
                window.scrollTo(x,y);
              })

            // drawing the mentions themselves
            select('div.textPanel')
              .select('#t' + d.idx + '_activeGlyph')
              .selectAll('div')
              .data(d['mentions'])
              .enter()
              .append('div')
              .html(d => "<a href=" + d.imgurl +" target='_blank' rel='noopener noreferrer'" +  ">" + "<p>" + "“" + d.words + "”" + "<br/><br/>" + this.formatCitation(d.citation) + "</p></a>")

        }
      }
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
