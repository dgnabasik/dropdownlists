// Header.js  Use-case 1: read entire [special] table. Use-case: 2 create a new [category]; drag-n-drop list of words form file; insert into [special].
// https://reactscript.com/modern-combo-box-react-bootstrap/    
import React from 'react';
import Select from 'react-select';  
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import { Navbar, Col } from 'react-bootstrap'; 
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Autosuggest from 'react-bootstrap-autosuggest';
import './styles/filedrop.css';
import { components, createFilter } from 'react-windowed-select';
import WindowedSelect from 'react-windowed-select';
import { FileDrop } from 'react-file-drop'; // typescript
import Message from './Message';
import { ApiURl, ProcessError, NavBarStyles, AxiosProxy, bgcPurple, SourceFileDirectory } from './utils'; 
import 'bootstrap/dist/css/bootstrap.css';

const blockSize = 8;
const defaultCategory = {value: 0, label: 'Select a description or drop a text file below...'}; // ]; 
const customFilter = createFilter({ ignoreAccents: false });  // really improves performance
const customComponents = {  // for WindowedSelect
  ClearIndicator: (props) => <components.ClearIndicator {...props}>clear</components.ClearIndicator>
};

/* Not implemented in FileDrop:
          onFrameDragEnter={(event) => console.LOG('onFrameDragEnter', event)}
          onFrameDragLeave={(event) => console.LOG('onFrameDragLeave', event)}
          onFrameDrop={(event) => console.LOG('onFrameDrop', event)}
          onDragOver={(event) => console.LOG('onDragOver', event)}
          onDragLeave={(event) => console.LOG('onDragLeave', event)}
          onDrop={(files, event) => console.LOG('onDrop!', files, event)}
*/

const dataColumns = [
  {
    dataField: 'id',
    hidden: true,
  },
  {
    dataField: 'col1',
    text: 'Col 1',
    sort: false,
    headerStyle: (column, colIndex) => {
      return { width: '100px', textAlign: 'center' };
    },
  },
  {
    dataField: 'col2',
    text: 'Col 2',
    sort: false,
    headerStyle: (column, colIndex) => {
      return { width: '100px', textAlign: 'center' };
    },
  },
  {
    dataField: 'col3',
    text: 'Col 3',
    sort: false,
    headerStyle: (column, colIndex) => {
      return { width: '100px', textAlign: 'center' };
    },
  },
  {
    dataField: 'col4',
    text: 'Col 4',
    sort: false,
    headerStyle: (column, colIndex) => {
      return { width: '100px', textAlign: 'center' };
    },
  },
  {
    dataField: 'col5',
    text: 'Col 5',
    sort: false,
    headerStyle: (column, colIndex) => {
      return { width: '100px', textAlign: 'center' };
    },
  },
  {
    dataField: 'col6',
    text: 'Col 6',
    sort: false,
    headerStyle: (column, colIndex) => {
      return { width: '100px', textAlign: 'center' };
    },
  },
  {
    dataField: 'col7',
    text: 'Col 7',
    sort: false,
    headerStyle: (column, colIndex) => {
      return { width: '100px', textAlign: 'center' };
    },
  },
  {
    dataField: 'col8',
    text: 'Col 8',
    sort: false,
    headerStyle: (column, colIndex) => {
      return { width: '100px', textAlign: 'center' };
    },
  },
];

