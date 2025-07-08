const knex = require('knex')(require('./knexfile').development);
const bcrypt = require('bcrypt');

async function createTestUsers() {
  try {
    // Vérifier si les utilisateurs de test existent déjà
    const existingUsers = await knex('users').whereIn('email', [
      'student@test.com',
      'employer@test.com'
    ]);
    
    if (existingUsers.length > 0) {
      console.log('Some test users already exist!');
      return;
    }
    
    // Créer le mot de passe hashé
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Créer un étudiant de test
    const [studentId] = await knex('users').insert({
      email: 'student@test.com',
      password: hashedPassword,
      first_name: 'John',
      last_name: 'Student',
      role: 'student',
      location: 'Paris, France',
      skills: 'JavaScript, React, Node.js',
      bio: 'Passionate student looking for internship opportunities in web development.',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Créer un employeur de test
    const [employerId] = await knex('users').insert({
      email: 'employer@test.com',
      password: hashedPassword,
      first_name: 'Marie',
      last_name: 'Employer',
      role: 'employer',
      location: 'Lyon, France',
      skills: 'Management, Recruitment',
      bio: 'HR Manager at TechStartup looking for talented students.',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('✅ Test users created successfully!');
    console.log('📧 Student: student@test.com / test123');
    console.log('📧 Employer: employer@test.com / test123');
    console.log('🆔 Student ID:', studentId);
    console.log('🆔 Employer ID:', employerId);
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await knex.destroy();
  }
}

createTestUsers(); 