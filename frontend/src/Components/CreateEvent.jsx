import React from 'react'
import Button from './AtomicComponents/Button'
import '../styles/CreateEvent.css'

function CreateEvent() {
  return (
    <div className='form'>
      <label>Title</label>
      <input type="text" />
      <label>Description</label>
      <input type="text" />
      <label>Participants</label>
      <input type="text" />
      <label>Date</label>
      <input type="text" />
      <Button name="Create Event"/>
    </div>
  )
}

export default CreateEvent
