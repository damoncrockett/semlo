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
      universe: 'semlo',
      linear: true,
      quantile: false,
      dotScale: 'linear',
      jitter: false,
      designations: [''], // a hack to get around rendering with null value
      mentionsAsUnits: [''], // a hack to get around rendering with null value
      designationString: 'White',
      designationHighlight: false,
      multiclick: false,
      searchTerm: '',
      submittedSearch: ''
    };

    this.getData = this.getData.bind(this);
    this.getDesignations = this.getDesignations.bind(this);
    this.getMentionsAsUnits = this.getMentionsAsUnits.bind(this);
    this.handleDesignationHighlight = this.handleDesignationHighlight.bind(this);
    this.handleDesignationString = this.handleDesignationString.bind(this);
    this.handleSortVar = this.handleSortVar.bind(this);
    this.handleSortOrder = this.handleSortOrder.bind(this);
    this.handlePhenomeUni = this.handlePhenomeUni.bind(this);
    this.handleSemLoUni = this.handleSemLoUni.bind(this);
    this.handleLinear = this.handleLinear.bind(this);
    this.handleQuantile = this.handleQuantile.bind(this);
    this.handleJitter = this.handleJitter.bind(this);
    this.handleMulticlick = this.handleMulticlick.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.submitSearch = this.submitSearch.bind(this);
  }

  getData() {
    //fetch('http://localhost:8888/_'+this.state.sortVar+'_'+this.state.sortOrder+'.json')
    fetch('_'+this.state.sortVar+'_'+this.state.sortOrder+'.json')
      .then(response => response.json())
      .then(data => this.setState({ data: data }))
    }

  getDesignations() {
    //fetch('http://localhost:8888/__designations.json')
    fetch('__designations.json')
      .then(response => response.json())
      .then(data => this.setState({
        designations: data
      }));
  }

  getMentionsAsUnits() {
    //fetch('http://localhost:8888/__mentionsAsUnits.json')
    fetch('__mentionsAsUnits.json')
      .then(response => response.json())
      .then(data => this.setState({
        mentionsAsUnits: data
      }));
  }

  // need functional setState here because new state depends on old
  handleDesignationHighlight() {
    this.setState(state => ({
      designationHighlight: !this.state.designationHighlight
    }));
  }

  handleDesignationString(e) {
    this.setState({ designationString: e.target.value });
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

  handleLinear() {
    this.setState({ linear: true, quantile: false, dotScale: 'linear' });
  }

  handleQuantile() {
    this.setState({ linear: false, quantile: true, dotScale: 'quantile' });
  }

  handleJitter() {
    this.setState(state => ({
      jitter: !this.state.jitter
    }));
  }

  handleMulticlick() {
    this.setState(state => ({
      multiclick: !this.state.multiclick
    }));
  }

  handleSearch(event) {
    this.setState({ searchTerm: event.target.value });
  }

  submitSearch(event) {
    event.preventDefault();
    this.setState({ submittedSearch: this.state.searchTerm });

    // not strictly necessary, but nice for user to start in multiclick after searching
    this.setState({ multiclick: true });
  }

  componentDidMount() {
    this.getData();
    this.getDesignations();
    this.getMentionsAsUnits();
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

    const designationHighlightStyle = {
      backgroundColor: this.state.designationHighlight ? stroke : bkgd,
      color: this.state.designationHighlight ? bkgd : stroke
    };

    const phenomeStyle = {
      backgroundColor: this.state.phenomeUni ? stroke : bkgd,
      color: this.state.phenomeUni ? bkgd : stroke
    };

    const semloStyle = {
      backgroundColor: this.state.semloUni ? stroke : bkgd,
      color: this.state.semloUni ? bkgd : stroke
    };

    const linearStyle = {
      backgroundColor: this.state.linear ? stroke : bkgd,
      color: this.state.linear ? bkgd : stroke
    };

    const quantileStyle = {
      backgroundColor: this.state.quantile ? stroke : bkgd,
      color: this.state.quantile ? bkgd : stroke
    };

    const jitterStyle = {
      backgroundColor: this.state.jitter ? stroke : bkgd,
      color: this.state.jitter ? bkgd : stroke
    };

    const multiclickStyle = {
      backgroundColor: this.state.multiclick ? stroke : bkgd,
      color: this.state.multiclick ? bkgd : stroke
    };

    const designations = this.state.designations;

    return (
      <div className='app'>
        <div className='field'>
          <Panels
            data={this.state.data}
            universe={this.state.universe}
            dotScale={this.state.dotScale}
            jitter={this.state.jitter}
            designationString={this.state.designationString}
            designationHighlight={this.state.designationHighlight}
            multiclick={this.state.multiclick}
            submittedSearch={this.state.submittedSearch}
            mentionsAsUnits={this.state.mentionsAsUnits}
          />
        </div>
        <div className='controlPanel'>
          <div className='buttonStrip'>
            <select style={selectStyle} value={this.state.sortVar} onChange={this.handleSortVar}>
              <option value='idx'>Index</option>
              <option value='numMentions'>Frequency</option>
              <option value='surfaceName'>Surface Name</option>
              <option value='meanThickness'>Average Thickness</option>
              <option value='meanColor'>Average Color</option>
              <option value='meanGloss'>Average Gloss</option>
              <option value='meanTexture'>Average Texture</option>
              <option value='expressiveness'>Expressiveness</option>

            </select>
            <div className='radSwitch' style={selectStyle} onChange={this.handleSortOrder}>
              <input type="radio" value="a" name="Sort Order" checked={this.state.sortOrder==='a'}/> ascending
              <input type="radio" value="d" name="Sort Order" checked={this.state.sortOrder==='d'}/> descending
            </div>
          </div>
          <div className='buttonStrip'>
            <button onClick={this.handleSemLoUni} style={semloStyle}>LOCAL</button>
            <button onClick={this.handlePhenomeUni} style={phenomeStyle}>UNIVERSAL</button>
          </div>
          <div className='buttonStrip'>
            <button onClick={this.handleLinear} style={linearStyle}>LINEAR</button>
            <button onClick={this.handleQuantile} style={quantileStyle}>RANKED</button>
          </div>
          <div className='buttonStrip'>
            <button onClick={this.handleJitter} style={jitterStyle}>JITTER</button>
          </div>
          <div className='buttonStrip'>
            <select style={selectStyle} value={this.state.designationString} onChange={this.handleDesignationString}>
              {designations.map( (d, i) => {return <option value={d.word} key={i}>{d.word + ' ' + d.freq}</option>} )}
            </select>
            <button onClick={this.handleDesignationHighlight} style={designationHighlightStyle}>HIGHLIGHT</button>
          </div>
          <div className='buttonStrip'>
            <button onClick={this.handleMulticlick} style={multiclickStyle}>MULTICLICK</button>
          </div>
          <div className='buttonStrip'>
            <form onSubmit={this.submitSearch}>
             <input type="text" value={this.state.searchTerm} onChange={this.handleSearch} className="searchField"/>
             <input type="submit" value="SEARCH" className="searchSubmit"/>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
