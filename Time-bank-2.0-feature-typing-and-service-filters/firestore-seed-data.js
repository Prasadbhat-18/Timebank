// Firebase Firestore Seed Data
// Add this data manually in Firebase Console > Firestore Database

// Collection: skills
// Add these documents (use "Add document" and set Document ID to the id value):

const seedSkills = [
  // Document ID: skill-1
  {
    id: "skill-1",
    name: "Web Development",
    category: "Technology"
  },

  // Document ID: skill-2
  {
    id: "skill-2",
    name: "Graphic Design",
    category: "Design"
  },

  // Document ID: skill-3
  {
    id: "skill-3",
    name: "Cooking",
    category: "Lifestyle"
  },

  // Document ID: skill-4
  {
    id: "skill-4",
    name: "Language Tutoring",
    category: "Education"
  },

  // Document ID: skill-5
  {
    id: "skill-5",
    name: "Music Lessons",
    category: "Arts"
  },

  // Document ID: skill-6
  {
    id: "skill-6",
    name: "Home Repair",
    category: "Maintenance"
  },

  // Document ID: skill-7
  {
    id: "skill-7",
    name: "Photography",
    category: "Arts"
  },

  // Document ID: skill-8
  {
    id: "skill-8",
    name: "Fitness Training",
    category: "Health"
  },

  // Document ID: skill-9
  {
    id: "skill-9",
    name: "Gardening",
    category: "Lifestyle"
  },

  // Document ID: skill-10
  {
    id: "skill-10",
    name: "Data Analysis",
    category: "Technology"
  }
];

// How to add this data:
// 1. Go to Firebase Console > Firestore Database
// 2. Click "Start collection"
// 3. Collection ID: "skills"
// 4. For each skill above:
//    - Click "Add document"
//    - Document ID: use the ID from above (e.g., "skill-1")
//    - Add fields: "name" (string) and "category" (string)
//    - Add the values from above
//    - Click "Save"