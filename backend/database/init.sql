-- ============================================
-- CLINIQUE VÉTÉRINAIRE - BASE DE DONNÉES
-- ============================================

-- Supprimer la base si elle existe (⚠️ seulement en développement)
DROP DATABASE IF EXISTS clinique_veto;

-- Créer la base de données
CREATE DATABASE clinique_veto;

-- Utiliser la base de données
USE clinique_veto;

-- ============================================
-- 1. TABLE USERS (authentification)
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'client') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. TABLE CLIENTS (informations clients)
-- ============================================
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    photo_url LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 3. TABLE ANIMAUX
-- ============================================
CREATE TABLE animaux (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    espece VARCHAR(50) NOT NULL,
    race VARCHAR(50),
    date_naissance DATE,
    poids DECIMAL(5,2),
    couleur VARCHAR(50),
    numero_identification VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- ============================================
-- 4. TABLE VETERINAIRES
-- ============================================
CREATE TABLE veterinaires (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    specialite VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. TABLE SERVICES
-- ============================================
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    duree INT NOT NULL COMMENT 'Duree en minutes',
    prix DECIMAL(10,2) NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. TABLE RENDEZ_VOUS
-- ============================================
CREATE TABLE rendez_vous (
    id INT PRIMARY KEY AUTO_INCREMENT,
    animal_id INT NOT NULL,
    veterinaire_id INT NOT NULL,
    service_id INT NOT NULL,
    date_rendezvous DATETIME NOT NULL,
    duree INT COMMENT 'Duree en minutes',
    statut ENUM('planifie', 'confirme', 'en_cours', 'termine', 'annule') DEFAULT 'planifie',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animaux(id),
    FOREIGN KEY (veterinaire_id) REFERENCES veterinaires(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- ============================================
-- 7. TABLE HORAIRES_TRAVAIL
-- ============================================
CREATE TABLE horaires_travail (
    id INT PRIMARY KEY AUTO_INCREMENT,
    jour_semaine INT NOT NULL COMMENT '0=lundi, 6=dimanche',
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    pause_debut TIME,
    pause_fin TIME,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. TABLE PRODUITS
-- ============================================
CREATE TABLE produits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    prix DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categorie VARCHAR(50),
    image_url VARCHAR(255),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 9. TABLE COMMANDES
-- ============================================
CREATE TABLE commandes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('en_attente', 'confirmee', 'expediee', 'livree', 'annulee') DEFAULT 'en_attente',
    montant_total DECIMAL(10,2) NOT NULL,
    adresse_livraison TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- ============================================
-- 10. TABLE COMMANDE_PRODUIT (liaison)
-- ============================================
CREATE TABLE commande_produit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    commande_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id)
);

-- ============================================
-- 11. TABLE PANIER (panier persistant)
-- ============================================
CREATE TABLE panier (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL,
    UNIQUE KEY unique_client_produit (client_id, produit_id),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

-- ============================================
-- INSERTION DES DONNEES DE TEST
-- ============================================

-- Insertion d'un administrateur (mot de passe: admin123)
-- Note: Le mot de passe sera hashé plus tard avec bcrypt
INSERT INTO users (email, password, role) VALUES 
('admin@cliniqueveto.com', '$2b$10$uZlLdZl47zpzGrrkhXEJ9On.Qs8PeF8E1YYaoFlSo8gq.U/4xfyRa', 'admin');

-- Insertion d'un client de test
INSERT INTO users (email, password, role) VALUES 
('client@test.com', '$2b$10$F36Gtyz7wELNEaaL5aJPQ.mCk1.72ctCT2c3vF9Gnn6isunFp4lDW', 'client');

INSERT INTO clients (user_id, nom, prenom, telephone, adresse, ville, code_postal) VALUES 
(2, 'DUPONT', 'Jean', '0612345678', '1 rue de la Paix', 'Paris', '75001');

-- Insertion des veterinaires
INSERT INTO veterinaires (nom, prenom, specialite, telephone, email) VALUES 
('MARTIN', 'Sophie', 'Generaliste', '0612345678', 'sophie.martin@clinique.com'),
('BERNARD', 'Thomas', 'Chirurgien', '0623456789', 'thomas.bernard@clinique.com'),
('PETIT', 'Julie', 'Dermatologue', '0634567890', 'julie.petit@clinique.com');

-- Insertion des services
INSERT INTO services (nom, description, duree, prix) VALUES 
('Consultation generale', 'Examen complet de l\'animal', 30, 50.00),
('Vaccination', 'Vaccination annuelle', 20, 45.00),
('Chirurgie', 'Intervention chirurgicale', 60, 250.00),
('Dermatologie', 'Consultation dermatologique', 30, 60.00),
('Toilettage', 'Toilettage complet', 45, 40.00);

-- Insertion des horaires de travail (Lundi au Vendredi)
INSERT INTO horaires_travail (jour_semaine, heure_debut, heure_fin, pause_debut, pause_fin) VALUES 
(0, '09:00', '18:00', '12:30', '14:00'),
(1, '09:00', '18:00', '12:30', '14:00'),
(2, '09:00', '18:00', '12:30', '14:00'),
(3, '09:00', '18:00', '12:30', '14:00'),
(4, '09:00', '18:00', '12:30', '14:00'),
(5, '09:00', '13:00', NULL, NULL);

-- Insertion des produits
INSERT INTO produits (nom, description, prix, stock, categorie, image_url) VALUES 
('Croquettes Premium 2kg', 'Alimentation complete pour chien adulte', 25.99, 50, 'Alimentation', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&h=400'),
('Litiere agglomerante 10L', 'Litiere pour chat, parfum neutre', 12.50, 30, 'Hygiene', 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&h=400'),
('Anti-puces pipettes', 'Traitement anti-puces pour chat', 18.90, 40, 'Traitement', 'https://images.unsplash.com/photo-1608454509000-19cfe93616a7?auto=format&fit=crop&w=600&h=400'),
('Jouet corde', 'Jouet a macher pour chien', 8.50, 100, 'Accessoires', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&h=400'),
('Brosse demelante', 'Brosse pour poils longs', 15.00, 25, 'Toilettage', 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&w=600&h=400');

-- ============================================
-- FIN DU SCRIPT
-- ============================================