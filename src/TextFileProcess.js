// TextFileProcess.js  server-side read of text file from file system.
import React from 'react';
import axios from 'axios';
import { ApiURl, ProcessError, AxiosProxy } from './utils'; 

// this.props.FILEPATH, this.props.parentCallback=handleFileList()
class TextFileProcess extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        isFetching: false,
        wordMap: [], // LookupMap=[{ value: 0, label: 'Foo' }] 
    };
    this.handleFileList = this.handleFileList.bind(this);
    this.fetchFileListAsync = this.fetchFileListAsync.bind(this);
  }

  async fetchFileListAsync() {
    if (this.props.FILEPATH.length === 0) return;    
    const url = ApiURl() + '/file/' + this.props.FILEPATH;
    console.log('TextFileProcess.fetchFileListAsync: ' + url);//<<<
    try { 
      this.setState({isFetching: true});
      const response = await axios.get(url, { AxiosProxy });
      const LookupMap = await response.data.LookupMap;
      console.log(LookupMap.length);//<<<
      this.setState({wordMap: LookupMap, isFetching: false });

    } catch(err) {
      this.setState({isFetching: false});
      ProcessError(err, 'TextFileProcess.fetchFileListAsync:');
    }
  }
  fetchFileList = this.fetchFileListAsync;

  handleFileList() {
    console.log('TextFileProcess.handleFileList');//<<<
    this.props.parentCallback(this.state.wordMap);
  }
    
  // Runs AFTER the first render. 
  componentDidMount() {  
    console.log('TextFileProcess.componentDidMount');//<<<
    this.fetchFileList().then( () => this.handleFileList() ); 
  }

  render() {
    // eslint-disable-next-line
    const { wordMap } = this.state;

    return (
      <div>
      </div>
    );
  }
}

export default TextFileProcess;
