import React, { Component } from 'react';
import Panels from './Panels';
import { select } from 'd3-selection';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { // global state
      data: null,
      sortVar: 'idx',
      sortOrder: 'a',
      phenomeUni: false,
      semloUni: true,
      universe: 'semlo'
    };

    this.getData = this.getData.bind(this);
    this.handleSortVar = this.handleSortVar.bind(this);
    this.handleSortOrder = this.handleSortOrder.bind(this);
    this.handlePhenomeUni = this.handlePhenomeUni.bind(this);
    this.handleSemLoUni = this.handleSemLoUni.bind(this);
  }

  getData() {
    //fetch('http://localhost:8888/_'+this.state.sortVar+'_'+this.state.sortOrder+'.json')
    fetch('_'+this.state.sortVar+'_'+this.state.sortOrder+'.json')
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

  handlePhenomeUni() {
    this.setState({ phenomeUni: true, semloUni: false, universe: 'phenome' });
  }

  handleSemLoUni() {
    this.setState({ phenomeUni: false, semloUni: true, universe: 'semlo' });
  }

  componentDidMount() {
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
    const stroke = '#424242'; // dark
    const bkgd = '#dddddd'; // light

    const selectStyle = {
      backgroundColor: bkgd,
      color: stroke
    };

    const phenomeStyle = {
      backgroundColor: this.state.phenomeUni ? stroke : bkgd,
      color: this.state.phenomeUni ? bkgd : stroke
    };

    const semloStyle = {
      backgroundColor: this.state.semloUni ? stroke : bkgd,
      color: this.state.semloUni ? bkgd : stroke
    };

    return (
      <div className='app'>
        <div className='field'>
          <Panels
            data={this.state.data}
            universe={this.state.universe}
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
          <div className='buttonStrip'>
            <button onClick={this.handleSemLoUni} style={semloStyle}>LOCAL</button>
            <button onClick={this.handlePhenomeUni} style={phenomeStyle}>UNIVERSAL</button>
          </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
