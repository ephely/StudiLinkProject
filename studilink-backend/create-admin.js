const knex = require('knex')(require('./knexfile').development);
const bcrypt = require('bcrypt');

async function createAdmin() {
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await knex('users').where({ email: 'admin@studilink.com' }).first();
    
    if (existingAdmin) {
      console.log('Admin account already exists!');
      return;
    }
    
    // Créer le mot de passe hashé
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insérer l'admin
    const [adminId] = await knex('users').insert({
      email: 'admin@studilink.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'StudiLink',
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: admin@studilink.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', adminId);
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  } finally {
    await knex.destroy();
  }
}

createAdmin(); 