-- Database setup for SOP

-- Creating database 'SkoleAI'
CREATE DATABASE IF NOT EXISTS SkoleAI CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
USE SkoleAI;

-- Creating `users` table to store information about users (students and admins)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed password
    role ENUM('student', 'admin') NOT NULL, -- Role to distinguish between student and admin
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Creating `chats` table to store chat sessions created by students
CREATE TABLE IF NOT EXISTS chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- ID of the user who created the chat
    deleted BOOLEAN DEFAULT FALSE, -- Flag to indicate if the chat is deleted (soft delete)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Creating `messages` table to store messages in chat sessions
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL, -- ID of the chat this message belongs to
    sender_id INT NOT NULL, -- ID of the user who sent the message
    sender_type ENUM('student', 'ai') NOT NULL, -- Sender type (student or AI)
    content TEXT NOT NULL, -- Message content
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Creating indexes to improve query performance
CREATE INDEX idx_user_id ON chats(user_id);
CREATE INDEX idx_chat_id ON messages(chat_id);
CREATE INDEX idx_sender_id ON messages(sender_id);