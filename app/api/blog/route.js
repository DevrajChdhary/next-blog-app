import connectDB from "@/lib/config/db";
import blogModel from "@/lib/models/blogModel";
import {writeFile} from 'fs/promises'
import { title } from "process";
const { NextResponse } = require("next/server");

// 
const fs = require('fs');


const LoadDB = async() => {
    await connectDB();
}
LoadDB();

// For Getting The Blog Data
export async function GET(request){

    const blogId= request.nextUrl.searchParams.get("id");

        if(blogId){
            const blog = await blogModel.findById(blogId);
            return NextResponse.json(blog);
        }else{
            const blogs = await blogModel.find({});

            return NextResponse.json({ blogs });
        }
   
}

// For Uploading The Blog Data
export async function POST(request){
    // Getting the form data
    const formData= await request.formData();
    const timestamp= Date.now();

    // Getting the image data
    const image= formData.get('image');
    const imageByteData= await image.arrayBuffer();
    const buffer= Buffer.from(imageByteData);
    const path= `./public/${timestamp}_${image.name}`;
    // Saving the image to the public folder
    await writeFile(path,buffer);
    const imgUrl= `/${timestamp}_${image.name}`;

    // Creating the blog data
    const blogData = new blogModel({
        title: `${formData.get('title')}`,
        description: `${formData.get('description')}`,
        category: `${formData.get('category')}`,
        author: `${formData.get('author')}`,
        image: `${imgUrl}`,
        authorImg: `${formData.get('authorImg')}`
    });

    // Saving the blog data
    await blogData.save();
    console.log("Blog Saved");

    return NextResponse.json({ success:true, msg:"Blog Added" });
}

// API Endpoint For Deleting The Blog
export async function DELETE(request) {
    const id = await request.nextUrl.searchParams.get("id");
    const blog = await blogModel.findById(id);
    fs.unlink(`./public${blog.image}`, () => {});
    await blogModel.findByIdAndDelete(id);
    return NextResponse.json({ success:true, msg:"Blog Deleted" });
}