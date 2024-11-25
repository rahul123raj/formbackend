const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const router = express.Router()
const cors = require('cors')
const multer = require('multer')
const { v4:uuidv4 } = require('uuid')
const cloudinary = require('cloudinary').v2
const fs = require('fs')

app.use(cors())

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET // Click 'View API Keys' above to copy your API secret
})

const url = process.env.MONGO_URL
let connectdb = async (req,res) =>{
    await mongoose.connect(url)
    console.log("database is connected")
}

connectdb()

//! creating schema
const formschema = new mongoose.Schema(
    {   
        imgurl: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        mobno: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        branch: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const FormModel = mongoose.model('Form', formschema)

//! initialize multer diskstorage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        let random = uuidv4()
      cb(null, random+""+file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })

//! posting the data or creating
let formPost = async (req,res)=>{
    try {

                // Upload an image
                const uploadResult = await cloudinary.uploader.upload(req.file.path);
     
                //  console.log(uploadResult);
                await fs.unlink(req.file.path, err =>{
                    if(err) throw err
                    console.log('file is deleted')
                   })
              let {name,email,mobno,address,branch} = req.body     
        let payload = await FormModel.create({
            imgurl: uploadResult.secure_url,
            name:name,
            email:email,
            mobno:mobno,
            address:address,
            branch:branch
        })

        res
        .status(200)
        .json({
            success: true,
            message: 'data is added',
            payload
        })
    } catch (error) {
        console.log(error)
    }
}

let formGet = async (req,res)=>{
    try {
        let payload = await FormModel.find()

        res
        .status(200)
        .json({
            success: true,
            message: 'data is fetched',
            payload
        })
    } catch (error) {
        console.log(error)
    }
}

let formGetbyid = async (req,res)=>{
    try {
        let payload = await FormModel.find({_id : req.params.id})

        res
        .status(200)
        .json({
            success: true,
            message: 'data is fetched with id',
            payload
        })
    } catch (error) {
        console.log(error)
    }
}

let formDelete = async (req,res)=>{
    try {
        let payload = await FormModel.deleteOne({_id : req.params.id})

        res
        .status(200)
        .json({
            success: true,
            message: 'data is deleted',
            payload
        })
    } catch (error) {
        console.log(error)
    }
}

let formUpdate = async (req,res)=>{
    try {

        const uploadResult = await cloudinary.uploader.upload(req.file.path);
     
        //  console.log(uploadResult);
        await fs.unlink(req.file.path, err =>{
            if(err) throw err
            console.log('file is deleted')
           })
      let {name,email,mobno,address,branch} = req.body

        let payload = await FormModel.updateOne(
            {_id : req.params.id},
            {$set: {
                imgurl: uploadResult.secure_url,
                name:name,
                email:email,
                mobno:mobno,
                address:address,
                branch:branch
            }
        })

        res
        .status(200)
        .json({
            success: true,
            message: 'data is updated',
            payload
        })
    } catch (error) {
        console.log(error)
    }
}


app.use(express.json())
app.use(router)
//! setting up the route
router.post('/form',upload.single('file'), formPost)
router.get('/form',formGet)
router.get('/form/:id',formGetbyid)
router.delete('/form/:id',formDelete)
router.patch('/form/:id',upload.single('file'),formUpdate)

port = process.env.PORT

app.listen(port, err =>{
    if(err) throw err
    console.log(`server is started on port ; http://localhost:${port}`)
})