// Script to calculate the total number of hours worked given a list of durations
// as string in format hh::mm-hh:mm, hh:mm-hh:mm, ...
// it should work for n number of times listed and spaces spaces should not break it
// I tested it with "09    :    30 - 11    :   45    ,    13  :   15    -   16  :   30     "
// and it worked fine
// USAGE:     in GoogleSheets use the formula =hoursWorked(time list goes here)
//            times MUST be in 24hr format. Durations that go over 23:59 will not work
//            as of now.
// AUTHOR:    Simon Helleman
// MODIFIED:  May 10, 2021
// HISTORY:   May 5, 2021   ->  Originally Written
//            May 10, 2021  ->  Changed to round to nearest 15 mins
// NOTES:     - I am no JavaScript expert (C/C++ developer) so it was a bit of a wild
//              ride figuring it out

// Count the number of time durations given by the user by using the comma
// deliminator + 1 (2 commas means 3 entries)
// Ex. if the user entered "09:30-11:45, 13:15-16:30, 17:20-18:40"
//     this function would return 3
function getNumTimesInString(str) {
  var numTimes = 1; // Assume at least one entry

  // find comma index and loop until it does not
  // find any more commas (indexOf returns -1 in this case)
  var commaIndex = str.indexOf(',');
  while (commaIndex != -1) {
    numTimes++;
    // Shorten the string until after the comma  counted
    str = str.substring(commaIndex + 1); 
    commaIndex = str.indexOf(','); // repeat
  }

  return numTimes;
}

// Round the minute to the nearest 15 mins (or 0 if its 60 mins)
// Ex. 23 mins rounds to 30 mins
function nearest15Mins(mins) {
  var remainder = mins % 15;

  var nearest15 = 0;

  if (remainder >= 8) {
    nearest15 = mins + (15 - remainder);
  } else {
    nearest15 = mins - remainder;
  }

  return nearest15;
}

// Actual function of inteest (the one called in GoogleSheets)
function hoursWorked(timeStr) {
  var times = []; // array to hold each time duration
  // FORMAT: "hh:mm-hh:mm"

  // Get the number of time durations (see above)
  var numTimes = getNumTimesInString(timeStr);

  // Seperate each time duration and add it to the array
  for (var i = 1; i <= numTimes; i++) {
    if (i != numTimes) {
      // Remove anything from the beginning of the string that is not a digit
      timeStr = timeStr.substring(timeStr.indexOf(timeStr.match(/\d/)));

      // Find the index of the first comma and push the string up to there into the array
      var commaIndex = timeStr.indexOf(',');
      times.push(timeStr.substring(0, commaIndex));
      // Remove the text before the first comma that was just read
      timeStr = timeStr.substring(commaIndex + 1);
    }
    else { // if its the last time, there won't be any commas so the logic is a bit different
      timeStr = timeStr.substring(timeStr.indexOf(timeStr.match(/\d/))); // Remove non digits
      times.push(timeStr);
    }
  }

  var totalTimeWorked = 0.0;

  // Basically same read add remove algorithim as above but this time with : and - as deliminators
  for (var i = 0; i < numTimes; i++) {
    var startHour = parseInt(times[i]);
    times[i] = times[i].substring(times[i].indexOf(':') + 1);
    var startMin = parseInt(times[i]);
    times[i] = times[i].substring(times[i].indexOf('-') + 1);
    
    var endHour = parseInt(times[i]);
    times[i] = times[i].substring(times[i].indexOf(':') + 1);
    var endMin = parseInt(times[i]);
    times[i] = times[i].substring(times[i].indexOf('-') + 1);

    var deltaHour = endHour - startHour;
    var deltaMin = endMin - startMin;

    // Update May 10 -> round to nearest 15 mins
    deltaMin = nearest15Mins(deltaMin);

    totalTimeWorked += deltaHour + (deltaMin / 60);  
  }

  return totalTimeWorked;
}