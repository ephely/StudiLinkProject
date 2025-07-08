exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('job_offers')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('job_offers').insert([
        {
          title: 'Développeur Web Full Stack',
          description:
            "Nous recherchons un développeur passionné pour rejoindre notre équipe et participer au développement de nos applications web innovantes. Vous travaillerez sur des projets variés utilisant les dernières technologies (React, Node.js, PostgreSQL).\n\nMissions principales :\n- Développement frontend et backend\n- Participation aux réunions d'équipe\n- Tests et débogage\n- Documentation technique",
          company: 'TechStartup',
          location: 'Paris, France',
          job_type: 'internship',
          duration: '6 mois',
          salary_min: 1200,
          salary_max: 1500,
          salary_currency: 'EUR',
          remote_option: 'hybrid',
          requirements:
            "Étudiant en informatique (Bac+3 minimum)\nConnaissances en JavaScript, HTML, CSS\nBases en React et Node.js\nAutonomie et esprit d'équipe\nAnglais courant",
          benefits:
            "Environnement de travail moderne\nFormation continue\nÉquipe jeune et dynamique\nPossibilité d'embauche\nTickets restaurant",
          contact_email: 'recrutement@techstartup.fr',
          contact_phone: '+33 1 23 45 67 89',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          title: 'Assistant Marketing Digital',
          description:
            "Rejoignez notre équipe marketing pour gérer nos réseaux sociaux et nos campagnes publicitaires en ligne. Vous participerez à la stratégie de communication digitale de l'entreprise.\n\nMissions principales :\n- Gestion des réseaux sociaux\n- Création de contenu\n- Suivi des campagnes publicitaires\n- Analyse des performances",
          company: 'MarketingPro',
          location: 'Lyon, France',
          job_type: 'part_time',
          duration: '12 mois',
          salary_min: 800,
          salary_max: 1000,
          salary_currency: 'EUR',
          remote_option: 'on_site',
          requirements:
            "Étudiant en marketing, communication ou commerce\nMaîtrise des réseaux sociaux\nCréativité et sens de l'analyse\nAutonomie et rigueur",
          benefits:
            'Formation aux outils marketing\nÉquipe expérimentée\nHoraires flexibles\nÉvolution possible',
          contact_email: 'rh@marketingpro.fr',
          contact_phone: '+33 4 78 12 34 56',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          title: 'Designer UX/UI',
          description:
            "Nous cherchons un designer créatif pour concevoir des interfaces utilisateur modernes et intuitives. Vous travaillerez sur des projets variés pour différents clients.\n\nMissions principales :\n- Conception d'interfaces utilisateur\n- Création de maquettes et prototypes\n- Tests utilisateurs\n- Collaboration avec l'équipe développement",
          company: 'CreativeStudio',
          location: 'Remote',
          job_type: 'freelance',
          duration: 'Projet par projet',
          salary_min: 300,
          salary_max: 500,
          salary_currency: 'EUR',
          remote_option: 'remote',
          requirements:
            'Portfolio de projets UX/UI\nMaîtrise de Figma, Sketch ou Adobe XD\nConnaissances en design thinking\nExpérience en freelance appréciée',
          benefits:
            'Travail à distance\nHoraires flexibles\nProjets variés\nTarifs attractifs',
          contact_email: 'contact@creativestudio.com',
          contact_phone: '+33 6 12 34 56 78',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          title: 'Data Analyst',
          description:
            'Nous recherchons un analyste de données pour nous aider à extraire des insights précieux de nos données clients et opérationnelles.\n\nMissions principales :\n- Analyse de données\n- Création de tableaux de bord\n- Reporting mensuel\n- Recommandations stratégiques',
          company: 'DataCorp',
          location: 'Marseille, France',
          job_type: 'full_time',
          duration: 'CDI',
          salary_min: 2500,
          salary_max: 3500,
          salary_currency: 'EUR',
          remote_option: 'hybrid',
          requirements:
            "Master en statistiques, économie ou informatique\nMaîtrise de SQL et Python\nConnaissances en outils de BI (Tableau, Power BI)\nEsprit d'analyse et de synthèse",
          benefits:
            'Salaire attractif\nMutuelle et prévoyance\nFormation continue\nÉvolution de carrière',
          contact_email: 'jobs@datacorp.fr',
          contact_phone: '+33 4 91 23 45 67',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          title: 'Community Manager',
          description:
            "Nous cherchons un community manager dynamique pour animer nos réseaux sociaux et créer du lien avec notre communauté.\n\nMissions principales :\n- Animation des réseaux sociaux\n- Création de contenu\n- Modération des commentaires\n- Organisation d'événements",
          company: 'SocialBoost',
          location: 'Bordeaux, France',
          job_type: 'part_time',
          duration: '6 mois renouvelables',
          salary_min: 600,
          salary_max: 800,
          salary_currency: 'EUR',
          remote_option: 'on_site',
          requirements:
            'Étudiant en communication ou marketing\nMaîtrise des réseaux sociaux\nCréativité et réactivité\nExcellente orthographe',
          benefits:
            "Formation aux outils\nÉquipe jeune\nÉvénements d'entreprise\nPossibilité d'évolution",
          contact_email: 'recrutement@socialboost.fr',
          contact_phone: '+33 5 56 78 90 12',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    });
};
