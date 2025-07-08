const express = require('express');
const knex = require('knex')(require('./knexfile').development);
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const authenticateToken = require('./authenticateToken');

// Middleware pour vérifier si l'utilisateur est un employeur
const isEmployer = async (req, res, next) => {
  try {
    const user = await knex('users').where({ id: req.user.userId }).first();
    if (user.role !== 'employer' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux employeurs' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Erreur de vérification des permissions' });
  }
};

// Middleware pour vérifier si l'utilisateur est un admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await knex('users').where({ id: req.user.userId }).first();
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Erreur de vérification des permissions' });
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route pour télécharger le CV d'un utilisateur
app.get('/profile/:userId/cv', authenticateToken, async (req, res) => {
  try {
    const user = await knex('users').where({ id: req.params.userId }).first();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.cv_url) {
      return res.status(404).json({ error: 'CV not found' });
    }
    
    // Vérifier que l'utilisateur peut accéder au CV (soi-même ou employeur)
    if (req.user.userId !== parseInt(req.params.userId) && user.role !== 'employer') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const filePath = path.join(__dirname, user.cv_url);
    res.download(filePath, user.cv_filename || 'cv.pdf');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error downloading CV' });
  }
});

// Register
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    await knex('users').insert({ email, password: hashed });
    res.status(201).json({ message: 'Utilisateur inscrit !' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Email déjà utilisé ou erreur.' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await knex('users').where({ email }).first();
  if (!user) return res.status(401).json({ error: 'Utilisateur inconnu' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ message: 'Connexion réussie', token });
});

// Profil
app.get('/profile', authenticateToken, async (req, res) => {
  const user = await knex('users').where({ id: req.user.userId }).first();
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  delete user.password;
  res.json(user);
});

// Config Multer pour avatars et CV
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/cvs/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre pour les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Update Profile
app.post(
  '/profile/update',
  authenticateToken,
  upload.single('cv'),
  async (req, res) => {
    const { first_name, last_name, location, skills, bio } = req.body;
    
    try {
      const updateData = { first_name, last_name, location, skills, bio };
      
      // Gérer l'upload de CV
      if (req.file) {
        updateData.cv_url = '/uploads/cvs/' + req.file.filename;
        updateData.cv_filename = req.file.originalname;
      }

      await knex('users').where({ id: req.user.userId }).update(updateData);

      res.json({ 
        message: 'Profile updated successfully', 
        cv_url: updateData.cv_url,
        cv_filename: updateData.cv_filename
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error updating profile' });
    }
  },
);

// Routes pour les offres d'emploi

// Obtenir toutes les offres d'emploi actives
app.get('/job-offers', async (req, res) => {
  try {
    const { 
      job_type, 
      location, 
      remote_option, 
      search,
      page = 1,
      limit = 10
    } = req.query;
    
    let query = knex('job_offers')
      .where('is_active', true)
      .orderBy('created_at', 'desc');
    
    if (job_type) {
      query = query.where('job_type', job_type);
    }
    
    if (location) {
      query = query.where('location', 'like', `%${location}%`);
    }
    
    if (remote_option) {
      query = query.where('remote_option', remote_option);
    }
    
    if (search) {
      query = query.where(function() {
        this.where('title', 'like', `%${search}%`)
          .orWhere('description', 'like', `%${search}%`)
          .orWhere('company', 'like', `%${search}%`);
      });
    }
    
    const offset = (page - 1) * limit;
    const offers = await query.limit(limit).offset(offset);
    const total = await query.clone().count('* as count').first();
    
    res.json({
      offers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des offres' });
  }
});

// Obtenir une offre d'emploi spécifique
app.get('/job-offers/:id', async (req, res) => {
  try {
    const offer = await knex('job_offers')
      .where({ id: req.params.id, is_active: true })
      .first();
    
    if (!offer) {
      return res.status(404).json({ error: 'Offre d\'emploi introuvable' });
    }
    
    res.json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'offre' });
  }
});

// Créer une nouvelle offre d'emploi (employeurs seulement)
app.post('/job-offers', authenticateToken, isEmployer, async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      job_type,
      duration,
      salary_min,
      salary_max,
      salary_currency,
      remote_option,
      requirements,
      benefits,
      contact_email,
      contact_phone,
      application_url
    } = req.body;
    
    const [offerId] = await knex('job_offers').insert({
      title,
      description,
      company,
      location,
      job_type,
      duration,
      salary_min,
      salary_max,
      salary_currency,
      remote_option,
      requirements,
      benefits,
      contact_email,
      contact_phone,
      application_url,
      employer_id: req.user.userId
    });
    
    const newOffer = await knex('job_offers').where({ id: offerId }).first();
    res.status(201).json(newOffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'offre' });
  }
});

