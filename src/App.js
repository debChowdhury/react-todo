import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Puff } from  'react-loader-spinner'
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

function App() {
  //declaring all states and their setters
  const [listItems, setListItems] = useState([]);
  const [listItemsData, setListItemsData] = useState([]);
  const [todoToAdd, setTodoToAdd] = useState("");
  const [todoToUpdateObj, setTodoToUpdateObj] = useState({});
  const [show, setShow] = useState(false);
  const [showLoader, setShowLoader] = useState('none');

  //function to close update modal
  const handleClose = () => setShow(false);
  
  //function to show update modal
  const updateClick = (event) => {
    let updateObj = JSON.parse(event.target.value);
    setTodoToUpdateObj(updateObj);
    setShow(true);
  }

  //update DOM list when list items data is changed
  React.useEffect(() => {
    const mlistItems = listItemsData.map(data =>
      <tr key={data.id}>
        <td>{data.title}</td>
        <td>{data.completed? 'Completed':'Not completed'}</td>
        <td><Button variant="primary" value={JSON.stringify(data)} onClick={updateClick} >Update</Button></td>
        <td><Button variant="danger" value={JSON.stringify(data)} onClick={deleteClick} >Delete</Button></td>
      </tr>
    );
    setListItems(mlistItems);
  }, [listItemsData]); 

  //function to delete a row from the list
  const deleteClick = (event) => {
    if (window.confirm("Are you sure?") === false) {
      return;
    } 
    let deleteObj = JSON.parse(event.target.value);
    setShowLoader('');

    //dummy method for deletion
    fetch('https://jsonplaceholder.typicode.com/todos?id='+deleteObj.id, {
      method: 'DELETE',
    })
    .then(() => {
      const filteredmListItems = listItemsData.filter((item) => item.id !== deleteObj.id);
      setListItemsData(filteredmListItems);
      setShowLoader('none');
    });
  }

  //first time loading of list data
  useEffect(() => {
    setShowLoader('');

    //dummy api for fetching todos according to userId
    fetch('https://jsonplaceholder.typicode.com/todos?userId=1')
      .then((response) => response.json())
      .then((datas) => {
        //setting list items data
        setListItemsData(datas);
        setShowLoader('none');
      });
  }, []);

  //function to update a row from the list
  const handleUpdate = () => {

    //dummy update call
    setShowLoader('');
    setShow(false);
    fetch('https://jsonplaceholder.typicode.com/?userId=1', {
      method: 'PUT',
      body: JSON.stringify(todoToUpdateObj),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then(() => {
        let mListItemsData = listItemsData;
        for(let i = 0; i < mListItemsData.length; i += 1) {
          if(mListItemsData[i].id === todoToUpdateObj.id) {
            mListItemsData[i] = todoToUpdateObj;
            break;
          }
        }
        setTodoToUpdateObj({});
        setShowLoader('none');
        setListItemsData([...mListItemsData]);
      })
  }

  //function to set todo object for addition
  const handleChange = (event) => {
    setTodoToAdd(event.target.value);
  }

  //function for updating title state
  const setUpdateTitleFunc = (event) => {
    setTodoToUpdateObj(prevState => {
      return { ...prevState, title: event.target.value }
    });
    
  }

  //function for updating status state
  const setUpdateStatusFunc = (event) => {
    setTodoToUpdateObj(prevState => {
      return { ...prevState, completed: (event.target.value === "true")? true : false }
    });
  }

  //function to add a todo row
  const handleSubmit = (event) => {
    event.preventDefault();
    if(todoToAdd.length === 0){
      alert("Please enter a todo title");
      return;
    }
    setShowLoader('');

    //dummy create api call
    fetch('https://jsonplaceholder.typicode.com/todos', {
      method: 'POST',
      body: JSON.stringify({
        title: todoToAdd,
        completed: false,
        userId: 1,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    .then((response) => response.json())
    .then((data) => {
      //added row id will be a random number between 100 and 10000
      data.id = Math.floor((Math.random() * 10000) + 100);
      setListItemsData([...listItemsData, data]);
      setTodoToAdd("");
      setShowLoader('none');
    });
  }
  
  return (
    <>
      <div className="overlay" style={{display:showLoader}}>
        <div className="d-flex justify-content-center">  
        {/* loader */}
          <Puff
            height="80"
            width="80"
            radisu={1}
            color="#4fa94d"
            ariaLabel="puff-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
        />
        </div>
      </div>
      {/* Update modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>TODO update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Update form */}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>TODO title</Form.Label>
              {/* update title form */}
                <Form.Control
                  as="textarea"
                  value={todoToUpdateObj.title} 
                  onChange={setUpdateTitleFunc}
                  style={{ height: '100px' }}
                />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Update status</Form.Label>
              {/* update status form */}
              <Form.Select value={todoToUpdateObj.completed} onChange={setUpdateStatusFunc}>
                <option value={true}>Completed</option>
                <option value={false}>Not completed</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {/* close and save update modal form buttons */}
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* table for listing todo list */}
      <Table bordered hover responsive style={{textAlign:'center'}}>
        <thead>
          <tr>
            <th>TODO title</th>
            <th colSpan={3}>Completion status</th>
          </tr>
        </thead>
        <tbody>
          {listItems}
        </tbody>
      </Table>
      {/* Form for adding a todo row */}
      <Form onSubmit={handleSubmit} style={{ width:'400px' }}>
        <Row className="align-items-center">
          <Col xs="auto">
            <FloatingLabel
              controlId="floatingInput"
              label="Enter todo title"
              className="mb-3">
              {/* add todo title */}
              <Form.Control
                value={todoToAdd} 
                onChange={handleChange}
                placeholder="Enter todo title"
              />
            </FloatingLabel>
          </Col>
          <Col xs="auto">
            <Form.Group className="mb-3">
              <Button variant="primary" type="submit">Add</Button>
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default App;
