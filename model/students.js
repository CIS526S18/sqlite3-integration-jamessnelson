/* load dependencies */
const fs = require('fs');
const sqlite3 = require('sqlite3');

const escapeHTML = require('../helpers/escape-html');
const studentController = require('./controller/students');

// Create database
var db = new sqlite3.Database('./data/roster.sqlite3');

// TODO: Add a removeStudent function

/** @module model/students
  * The student model
  */
module.exports = {
  getStudents: getStudents,
  addStudent: addStudent
};

/* Load sync files into a global variable
 * This serves as an in-memory cache for speedy access.
 */
//var students = JSON.parse(fs.readFileSync("data/students.json", {encoding: 'utf-8'}));


/** @function getStudents
  * Provides a list of students
  * @return {Array} array of student objects
  */
function getStudents(callback) {
  // Clone and return the student object
  //return JSON.parse(JSON.stringify(students));
  return db.all("SELECT * FROM students", function(err, rows){
    callback(err, rows);
  });
}

/** @function addStudent
  * Add a new student to the list
  * Callback parameters are (error)
  * @param {Object} student - the student to add
  * @param {function} callback - a callback function to call
  * when this operation finishes
  */
function addStudent(student, callback) {
  // Escape any html in the student object
  var sanitizedStudent = {
    name: escapeHTML(student.name),
    eid: escapeHTML(student.eid),
    description: escapeHTML(student.description)
  }
  // TODO: validate the student object

  // Add the student to the in-memory cache
  students.push(sanitizedStudent);
  // Save the cache to persistent storage (our JSON file)
  //fs.writeFile('data/students.json', JSON.stringify(students), 'utf-8', function(err) {
    // If there was an error writing the student
    // to persistent storage, pass it along
    /*if(err) return callback(err);
    // Otherwise, trigger our callback with a clone of the student
    callback(false, JSON.parse(JSON.stringify(sanitizedStudent)))
  }); */

  db.run("INSERT INTO students (name, eid, descrition) VALUES ("
    + sanitizedStudent.name + "`,``"
    + sanitizedStudent.eid + "`,`"
    + sanitizedStudent.descrition +
    ")");
}
