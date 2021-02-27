import React, { Component } from 'react';
import Panels from './Panels';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { // global state
      data: null,
      sortVar: 'mentionType'
    };

    this.getData = this.getData.bind(this);
    this.handleSortVar = this.handleSortVar.bind(this);
  }

  getData() {
    fetch('http://localhost:8888/'+this.state.sortVar+'.json')
      .then(response => response.json())
      .then(data => this.setState({
        data: data,
      }));
    }

  handleSortVar(e) {
    const clusterNum = e.target.value
    this.setState(state => ({
      sortVar: sortVar
    }));
  }

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps, prevState) {
    // conditional prevents infinite loop from render to cDU
    if (prevState.sortVar !== this.state.sortVar) {
      this.getData();
    }
  }

  render() {
    const bkgd = '#212121';
    const stroke = '#dddddd';

    const selectStyle = {
      backgroundColor: bkgd,
      color: stroke
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
              <option value='mentionType'>brand</option>
              <option value='pstatus'>status</option>
              <option value='manufacturer'>manufacturer</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
