function aprilsFoolTime(currentDate) {
    var aprilsFoolStart = new Date(2024, 4, 1);
    var aprilsFoolEnd = new Date(2024, 4, 2);
    if(aprilsFoolStart <= currentDate && currentDate <= aprilsFoolEnd) {
      // current date is within range
      console.log('true')
      alert('April\'s Fool: True')
    } else {
      // current date is out of range
      console.log('false')
      alert('April\'s Fool: False')
    }
  }
  
  aprilsFoolTime(new Date()); // now
  aprilsFoolTime(new Date(2024, 4, 1)); // within range