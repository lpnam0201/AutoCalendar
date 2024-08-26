var _ = LodashGS.load();
var ticksPerMin = 60 * 1000;
var ticksPerHour = 60 * ticksPerMin;
var ticksPerDay = 24 * ticksPerHour;

function main() {
  const beginSearchDate = new Date('2024-08-24T00:00:00');
  const endSearchDate = new Date('2027-08-24T00:00:00');
  let events = createEvents(2, beginSearchDate);

  let calendar = findCalendar("Custom");
  eraseOldEvents(calendar, beginSearchDate, endSearchDate);
  addNewEvents(calendar, events)
}

function eraseOldEvents(calendar, beginDate, endDate) {
  console.log("Erasing old events...Begin");
  const events = calendar.getEvents(beginDate, endDate);
  for (let event of events) {
    if (event.getTag("added_by")) {
      event.deleteEvent();
    }
  }
  
  console.log("Erasing old events...Done");
}

function addNewEvents(calendar, events) {
  
  console.log("Adding new events...Begin");
  for (let event of events) {
    console.log(`Adding ${event.title} from: ${event.startTime} to: ${event.endTime}`);
    let ggEvent = calendar.createEvent(
      event.title,
      event.startTime,
      event.endTime
    );
    ggEvent.setTag("added_by", event.tags[0]);
  }
  
  console.log("Adding new events...Done");
}

function createEvents(beginningWeek, currentDate) {
  const data = loadData();
  const groupedByWeek = _(data)
    .groupBy(x => x.Week)
    .value();

  const calendarEvents = [];


  for (let week = 0; week < 20; week++)
  {
    if (parseInt(week) < beginningWeek) {
      continue;
    }
    
    const weekData = groupedByWeek[week];
    const weekDates = determineNextWeek(currentDate);

    // set currentDate to saturday to advance to next week
    currentDate = weekDates[5];

    if (!weekData) {
      continue;
    }
    
    const groupedByWeekDay = Object.groupBy(weekData, x => x.Weekday);
    for (let weekDay in groupedByWeekDay)
    { 
      const weekDayDate = weekDates
        .find(x => x.getDay() === mapWeekdayToJsWeekDay(weekDay))
      const weekDayData = groupedByWeekDay[weekDay];

      const groupedBySubjectName = Object.groupBy(weekDayData, x => x.SubjectName);
      for (let subjectName in groupedBySubjectName)
      {
        const subjectData = groupedBySubjectName[subjectName];
        const room = subjectData[0].Room;

        const beginPeriod = Math.min(...subjectData.map(o => o.Period));
        const endPeriod = Math.max(...subjectData.map(o => o.Period));

        let calendarEvent = {};
        calendarEvent.startTime = mapPeriodToStartEnd(beginPeriod, weekDayDate).begin;
        calendarEvent.endTime = mapPeriodToStartEnd(endPeriod, weekDayDate).end;

        calendarEvent.title = `${subjectName} - ${room} - week ${week}`;
        calendarEvent.tags = ["auto_tool"];

        calendarEvents.push(calendarEvent);
      }
    }

    // set currentDate to saturday to advance to next week
    currentDate = weekDates[5];
  }

  return calendarEvents;
}

function mapWeekdayToJsWeekDay(weekDay) {
  switch (weekDay) {
    case "Thứ Hai":
      return 1;
    case "Thứ Ba":
      return 2;
    case "Thứ Tư":
      return 3;
    case "Thứ Năm":
      return 4;
    case "Thứ Sáu":
      return 5;
    case "Thứ Bảy":
      return 6;
  }

  return null;
}

function mapPeriodToStartEnd(period, weekDayDate) {
  const minPerPeriod = 50;
  const ticksPerPeriod = minPerPeriod * ticksPerMin;
  const weekDayDateAt0 = createDateInstance(weekDayDate);

  let periodBeginEnd = {};
  // Morning
  let beginTicks = null;
  let endTicks = null;
  let firstPeriodTicks = null;
  let offset = null;
  if (period <= 5) {
    firstPeriodTicks = ticksPerHour * 7;
    offset = period - 1;
  // After noon
  } else {
    firstPeriodTicks = ticksPerHour * 13;
    offset = period - 1 - 7 + 1; // 7th period is the first
  }

  let offsetTicks = ticksPerPeriod * offset;
  beginTicks = weekDayDateAt0.getTime() + firstPeriodTicks + offsetTicks
  endTicks = weekDayDateAt0.getTime() + firstPeriodTicks + offsetTicks + ticksPerPeriod;

  // if it's the final period => add 15min break
  if (period === 5 || period === 11) {
    endTicks += ticksPerMin * 15;
  }

  periodBeginEnd.begin = new Date(beginTicks)
  periodBeginEnd.end = new Date(endTicks);

  return periodBeginEnd;
}

function createDateInstance(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function findCalendar(calendarName) {
  calendar = CalendarApp.getAllCalendars();
  return calendar.find(x => x.getName() === calendarName);
}

// Find next Sunday, then +6 to find next whole week
function determineNextWeek(currentDate) {
  const currentDateAt0 = createDateInstance(currentDate);
  const currentWeekDay = currentDateAt0.getDay();
  // Sunday is first day of the week
  const offsetToSunday = currentWeekDay - 0;
  const oneWeekFromCurrentDayTick = currentDateAt0.getTime() + ticksPerDay * 7;
  const nextSundayTick = oneWeekFromCurrentDayTick - ticksPerDay * offsetToSunday;

  const nextWeek = [];
  for (let i = 1; i <= 6; i++) {
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
