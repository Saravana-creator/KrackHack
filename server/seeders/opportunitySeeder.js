const Opportunity = require('../models/Opportunity');

const opportunities = [
    {
        title: 'Full Stack Developer Internship',
        description: 'A 6-month internship focused on building scalable web applications using MERN stack. Mentorship provided.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
        stipend: '15,000/month',
        duration: '6 months',
        deadline: new Date(new Date().setDate(new Date().getDate() + 30)),
        type: 'Internship'
    },
    {
        title: 'Research Assistant - AI Lab',
        description: 'Assist in ongoing research projects related to Natural Language Processing and Computer Vision.',
        requiredSkills: ['Python', 'PyTorch', 'Machine Learning'],
        stipend: '20,000/month',
        duration: '1 year',
        deadline: new Date(new Date().setDate(new Date().getDate() + 45)),
        type: 'Research'
    },
    {
        title: 'Frontend Engineer',
        description: 'Full-time position for a skilled frontend developer proficient in React and modern CSS frameworks.',
        requiredSkills: ['React', 'CSS', 'Redux', 'TypeScript'],
        stipend: 'Unpaid', 
        duration: 'Permanent',
        deadline: new Date(new Date().setDate(new Date().getDate() + 60)),
        type: 'Job'
    },
    {
        title: 'Data Science Intern',
        description: 'Work with the data team to analyze large datasets and build predictive models.',
        requiredSkills: ['Python', 'Pandas', 'SQL', 'Scikit-learn'],
        stipend: '18,000/month',
        duration: '3 months',
        deadline: new Date(new Date().setDate(new Date().getDate() + 20)),
        type: 'Internship'
    },
    {
        title: 'Product Design Lead',
        description: 'Lead the design of user interfaces and user experiences for our core products.',
        requiredSkills: ['Figma', 'UI/UX', 'Prototyping'],
        stipend: 'Negotiable',
        duration: 'Full-time',
        deadline: new Date(new Date().setDate(new Date().getDate() + 90)),
        type: 'Job'
    }
];

const seed = async (facultyUser) => {
    console.log('Seeding Opportunities...');
    for (const opp of opportunities) {
        const exists = await Opportunity.findOne({ title: opp.title });
        if (!exists) {
            await Opportunity.create({
                ...opp,
                postedBy: facultyUser._id
            });
            console.log(`Created Opportunity: ${opp.title}`);
        } else {
            console.log(`Skipped (Exists): ${opp.title}`);
        }
    }
};

module.exports = seed;
