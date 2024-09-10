
const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

module.exports.register = async (req, res, next) => {
    try {
      const { firstName, lastName, birthday, gender, email, password } = req.body;
  
      const formattedBirthday = new Date(birthday);
  
      if (isNaN(formattedBirthday.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for birthday' });
      }
  
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          birthday: formattedBirthday,
          gender,
          email,
          password: hashedPassword
        }
      });
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  module.exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
  
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
  
        const user = await prisma.user.findUnique({
            where: { email }
        });
  
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
  
        const passwordMatch = await bcrypt.compare(password, user.password);
  
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
  
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'qwe', { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.getProfile = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; 

        if (!token) {
            return res.status(401).json({ error: 'Token not provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'qwe'); 
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

};

