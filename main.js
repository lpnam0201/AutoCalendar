var _ = LodashGS.load();
var ticksPerMin = 60 * 1000;
var ticksPerHour = 60 * ticksPerMin;
var ticksPerDay = 24 * ticksPerHour;

function main() {
  let events = createEvents(2, new Date('2024-08-24T00:00:00'));
}

function createEvents(beginningWeek, currentDate) {
  const data = loadData();
  const groupedByWeek = _(data)
    .groupBy(x => x.Week)
    .toPairs()
    .sortBy(x => x[0]) // key
    .map(x => x[1]) // value
    .value();

  const calendarEvents = [];

  for (let week in groupedByWeek)
  {
    if (parseInt(week) < beginningWeek) {
      continue;
    }

    const weekDates = determineNextWeek(currentDate);
    const weekData = groupedByWeek[week];

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
        const beginPeriod = Math.min(...subjectData.map(o => o.Period));
        const endPeriod = Math.max(...subjectData.map(o => o.Period));

        let calendarEvent = {};
        calendarEvent.startTime = mapPeriodToStartEnd(beginPeriod, weekDayDate).begin;
        calendarEvent.endTime = mapPeriodToStartEnd(endPeriod, weekDayDate).end;
        calendarEvent.title = subjectName;
        calendarEvent.tags = ["auto_tool"];

        calendarEvent.push(calendarEvent);
      }
    }
    
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

  const periodBeginEnd = {};
  // Morning
  const beginTicks = null;
  const endTicks = null;
  const firstPeriodTicks = null;
  if (period <= 5) {
    firstPeriodTicks = ticksPerHour * 7;

  // After noon
  } else {
    firstPeriodTicks = ticksPerHour * 13;
    
  }

  beginTicks = weekDayDateAt0.getTime() + firstPeriodTicks + ticksPerHour + period - 1;
  endTicks = weekDayDateAt0.getTime() + firstPeriodTicks + beginTicks + ticksPerPeriod;

  periodBeginEnd.begin = new Date(beginTicks)
  periodBeginEnd.end = new Date(endTicks);

  return period;
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
