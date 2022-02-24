import jwt from 'jsonwebtoken'
const secret: any = process.env.JWT_SECRET

const generateToken = (username: string) => {
    return jwt.sign({ username }, secret, {
        expiresIn: '30d',
    })
}

export default generateToken;