const Course = require("../models/Course");
const Resource = require("../models/Resource");
const AcademicEvent = require("../models/AcademicEvent");

const courses = [
  {
    title: "Data Structures & Algorithms",
    courseCode: "CS201",
    description:
      "Advanced data structures including trees, graphs, heaps, and algorithm analysis techniques.",
  },
  {
    title: "Operating Systems",
    courseCode: "CS301",
    description:
      "Design and implementation of operating systems: process management, memory management, and file systems.",
  },
  {
    title: "Database Management Systems",
    courseCode: "CS304",
    description:
      "Relational database concepts, SQL, normalization, and transaction management.",
  },
  {
    title: "Computer Networks",
    courseCode: "CS306",
    description:
      "Network layers, protocols, TCP/IP, and network security fundamentals.",
  },
  {
    title: "Artificial Intelligence",
    courseCode: "CS401",
    description:
      "Introduction to AI, problem solving, knowledge representation, and machine learning basics.",
  },
];

const seed = async (facultyUser) => {
  console.log("Seeding Academic Courses...");
  for (const c of courses) {
    const exists = await Course.findOne({ courseCode: c.courseCode });
    let courseId;

    if (!exists) {
      const course = await Course.create({
        ...c,
        faculty: facultyUser._id,
      });
      courseId = course._id;
      console.log(`Created Course: ${c.title}`);
    } else {
      courseId = exists._id;
      console.log(`Skipped (Exists): ${c.title}`);
    }

    // Add dummy resource if course exists
    if (courseId) {
      const resExists = await Resource.findOne({
        title: `Syllabus - ${c.courseCode}`,
      });
      if (!resExists) {
        await Resource.create({
          title: `Syllabus - ${c.courseCode}`,
          description: "Course syllabus and grading policy.",
          fileUrl: "https://example.com/syllabus.pdf",
          course: courseId,
          type: "Document",
          uploadedBy: facultyUser._id,
        });
      }

      // Seed Academic Events
      const eventExists = await AcademicEvent.findOne({
        course: courseId,
        title: `Midterm Exam - ${c.courseCode}`,
      });
      if (!eventExists) {
        // Midterm Exam (2 weeks from now)
        await AcademicEvent.create({
          title: `Midterm Exam - ${c.courseCode}`,
          description: `Midterm examination for ${c.title}. Covers first half of the syllabus.`,
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
          type: "Exam",
          course: courseId,
          createdBy: facultyUser._id,
        });
        console.log(`Created Event: Midterm Exam - ${c.courseCode}`);

        // Project Deadline (4 weeks from now)
        await AcademicEvent.create({
          title: `Final Project Submission`,
          description: `Deadline to submit final project for ${c.title}.`,
          date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // +28 days
          type: "Deadline",
          course: courseId,
          createdBy: facultyUser._id,
        });

        // Guest Lecture (next week)
        await AcademicEvent.create({
          title: `Guest Lecture: Industry Experts`,
          description: `Special session with guest speakers for ${c.title}.`,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
          type: "Lecture",
          course: courseId,
          createdBy: facultyUser._id,
        });
      }
    }
  }

  // Seed Global Events
  const globalEventExists = await AcademicEvent.findOne({
    title: "University Tech Fest",
  });
  if (!globalEventExists) {
    await AcademicEvent.create({
      title: "University Tech Fest",
      description: "Annual technical festival with hackathons and workshops.",
      date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // +60 days
      type: "Holiday", // Using Holiday type for general events for now
      course: null,
      createdBy: facultyUser._id,
    });
    console.log("Created Global Event: Tech Fest");
  }

  const holidayExists = await AcademicEvent.findOne({ title: "Winter Break" });
  if (!holidayExists) {
    await AcademicEvent.create({
      title: "Winter Break",
      description: "University closed for winter holidays.",
      date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 days
      type: "Holiday",
      course: null,
      createdBy: facultyUser._id,
    });
    console.log("Created Global Event: Winter Break");
  }
};

module.exports = seed;