const defaultSorted = [{
  dataField: 'id',
  order: 'asc'
}];

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {  
      isFetching: false,
      dataList:[],          
      categoryId: 0,
      categoryLookup:[],    // []LookupMap {value:, label: } 
      wordList:[],          // []LookupMap {value:, label: } 
      specialCategory:[],   // LookupMap {value:, label: } from [category].
      selectedCategory: defaultCategory,
      statusMessage: 'Files can be dropped from the directory: ' + SourceFileDirectory,
      description: '',
      selectedFileName: '', 
      // eslint-disable-next-line
      invalidChars: /[-!$#%^&@*()_+|~=`{}\[\]:";'<>?,.\/]/, 
    } // invalidChars needed (?) because text filename is sent as URL parameter.
    this.state = this.initialState;
// Allowed URL chars: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=

    this.postDataAsync = this.postDataAsync.bind(this);
    this.onFileDrop = this.onFileDrop.bind(this);
    this.handleFileList = this.handleFileList.bind(this);
    this.handleWordList = this.handleWordList.bind(this); 
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.onCreateClick = this.onCreateClick.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.fetchCategoryListAsync = this.fetchCategoryListAsync.bind(this);
    this.fetchWordListAsync = this.fetchWordListAsync.bind(this);
    this.fetchFileListAsync = this.fetchFileListAsync.bind(this);
    this.FileDropBox = this.FileDropBox.bind(this);
    this.populateDataList = this.populateDataList.bind(this);

  } // constructor

  // eslint-disable-next-line
  FileDropBox = () => {
    const styles = { border: '1px solid black', width: 300, color: 'black', padding: 20 };
    return (
      <div>
        <div style={styles}>
          <FileDrop onDrop={(files, event) => this.onFileDrop(files, event)} >
            Drop text files of words here, enter a Category description, then click the `Add new list` button.
          </FileDrop>
        </div>
      </div>
    );
  }

  // Read text file from file system. 
  onFileDrop = (files, event) => {   
    this.fetchFileList(files[0].name).then( () => this.handleFileList() ); 
  }

  // convert this.state.wordMap into READONLY this.state.dataList {id, col1, col2, col3, col4, col5, col6, col7, col8 }
  populateDataList() {
    let dataTemp = [];
    let last = this.state.wordMap.length; 
    for (let blockCtr = 0; blockCtr <= Math.floor(this.state.wordMap.length/blockSize); blockCtr++) {
      let ndx = blockCtr * blockSize;
      dataTemp.push( {id:blockCtr, 
        col1: (ndx+0 < last) ? this.state.wordMap[ndx+0].label : '',
        col2: (ndx+1 < last) ? this.state.wordMap[ndx+1].label : '',
        col3: (ndx+2 < last) ? this.state.wordMap[ndx+2].label : '',
        col4: (ndx+3 < last) ? this.state.wordMap[ndx+3].label : '',
        col5: (ndx+4 < last) ? this.state.wordMap[ndx+4].label : '',
        col6: (ndx+5 < last) ? this.state.wordMap[ndx+5].label : '',
        col7: (ndx+6 < last) ? this.state.wordMap[ndx+6].label : '',
        col8: (ndx+7 < last) ? this.state.wordMap[ndx+7].label : '',
        } );
    } // for

    this.setState({ dataList: [...dataTemp] });
  }

  handleFileList = () => {
    if (this.state.wordMap !== 'undefined') {
      const dataSource = (this.state.selectedFileName.length > 0) ? SourceFileDirectory + this.state.selectedFileName : this.state.selectedCategory.label;    
      this.setState({ statusMessage: this.state.wordMap.length + ' items in ' + dataSource});
      this.populateDataList();
    }
  }
