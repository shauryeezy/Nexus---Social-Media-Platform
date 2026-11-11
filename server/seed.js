const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');

const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[Seed] Database already has ${userCount} users. Skipping auto-seed.`);
      return;
    }

    console.log('[Seed] Database is empty. Seeding initial mock data...');

    const salt = await bcrypt.genSalt(10);
    const demoPassword = await bcrypt.hash('password123', salt);

    const usersToCreate = [
      {
        name: 'Sarah Connor',
        username: 'sarahc',
        email: 'sarah@example.com',
        password: demoPassword,
        bio: 'Senior Software Architect. Obsessed with clean code, React architecture & MERN stack scalability.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        location: 'San Francisco, CA',
        website: 'https://sarahcodes.dev'
      },
      {
        name: 'Alex Rivera',
        username: 'alexdev',
        email: 'alex@example.com',
        password: demoPassword,
        bio: 'Full-stack builder & UI craftsman. Turning caffeine into elegant interfaces.',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        location: 'Austin, TX',
        website: 'https://alexrivera.design'
      },
      {
        name: 'Maya Patel',
        username: 'mayatech',
        email: 'maya@example.com',
        password: demoPassword,
        bio: 'Frontend enthusiast & AI tinkerer. Open source contributor. Building the future web.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        location: 'Seattle, WA',
        website: 'https://maya.io'
      }
    ];

    const createdUsers = await User.insertMany(usersToCreate);

    // Mutual follow links
    createdUsers[0].following.push(createdUsers[1]._id, createdUsers[2]._id);
    createdUsers[1].following.push(createdUsers[0]._id);
    createdUsers[2].following.push(createdUsers[0]._id, createdUsers[1]._id);

    createdUsers[0].followers.push(createdUsers[1]._id, createdUsers[2]._id);
    createdUsers[1].followers.push(createdUsers[0]._id, createdUsers[2]._id);
    createdUsers[2].followers.push(createdUsers[0]._id);

    await Promise.all(createdUsers.map((u) => u.save()));

    const postsToCreate = [
      {
        user: createdUsers[0]._id,
        content: 'Excited to unveil our new MERN stack social platform architecture! Built with Node.js, Express, MongoDB, and React. Clean REST APIs and responsive UI/UX make all the difference. What are you building today? #mern #webdev #reactjs',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
        tags: ['mern', 'webdev', 'reactjs'],
        likes: [createdUsers[1]._id, createdUsers[2]._id],
        comments: [
          {
            user: createdUsers[1]._id,
            text: 'Looks super clean Sarah! Love the dark mode palette.',
            createdAt: new Date(Date.now() - 3600000 * 2)
          },
          {
            user: createdUsers[2]._id,
            text: 'Amazing work! MERN stack feels so productive with modern tooling.',
            createdAt: new Date(Date.now() - 3600000 * 1)
          }
        ]
      },
      {
        user: createdUsers[1]._id,
        content: 'Crafting user experiences is 10% coding and 90% empathy. Notice how small micro-animations and instantaneous optimistic UI updates change user perception completely! #uxdesign #frontend #javascript',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
        tags: ['uxdesign', 'frontend', 'javascript'],
        likes: [createdUsers[0]._id],
        comments: [
          {
            user: createdUsers[0]._id,
            text: 'Couldn’t agree more. Smooth micro-interactions elevate the whole feel.',
            createdAt: new Date(Date.now() - 1800000)
          }
        ]
      },
      {
        user: createdUsers[2]._id,
        content: 'Late night debugging session conquered. Fixed the Mongo aggregation pipeline and feed queries now run in under 8ms! Time for fresh coffee ☕ #mongodb #nodejs #backend',
        image: '',
        tags: ['mongodb', 'nodejs', 'backend'],
        likes: [createdUsers[0]._id, createdUsers[1]._id],
        comments: []
      }
    ];

    await Post.insertMany(postsToCreate);
    console.log('[Seed] Successfully seeded 3 demo users and 3 posts with comments & likes!');
  } catch (error) {
    console.error('[Seed] Error seeding data:', error);
  }
};

module.exports = seedInitialData;

