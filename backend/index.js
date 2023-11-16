const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');


dotenv.config();
const app = express();
app.use(bodyParser.json());

// Definição do modelo Student e outras classes, rotas, etc...

const pgp = require('pg-promise')();
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const db = pgp(connectionString);

const createSchoolTables = `
CREATE TABLE IF NOT EXISTS professores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    materia VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(50) NOT NULL,
    descricao TEXT,
    done BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS responsaveis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(30) NOT NULL,
    filho VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL,
    nome VARCHAR(50) NOT NULL,
    matricula INT PRIMARY KEY NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    curso VARCHAR(50) NOT NULL,
    professor_id INT REFERENCES professores(id),
    responsavel_id INT REFERENCES responsaveis(id),
    tasks_id INT REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    idade INTEGER NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    cargo VARCHAR(40),
    departamento VARCHAR(40)
);

CREATE TABLE IF NOT EXISTS disciplinas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    carga_horaria INTEGER NOT NULL,
    sala_aula VARCHAR(50),
    professor_id INT REFERENCES professores(id)
);
CREATE TABLE IF NOT EXISTS diretores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    idade INTEGER NOT NULL,
    cep VARCHAR(15) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    salario DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS escolas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL
);

`;


db.none(createSchoolTables)
    .then(() => {
        console.log('Tabelas criadas com sucesso!');
    })
    .catch(err => {
        console.error('Erro ao criar tabelas:', err);
    });


// Definição do modelo Student
class Student {
    constructor(id, nome, matricula, telefone, curso, professor_id, responsavel_id) {
        this.id = id;
        this.nome = nome;
        this.matricula = matricula;
        this.telefone = telefone;
        this.curso = curso;
        this.professor_id = professor_id;
        this.responsavel_id = responsavel_id;
    }

    static async getAllStudents() {
        return db.many('SELECT * FROM students');
    }

    static async createStudent(studentData) {
        return db.none(
            'INSERT INTO students (nome, matricula, telefone, curso, professor_id, responsavel_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [studentData.nome, studentData.matricula, studentData.telefone, studentData.curso, studentData.professor_id, studentData.responsavel_id]
        );
    }

    static async getStudentById(id) {
        return db.oneOrNone('SELECT * FROM students WHERE id = $1', id);
    }

    static async updateStudentById(id, updateStudentData) {
        return db.none(
            'UPDATE students SET nome = $1, matricula = $2, telefone = $3, curso = $4 WHERE id = $5',
            [updateStudentData.nome, updateStudentData.matricula, updateStudentData.telefone, updateStudentData.curso, id]
        );
    }

    static async deleteStudentById(id) {
        return db.none('DELETE FROM students WHERE id = $1', id);
    }
}


app.get('/students', async (req, res) => {
    try {
        const students = await Student.getAllStudents();
        res.status(200).json({ message: "Estudantes: ", students });
    } catch (err) {
        res.status(500).json({ message: "Erro ao listar estudantes!" });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