// Mettre à jour une offre d'emploi (employeur propriétaire seulement)
app.put('/job-offers/:id', authenticateToken, isEmployer, async (req, res) => {
  try {
    const offer = await knex('job_offers')
      .where({ id: req.params.id, employer_id: req.user.userId })
      .first();
    
    if (!offer) {
      return res.status(404).json({ error: 'Offre d\'emploi introuvable ou non autorisée' });
    }
    
    await knex('job_offers')
      .where({ id: req.params.id })
      .update({
        ...req.body,
        updated_at: knex.fn.now()
      });
    
    const updatedOffer = await knex('job_offers').where({ id: req.params.id }).first();
    res.json(updatedOffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'offre' });
  }
});

// Supprimer une offre d'emploi (employeur propriétaire seulement)
app.delete('/job-offers/:id', authenticateToken, isEmployer, async (req, res) => {
  try {
    const offer = await knex('job_offers')
      .where({ id: req.params.id, employer_id: req.user.userId })
      .first();
    
    if (!offer) {
      return res.status(404).json({ error: 'Offre d\'emploi introuvable ou non autorisée' });
    }
    
    await knex('job_offers').where({ id: req.params.id }).delete();
    res.json({ message: 'Offre d\'emploi supprimée avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'offre' });
  }
});


// Routes pour les candidatures

// Postuler à une offre d'emploi
app.post('/job-offers/:id/apply', authenticateToken, async (req, res) => {
  try {
    const { cover_letter, resume_url } = req.body;
    
    // Vérifier que l'offre existe et est active
    const offer = await knex('job_offers')
      .where({ id: req.params.id, is_active: true })
      .first();
    
    if (!offer) {
      return res.status(404).json({ error: 'Offre d\'emploi introuvable' });
    }
    
    // Vérifier que l'étudiant n'a pas déjà postulé
    const existingApplication = await knex('applications')
      .where({ job_offer_id: req.params.id, student_id: req.user.userId })
      .first();
    
    if (existingApplication) {
      return res.status(400).json({ error: 'Vous avez déjà postulé à cette offre' });
    }
    
    const [applicationId] = await knex('applications').insert({
      job_offer_id: req.params.id,
      student_id: req.user.userId,
      cover_letter,
      resume_url
    });
    
    const application = await knex('applications').where({ id: applicationId }).first();
    res.status(201).json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la candidature' });
  }
});

// Obtenir les candidatures d'un étudiant
app.get('/applications/student', authenticateToken, async (req, res) => {
  try {
    const applications = await knex('applications')
      .join('job_offers', 'applications.job_offer_id', 'job_offers.id')
      .where('applications.student_id', req.user.userId)
      .select(
        'applications.*',
        'job_offers.title',
        'job_offers.company',
        'job_offers.location'
      )
      .orderBy('applications.applied_at', 'desc');
    
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des candidatures' });
  }
});

// Obtenir les candidatures pour une offre d'emploi (employeur seulement)
app.get('/job-offers/:id/applications', authenticateToken, isEmployer, async (req, res) => {
  try {
    const offer = await knex('job_offers')
      .where({ id: req.params.id, employer_id: req.user.userId })
      .first();
    
    if (!offer) {
      return res.status(404).json({ error: 'Offre d\'emploi introuvable ou non autorisée' });
    }
    
    const applications = await knex('applications')
      .join('users', 'applications.student_id', 'users.id')
      .where('applications.job_offer_id', req.params.id)
      .select(
        'applications.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.location',
        'users.skills'
      )
      .orderBy('applications.applied_at', 'desc');
    
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des candidatures' });
  }
});

// Mettre à jour le statut d'une candidature (employeur seulement)
app.put('/applications/:id/status', authenticateToken, isEmployer, async (req, res) => {
  try {
    const { status, employer_notes } = req.body;
    
    const application = await knex('applications')
      .join('job_offers', 'applications.job_offer_id', 'job_offers.id')
      .where({ 'applications.id': req.params.id, 'job_offers.employer_id': req.user.userId })
      .first();
    
    if (!application) {
      return res.status(404).json({ error: 'Candidature introuvable ou non autorisée' });
    }
    
    await knex('applications')
      .where({ id: req.params.id })
      .update({
        status,
        employer_notes,
        updated_at: knex.fn.now()
      });
    
    const updatedApplication = await knex('applications').where({ id: req.params.id }).first();
    res.json(updatedApplication);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

// Routes d'administration

// Obtenir toutes les offres d'emploi avec leurs statuts (admin seulement)
app.get('/admin/job-offers', authenticateToken, isAdmin, async (req, res) => {
  try {
    const offers = await knex('job_offers')
      .join('users', 'job_offers.employer_id', 'users.id')
      .select(
        'job_offers.*',
        'users.first_name as employer_first_name',
        'users.last_name as employer_last_name',
        'users.email as employer_email'
      )
      .orderBy('job_offers.created_at', 'desc');
    
    // Ajouter le nombre de candidatures pour chaque offre
    for (let offer of offers) {
      const applicationsCount = await knex('applications')
        .where({ job_offer_id: offer.id })
        .count('* as count')
        .first();
      offer.applications_count = applicationsCount.count;
    }
    
    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des offres' });
  }
});

// Mettre à jour le statut d'une offre d'emploi (admin seulement)
app.put('/admin/job-offers/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { is_active } = req.body;
    
    const offer = await knex('job_offers').where({ id: req.params.id }).first();
    
    if (!offer) {
      return res.status(404).json({ error: 'Offre d\'emploi introuvable' });
    }
    
    await knex('job_offers')
      .where({ id: req.params.id })
      .update({
        is_active,
        updated_at: knex.fn.now()
      });
    
    const updatedOffer = await knex('job_offers').where({ id: req.params.id }).first();
    res.json(updatedOffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

// Obtenir les statistiques globales (admin seulement)
app.get('/admin/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const stats = {
      total_users: await knex('users').count('* as count').first(),
      total_employers: await knex('users').where({ role: 'employer' }).count('* as count').first(),
      total_students: await knex('users').where({ role: 'student' }).count('* as count').first(),
      total_job_offers: await knex('job_offers').count('* as count').first(),
      active_job_offers: await knex('job_offers').where({ is_active: true }).count('* as count').first(),
      total_applications: await knex('applications').count('* as count').first(),
      pending_applications: await knex('applications').where({ status: 'pending' }).count('* as count').first()
    };
    
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Obtenir tous les utilisateurs (admin seulement)
app.get('/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await knex('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'created_at')
      .orderBy('created_at', 'desc');
    
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Mettre à jour le rôle d'un utilisateur (admin seulement)
app.put('/admin/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'employer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }
    
    const user = await knex('users').where({ id: req.params.id }).first();
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    
    await knex('users')
      .where({ id: req.params.id })
      .update({ role });
    
    const updatedUser = await knex('users').where({ id: req.params.id }).first();
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:3001`);
});
