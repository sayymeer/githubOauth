import express from "express"
import { config } from "dotenv"
import { App,Octokit } from "octokit"
import morgan from "morgan"
config()

const {clientSecret,clientId,appId,privateKey} = process.env
const port  = process.env.PORT || 3000

const ghapp = new App({
    appId:appId,
    privateKey:privateKey,
    oauth:{clientId,clientSecret}
})

const app = express()
app.use(morgan("dev"))

app.get('/',(req,res)=>{
    res.send("<a href='/github'>Login with github</a>")
})

app.get("/github",(req,res)=>{
    const url = ghapp.oauth.getWebFlowAuthorizationUrl({allowSignup:true}).url
    res.redirect(url)
})

app.get("/auth",async (req,res)=>{
    try {
        const {code} = req.query
        const token =  (await ghapp.oauth.createToken({code:code})).authentication.token
        const client = new Octokit({auth:token})
        res.json((await client.rest.users.getAuthenticated()).data)
    } catch (error) {
        res.status(500).json({error:"Server Error"})
        console.error(error)
    }

})

app.listen(port,console.log(`Server listening on ${port}`))