// Initial content, all taken from material CIASO published on ciaso.ca and its YouTube channel.
// Loaded by scripts/setup-db.mjs only into empty tables; afterwards manage content in /admin.

export { events } from './seed-events.mjs';

export const stories = [
  { name: 'Sidonie', location: 'Edmonton', theme: 'From job seeker to thriving in Canada.', featured: 1, sort_order: 1,
    quote: 'CIASO: Where preparation meets possibility. They didn’t just help me land a job – they helped me land in Canada. From resume writing to one-on-one interview prep, CIASO sharpened my confidence and presentation. But what truly sets them apart is how they go beyond job search. They actively facilitate integration by building networks, connecting newcomers, and creating a sense of belonging. With coaching, mentorship, and community, CIASO turns potential into opportunity and newcomers into thriving Canadians. Thank you CIASO.',
    tags: 'Career & employment,Mentorship,Community', categories: 'career newcomer mentorship community' },
  { name: 'Dr. Stephen A.', location: 'Edmonton', theme: 'From uncertainty to confidence.', sort_order: 2,
    quote: 'CIASO has been instrumental in my settlement journey by providing guidance on adapting to life in Canada, connecting me with community resources, and offering career support. Their workshops, networking opportunities, and coaching improved my resume, interview skills, and confidence in navigating the Canadian job market. Through its mentorship and encouragement, I have built meaningful connections, gained valuable insights, and advanced toward my career goals in Canada.',
    tags: 'Newcomer journey,Career', categories: 'newcomer career skills mentorship' },
  { name: 'Koti', location: 'Grande Prairie', theme: 'From newcomer to family supported.', sort_order: 3,
    quote: 'When I first came across the Canada Integration and Settlement Organization (CIASO), I couldn’t help but feel a sense of regret… that I had already made some significant life decisions – particularly in my career and academics – that might have been different had I known about this incredible resource earlier. However, all was not lost… CIASO has continued to be a tremendous support for me and my family.\n\nThe organization offers a variety of services, including invaluable Zoom sessions and personalized one-on-one advice… For anyone arriving in Canada for the first time, I wouldn’t hesitate to recommend CIASO. Keep up the great work, CIASO. You’re making a real difference!',
    tags: 'Newcomer journey,One-on-one advice', categories: 'newcomer mentorship' },
  { name: 'Anne', location: 'Workshop participant', theme: 'From a career pause to a fresh start.', sort_order: 4,
    quote: 'Participating in CIASO’s workshops has been an invaluable experience. I was able to refresh my resume, strengthen my interview techniques, and pick up practical strategies for effective networking. Their guidance not only gave me more confidence in my career development preparedness but also a clearer understanding of how to navigate the Canadian job market after being out of the corporate workforce for a long time.',
    tags: 'Workshops,Career', categories: 'career skills' },
  { name: 'Anne', location: 'Participante aux ateliers', theme: 'De la pause à la confiance.', lang: 'fr', sort_order: 5,
    quote: 'Grâce aux ateliers du CIASO, j’ai retrouvé confiance et acquis des outils essentiels pour réintégrer le marché du travail canadien après une longue pause professionnelle.',
    tags: 'Ateliers,En français', categories: 'career skills' },
  { name: 'Suzy', location: 'CIASO participant', theme: 'From job search to job-ready.', sort_order: 6,
    quote: 'I 100% recommend CIASO. The organizers are good, walk you throughout the job search process, teach and review all resumes and cover letters. Share jobs that are reputable and relevant. I encourage anyone looking for jobs and anything specific to join the organization.',
    tags: 'Career & employment', categories: 'career skills' },
  { name: 'Romaric', location: 'CIASO participant', theme: 'From searching alone to finding support.', sort_order: 7,
    quote: 'CIASO I must say this God will bless you abundantly for your time you took to help out in this Job search… trust me it’s not by mistake I came across this Organization… it really takes a lot of sacrifices and dedication in what the organization is doing.',
    tags: 'Job search', categories: 'career community' },
  { name: 'Dr. Frida', location: 'CIASO community member', theme: 'From arriving in Canada to building a community.', sort_order: 8,
    quote: 'I’d like to say a big thank you for everything you do for us in the group, your time and devotion so that everyone finds each other in this new country we’ve decided to immigrate to. A really big thank you to you and your team. Hoping that one day we’ll also be resource people for others.',
    tags: 'Community,Newcomer journey', categories: 'newcomer community' }
];

export const videos = [
  { youtube_id: 'PqBoP5O63pw', title: 'Meet CIASO: Skills, training and jobs for newcomers', sort_order: 1, is_short: 0,
    description: 'CIASO helps unemployed individuals, particularly newcomers, gain sustainable employment through skills development, job training and job placement programs.',
    source_label: 'CIASO on YouTube · October 2025', placement: 'home' },
  { youtube_id: 'xrAnQn7yGrY', title: 'CIASO workshop announcement: settlement, career growth and success', sort_order: 2, is_short: 1,
    description: 'An invitation to a CIASO workshop: learn practical information, connect with professionals and like-minded people, discover resources, and expand your network.',
    source_label: 'Dr. Leonard Ngwa, CIASO co-founder · February 2026', placement: 'about' }
];
