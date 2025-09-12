import express from 'express'
import dotenv from 'dotenv'
import authRouter from './routes/auth.routes'

dotenv.config()

const app = express()

app.use(express.json())
app.use('/api/auth', authRouter)

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port http://localhost:${process.env.PORT || 3000}`)
})