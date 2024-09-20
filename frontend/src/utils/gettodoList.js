function getTodoList(date) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based, so January is 0
  const day = date.getDate();

  switch (true) {
    case year === 2024 && month === 8 && day === 10:
      return [
        { time: '10:30 am', title: 'Meeting' },
        { time: '12:00 pm', title: 'Lunch' }
      ];
    case year === 2024 && month === 8 && day === 15:
      return [
        { time: '09:30 pm', title: 'Software Introduction Meeting' },
        { time: '12:30 pm', title: 'Client entertaining' },
        { time: '02:00 pm', title: 'Product design discussion' },
        { time: '05:00 pm', title: 'Product test and acceptance' },
        { time: '06:30 pm', title: 'Reporting' },
        { time: '10:00 pm', title: 'Going home to walk the dog' }
      ];
    default:
      return [];
  }
}

export { getTodoList };
  