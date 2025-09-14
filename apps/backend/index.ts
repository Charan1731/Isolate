import express from 'express'
import dotenv from 'dotenv'
import authRouter from './routes/auth.routes'
import adminRouter from './routes/admin.routes'
import userRouter from './routes/user.routes'
import cors from 'cors'
dotenv.config()

const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:4173"],
    credentials: true
}

const app = express()

app.use(express.json())
app.use(cors(corsOptions))
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)

app.listen(8080, () => {
    console.log('Server running on port http://localhost:8080')
})