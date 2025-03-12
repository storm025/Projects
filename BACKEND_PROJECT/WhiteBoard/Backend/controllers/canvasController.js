const Canvas = require('../models/canvas');
const User = require('../models/user');

const getUserCanvases = async (req, res) => {
    const email = req.email;
    try {
        const { userName, canvases } = await Canvas.getUserCanvases(email);

        res.status(200).json({
            userName,  
            canvases
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const createCanvas=async(req,res)=>{
    const email=req.email;
    const name=req.body.name;
    try{
        const canvas=await Canvas.createCanvas(email,name);
        res.status(200).json(canvas);
    }catch(error){
        res.status(400).json({message:error.message});
    }
};

const loadCanvas=async(req,res)=>{
    const email=req.email;
    const id=req.params.id;
    try{
        const canvas=await Canvas.loadCanvas(email,id);
        res.status(200).json(canvas);
    }catch(error){
        res.status(400).json({message:error.message});
    }
}

const updateCanvas=async(req,res)=>{
    const email=req.email;
    const id=req.params.id;
    const elements=req.body;
    try{
        const canvas=await Canvas.updateCanvas(email,id,elements);
        res.status(200).json(canvas);
    }catch(error){
        res.status(400).json({message:error.message});
    }
}


const deleteCanvas=async(req,res)=>{
    const email=req.email;
    const id=req.params.id;
    try{
        const canvas=await Canvas.deleteCanvas(email,id);
        res.status(200).json(canvas);
    }catch(error){
        res.status(400).json({message:error.message});
    }
}

const shareCanvas=async(req,res)=>{
    const email=req.email;
    const id=req.params.id;
    const sharedEmail=req.body.shared;
    try{
        const canvas=await Canvas.shareCanvas(email,id,sharedEmail);
        res.status(200).json(canvas);
    }catch(error){
        res.status(400).json({message:error.message});
    }
}

module.exports = { getUserCanvases,createCanvas,loadCanvas,updateCanvas,deleteCanvas,shareCanvas };
