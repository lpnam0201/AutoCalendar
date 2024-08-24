function createEvents() {
  const data = loadData();
  const groupedByWeek = Object.groupBy(data, x => x.Week);

  for (let week in groupedByWeek)
  {
    const weekData = groupedByWeek[week];

    const groupedByWeekDay = Object.groupBy(weekData, x => x.WeekDay);
    for (let weekDay in groupedByWeekDay)
    {

    }
    
  }
  
  const currentWeek = 2;
  //const fi

  console.log(determineNextWeek(new Date()));
}

function findCalendar(calendarName) {
  calendar = CalendarApp.getAllCalendars();
  return calendar.find(x => x.getName() === calendarName);
}

// Find next Sunday, then +5 to find next whole week
function determineNextWeek(currentDate) {
  const currentDateAt0 = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const currentWeekDay = currentDateAt0.getDay();
  // Sunday is first day of the week
  const offsetToSunday = currentWeekDay - 0;

  const ticksPerDay = 24 * 60 * 60 * 1000;
  const oneWeekFromCurrentDayTick = currentDateAt0.getTime() + ticksPerDay * 7;
  const nextSundayTick = oneWeekFromCurrentDayTick - ticksPerDay * offsetToSunday;
  //const nextSundayDate = new Date(nextSundayTick);

  const nextWeek = [];
  for (let i = 1; i <=5; i++) {
    const date = new Date(nextSundayTick + i * ticksPerDay);
    nextWeek.push(date);
  }

  return nextWeek;
}

function loadData() {
  const jsonString = HtmlService.createHtmlOutputFromFile("data.json.html").getContent();
  const jsonObject = JSON.parse(jsonString);

  return jsonObject;
}
