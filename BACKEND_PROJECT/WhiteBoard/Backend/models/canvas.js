const mongoose = require('mongoose');
const User = require('../models/user');

const canvasSchema = new mongoose.Schema(
    {
        name: {type: String,required: true,trim: true},
        owner: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
        elements: [{ type : mongoose.Schema.Types.Mixed}],
        shared: [{type: mongoose.Schema.Types.ObjectId,ref: "User"}], 
    },
    { timestamps: true }
);

canvasSchema.statics.getUserCanvases = async function (email) {
    try {
        const user = await mongoose.model('User').findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }

        const canvases = await this.find(
            { $or: [{ owner: user._id }, { shared: user._id }] },
            { elements: 0 }
        );

        return {
            userName: user.name,  
            canvases: canvases
        };
    } catch (error) {
        throw new Error('Error while fetching canvases: ' + error.message);
    }
};




canvasSchema.statics.createCanvas = async function (email, name) {
    try {
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const canvas = new this({
            name, 
            owner: user._id,
            shared: [],
            elements: []
        });

        return await canvas.save();
    } catch (error) {
        throw new Error('Error while creating canvas: ' + error.message);
    }
};

canvasSchema.statics.loadCanvas = async function (email,id) {
    const user = await mongoose.model('User').findOne({ email });
    try {
        if(!user){
            throw new Error('User not found');
        }

        const canvas = await this.findOne({
            _id: id,
            $or: [{ owner: user._id }, { shared: user._id }]
        });

        return canvas;
    
    } catch (error) {
        throw new Error('Error while loading canvas: ' + error.message);
    }
};

canvasSchema.statics.updateCanvas = async function (email, id, elements) {
    const user = await mongoose.model('User').findOne({ email });
    try {
        if(!user){
            throw new Error('User not found');
        }

        const canvas = await this.findOne({
            _id: id,
            $or: [{ owner: user._id }, { shared: user._id }]
        });

        if (!canvas) {
            throw new Error('Canvas not found');
        }
        if (!Array.isArray(elements)) {
            throw new Error("Invalid elements format, expected an array");
        }
        canvas.elements = elements;
        const updatedCanvas = await canvas.save();
        return updatedCanvas;
    } catch (error) {
        throw new Error('Error while updating canvas: ' + error.message);
    }
}

canvasSchema.statics.deleteCanvas = async function (email, id) {
    try {
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const canvas = await this.findOne({ _id: id });
        if (!canvas) {
            throw new Error('Canvas not found');
        }

        if (!canvas.owner.equals(user._id)) {
            throw new Error('You do not have permission to delete this canvas');
        }

        await canvas.deleteOne();
        return { message: "Canvas deleted successfully" };
    } catch (error) {
        throw new Error('Error while deleting canvas: ' + error.message);
    }
};

canvasSchema.statics.shareCanvas = async function (email, id, emailToShare) {
    try {
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const userToShare = await mongoose.model('User').findOne({ email: emailToShare });
        if (!userToShare) {
            throw new Error('User to share not found');
        }

        const canvas = await this.findOne({ _id: id });
        if (!canvas) {
            throw new Error('Canvas not found');
        }

        if (!canvas.owner.equals(user._id)) {
            throw new Error('You do not have permission to share this canvas');
        }

        if (canvas.shared.includes(userToShare._id)) {
            throw new Error('Canvas already shared with this user');
        }

        canvas.shared.push(userToShare._id);
        await canvas.save();
        return { message: "Canvas shared successfully" };
    } catch (error) {
        throw new Error('Error while sharing canvas: ' + error.message);
    }
}


const Canvas = mongoose.model('Canvas', canvasSchema);
module.exports = Canvas;