v  
  handleWordList = () => {
    if (this.state.wordMap !== 'undefined') {
      const dataSource = (this.state.selectedFileName.length > 0) ? this.state.selectedFileName : this.state.selectedCategory.label;    
      this.setState( {statusMessage: this.state.wordMap.length + ' items in ' + dataSource } );
      this.populateDataList();
    }
  }

  // Save single element as array.
  handleCategoryChange = (categorySelected) => {
    this.setState({ selectedFileName: '', categoryId: categorySelected.value,
      selectedCategory: 
        {
          value: categorySelected.value,
          label: categorySelected.label,
        }
    });
    if (categorySelected.value !== this.state.categoryId) {
      this.fetchWordList(categorySelected.value).then( () => this.handleWordList() ); 
    }
  }

  // Need to test for uniqueness?
  onDescriptionChange = (input) => { 
    this.setState({ description: input });
  }

  onCreateClick = (e) => { 
    e.preventDefault();
    const formData = new FormData();
    formData.append('description', this.state.description);
    formData.append('filename', this.state.selectedFileName);
    const categorySelected = this.postData(formData); // .then()
    this.setState({ statusMessage: this.state.selectedFileName + ' has been saved as: ' + this.state.description });
    this.fetchCategoryList().then( () => this.handleCategoryChange(categorySelected) ); 
  }

  // Have to post using FormData else binding 'user' produces 'no multipart boundary param in Content-Type' error.
  // Assumes valid params.  Invokes listservice.SetWordCategory(CategoryInput{description, filename})
  async postDataAsync(formData) {
    const url = ApiURl() + '/file';
    const axiosHeaders = {
      'Content-Type': 'multipart/form-data',
    };

    try { // returns CategoryTable{id:uint64, description:string, dateupdated date}
      const categoryTable = await axios({
        method: 'post',
        url: url,
        headers: axiosHeaders,
        data: formData,
      });
      return {value: categoryTable.id, label: categoryTable.description};
    } catch(err) {
        ProcessError(err, 'Header.postDataAsync:');
    }
  }
  postData = this.postDataAsync;

  async fetchFileListAsync(filename) {
    if (filename.length === 0) return;    
    const url = ApiURl() + '/file/' + filename; // golang backend prepends file path.
    try {   
      this.setState({isFetching: true});
      const response = await axios.get(url, { AxiosProxy });
      const LookupMap = await response.data.LookupMap;
      this.setState({wordMap: LookupMap, selectedFileName: filename, isFetching: false });

    } catch(err) {
      this.setState({isFetching: false});
      ProcessError(err, 'Header.fetchFileListAsync:');
    }
  }
  fetchFileList = this.fetchFileListAsync;

  // Returns rows of filtered [special]. 
  async fetchWordListAsync(categoryId) {
    const url = ApiURl() + '/list/' + categoryId;  
    try { 
      this.setState({isFetching: true});
      const response = await axios.get(url, { AxiosProxy });
      const LookupMap = await response.data.LookupMap;
      this.setState({wordMap: LookupMap, isFetching: false });
    } catch(err) {
      this.setState({isFetching: false});
      ProcessError(err, 'Header.fetchWordListAsync:');
    }
  }
  fetchWordList = this.fetchWordListAsync;

  // Returns entire contents of [wordcategory]. 
  async fetchCategoryListAsync() {
    const url = ApiURl() + '/list';
    try { 
      this.setState({isFetching: true});
      const response = await axios.get(url, { AxiosProxy });
      const Lookup = await response.data.LookupMap;
      this.setState({categoryLookup: [...Lookup], isFetching: false});
    } catch(err) {
      this.setState({isFetching: false});
      ProcessError(err, 'Header.fetchCategoryListAsync:');
    }
  }
  fetchCategoryList = this.fetchCategoryListAsync;

  componentDidMount() { 
    this.fetchCategoryList();
    const today = new Date();
    console.log(today.toISOString().split('T')[0]);
    
  }

  render() {
    // eslint-disable-next-line
    const { isFetching, categoryId, categoryLookup, wordList, specialCategory, selectedCategory, statusMessage, selectedFileName, description, invalidChars,
    } = this.state;

    return (
      <div>
      <NavBarStyles>
        <Navbar float='center' color='light' fixed='top' expand='lg' bg='info' sticky='top' style={{width: '100vw'}}>
        <Form inline > 
          <Form.Row className='align-items-center' >

            <Col md='auto' >
              <div style={{width: '400px'}}>
              <Select 
                options = {this.state.categoryLookup} 
                placeholder={'Select a category'}
                onChange={(e) => this.handleCategoryChange(e)}
                value={this.state.selectedCategory}
              />
              </div>
            </Col>

            <Col md='auto' >
              { this.state.categoryId > 0 && 
                <div style={{width: '220px'}}>
                <WindowedSelect
                    components={customComponents}
                    isClearable={true}
                    filterOption={customFilter}
                    options={this.state.wordMap}
                    onChange={this.handleWordList}
                    WindowedSelect={this.state.selectedList}
                    isMulti
                    closeMenuOnSelect={false}
                />
                </div>
            }
            </Col>

            <Col md='auto' >
              <div style={{width: '300px'}}>
                <Autosuggest
                  datalist={['test1', 'test2']}
                  placeholder='Category description'
                  onChange={this.onDescriptionChange}
                />
              </div>
            </Col>

          { this.state.selectedFileName.length > 0 && 
            <ButtonToolbar>
              <Button style={{'backgroundColor':bgcPurple}} onClick={ this.onCreateClick }>Add new list</Button>
            </ButtonToolbar> 
          }
          </Form.Row>

          {this.FileDropBox()}

          </Form>
        </Navbar>

        <Message>{this.state.statusMessage}</Message>
      </NavBarStyles> 

      { this.state.dataList.length > 0 &&
        <BootstrapTable
          ref={ n => this.node = n }
          keyField='id'
          data={ this.state.dataList }  
          columns={ dataColumns }
          striped
          hover
          condensed
          bootstrap4
          defaultSorted= { defaultSorted } 
          pagination={ paginationFactory({}) }
          bodyStyle={ {width: '100%', wordBreak: 'break-all' } }
        /> 
      }
      </div>   
    );
  }
}

export default Header;
