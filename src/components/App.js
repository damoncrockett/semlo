import React, { Component } from 'react';
import Panels from './Panels';
import { select } from 'd3-selection';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { // global state
      data: null,
      sortVar: 'idx',
      sortOrder: 'a'
    };

    this.drawTitle = this.drawTitle.bind(this);
    this.getData = this.getData.bind(this);
    this.handleSortVar = this.handleSortVar.bind(this);
    this.handleSortOrder = this.handleSortOrder.bind(this);
  }

  drawTitle() {
    select('body')
      .append('title')
      .text('the Semantic Loading of Photographic Papers')
  }

  getData() {
    fetch('http://localhost:8888/_'+this.state.sortVar+'_'+this.state.sortOrder+'.json')
      .then(response => response.json())
      .then(data => this.setState({ data: data }))
    }

  handleSortVar(e) {
    const sortVar = e.target.value
    this.setState(state => ({
      sortVar: sortVar
    }));
  }

  handleSortOrder(e) {
    const sortOrder = e.target.value
    this.setState(state => ({
      sortOrder: sortOrder
    }));
  }

  componentDidMount() {
    this.drawTitle();
    this.getData();
  }

  componentDidUpdate(prevProps, prevState) {
    // conditional prevents infinite loop from render to cDU
    if (prevState.sortVar !== this.state.sortVar) {
      this.getData();
    }
    if (prevState.sortOrder !== this.state.sortOrder) {
      this.getData();
    }
  }

  render() {
    const bkgd = '#212121';
    const stroke = '#dddddd';

    const selectStyle = {
      backgroundColor: stroke,
      color: bkgd
    };

    return (
      <div className='app'>
        <div className='field'>
          <Panels
            data={this.state.data}
          />
        </div>
        <div className='controlPanel'>
          <div className='buttonStrip'>
            <select style={selectStyle} value={this.state.sortVar} onChange={this.handleSortVar}>
              <option value='idx'>Index</option>
              <option value='mentionType'>Brand</option>
              <option value='numMentions'>Frequency</option>
              <option value='pstatus'>Status</option>
              <option value='surfaceBadge'>Surface Badge</option>
              <option value='surfaceName'>Surface Name</option>
            </select>
            <div className='radSwitch' style={selectStyle} onChange={this.handleSortOrder}>
              <input type="radio" value="a" name="Sort Order" checked={this.state.sortOrder==='a'}/> ascending
              <input type="radio" value="d" name="Sort Order" checked={this.state.sortOrder==='d'}/> descending
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
