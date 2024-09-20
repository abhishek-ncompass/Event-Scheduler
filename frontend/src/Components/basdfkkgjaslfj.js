function renderCell(date) {
  console.log(events)
  const list = events.filter(event => {
    const eventStartDate = event.start.toDateString();
    const eventEndDate = event.end.toDateString();
    const selectedDate = date.toDateString();
    return selectedDate >= eventStartDate && selectedDate <= eventEndDate;
  });
  const displayList = list.filter((item, index) => index < 2);
  if (list.length) {
    const moreCount = list.length - displayList.length;
    const moreItem = (
      <li>
        <Whisper
          placement="top"
          trigger="click"
          speaker={
            <Popover>
              {list.map((item, index) => (
                <p key={index}>
                  <b>{item.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</b> - {item.title}
                </p>
              ))}
            </Popover>
          }
        >
          <a >{moreCount} more</a>
        </Whisper>
      </li>
    );

    
    return (
      <ul className="calendar-todo-list">
        {displayList.map((item, index) => (
          <li key={index}>
            <Badge /> <b>{item.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</b> - {item.title}
          </li>
        ))}
        {moreCount ? moreItem : null}
      </ul>
    );
  }
  return null;
}