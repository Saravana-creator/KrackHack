const Course = require('../models/Course');
const Resource = require('../models/Resource');

const courses = [
    {
        title: 'Data Structures & Algorithms',
        courseCode: 'CS201',
        description: 'Advanced data structures including trees, graphs, heaps, and algorithm analysis techniques.',
    },
    {
        title: 'Operating Systems',
        courseCode: 'CS301',
        description: 'Design and implementation of operating systems: process management, memory management, and file systems.',
    },
    {
        title: 'Database Management Systems',
        courseCode: 'CS304',
        description: 'Relational database concepts, SQL, normalization, and transaction management.',
    },
    {
        title: 'Computer Networks',
        courseCode: 'CS306',
        description: 'Network layers, protocols, TCP/IP, and network security fundamentals.',
    },
    {
        title: 'Artificial Intelligence',
        courseCode: 'CS401',
        description: 'Introduction to AI, problem solving, knowledge representation, and machine learning basics.',
    }
];

const seed = async (facultyUser) => {
    console.log('Seeding Academic Courses...');
    for (const c of courses) {
        const exists = await Course.findOne({ courseCode: c.courseCode });
        let courseId;
        
        if (!exists) {
            const course = await Course.create({
                ...c,
                faculty: facultyUser._id
            });
            courseId = course._id;
            console.log(`Created Course: ${c.title}`);
        } else {
            courseId = exists._id;
            console.log(`Skipped (Exists): ${c.title}`);
        }

        // Add dummy resource if course exists
        if(courseId) {
            const resExists = await Resource.findOne({ title: `Syllabus - ${c.courseCode}` });
            if(!resExists) {
                await Resource.create({
                    title: `Syllabus - ${c.courseCode}`,
                    description: 'Course syllabus and grading policy.',
                    fileUrl: 'https://example.com/syllabus.pdf',
                    course: courseId,
                    uploadedBy: facultyUser._id
                });
            }
        }
    }
};

module.exports = seed;
