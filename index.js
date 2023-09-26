console.log("hello")
const express = require('express')
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/user.model')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const PORT = process.env.PORT || 3005

mongoose.connect(`${process.env.Mongo_DB}`)

app.use(cors())
app.use(express.json())


// The ("Register") Backend function

app.post('/api/register', async (req, res) => {
    try {
        const newPassword = await bcrypt.hash(req.body.password, 10)
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: newPassword,
        })
        res.json({ status: 'ok' })
    } catch (error) {
        res.json({ status: 'error', error: 'Duplicate email' })
    }
})

// The ("Login") Backend function

app.post('/api/login', async (req, res) => {
    // Check Weather the user with this email exist or not
    const user = await User.findOne({
        email: req.body.email,
    })
    if (!user) { return { status: 'error', error: 'Invalid login' } }
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password)

    if (isPasswordValid) {
        const token = jwt.sign({
            name: user.name,
            email: user.email,
        }, 'secret123')
        return res.json({ status: 'ok', user: token })
    } else {
        return res.json({ status: 'error', user: false })
    }

}
)


// The ("Quote") Backend function


app.get('/api/quote', async (req, res) => {

    const token = req.headers['x-access-token']

    try {
        const decoded = jwt.verify(token, 'secret123')
        const email = decoded.email
        const user = await User.findOne({ email: email })
        return res.json({ status: 'ok', quote: user.quote })
    } catch (error) {
        console.log(error)
        res.json({ status: 'error', error: "invalid token" })
    }


})

// The ("Update Quote") Backend function

app.post('/api/quote', async (req, res) => {

    const token = req.headers['x-access-token']

    try {
        const decoded = jwt.verify(token, 'secret123')
        const email = decoded.email
        await User.updateOne({ email: email }, { $set: { quote: req.body.quote } })
        return res.json({ status: 'ok' })
    } catch (error) {
        console.log(error)
        res.json({ status: 'error', error: "invalid token" })
    }


})
app.listen(PORT, () => {
    console.log("Server started")
})