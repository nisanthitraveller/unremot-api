import express from 'express';
import axios from 'axios';
import { PineconeClient } from "@pinecone-database/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { updatePinecone } from "../updatePinecone.js";
import { queryPineconeVectorStoreAndQueryLLM } from "../queryPineconeAndQueryGPT.js";
import passport from 'passport';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import User from '../models/user.js';
import APIProducts from '../models/api_products.js';
import { createWriteStream, promises as fsPromises } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
const streamPipeline = promisify(pipeline);

import * as dotenv from "dotenv";
import Category from '../models/category.js';
dotenv.config();

const router = express.Router();

router.get('/test', async (req, res) => {
    const user = await User.findOne({
        where: { id: 839 }, include: [{
            model: APIProducts,
            as: 'UserAPIs',
            include: [
                { model: Category, as: 'APICategory', attributes: ['category_name'] },
            ]
        }]
    });
    res.json({ message: 'Hello from server!', user: user });
});

router.post('/update-vector/:api_key', async (req, res) => {
    const folder = req.body.folder;
    const files = req.body.files;
    //const nameSpace = req.body.nameSpace;
    const LOCAL_DIR = "./" + folder.toString().replace('.', '-');
    await ensureDirectoryExists(LOCAL_DIR);

    const downloadPromises = files.map((file, index) => {
        const outputLocationPath = path.join(dir, `file_${index + 1}.pdf`); // Construct file path
        return downloadFile(file, outputLocationPath); // Start download
    });
    try {
        await Promise.all(downloadPromises);
        console.log('All files downloaded successfully.');
    } catch (error) {
        console.error('Error in file download:', error.message);
        // Handle errors as appropriate for your application's needs
    }

    const indexName = 'docue-ai-new';
    const nameSpace = folder.toString().replace('.', '-');

    const loader = new DirectoryLoader('./' + nameSpace, {
        ".pdf": (path) => new PDFLoader(path)
    })

    const docs = await loader.load();

    // 9. Initialize Pinecone client with API key and environment
    const client = new PineconeClient();
    await client.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
    });

    try {
        const options = {
            method: 'POST',
            url: process.env.PINECONE_URL + '/vectors/delete',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'Api-Key': process.env.PINECONE_API_KEY
            },
            data: { deleteAll: true, namespace: nameSpace }
        };
        axios
            .request(options)
            .then(function (response) {
                console.log("delete data " + JSON.stringify(response.data));
            })
            .catch(function (error) {
                console.error("An error occurred while deleting:" + error);
            });
    } catch (error) {
        console.error("An error occurred while deleting:", error);
    }
    await updatePinecone(client, indexName, nameSpace, docs);
    //deleteAllFilesInDir(LOCAL_DIR);
    res.status(500).json({ success: true, message: 'Updated from server!', answer: 'updated' });
});

router.get('/get-answer', passport.authenticate("jwt", { session: false }), async (req, res) => {
    let question = "What is BlitsEstates.com?";
    const folder = req.user.folder;
    if (req.query.question) {
        question = req.query.question;
    }
    const indexName = 'docue-ai-new';
    const nameSpace = folder.toString().replace('.', '-');
    const client = new PineconeClient();
    let answer = '';
    await client.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
    });
    // 13. Query Pinecone vector store and GPT model for an answer
    answer = await queryPineconeVectorStoreAndQueryLLM(client, indexName, nameSpace, question);

    res.json({ message: 'Hello from server!', question: question, answer: answer });
});
async function ensureDirectoryExists(dirPath) {
    try {
        //console.log(`Directory ${dirPath} exists.`);
        await fsPromises.access(dirPath);
    } catch (error) {
        // If directory does not exist, create it
        if (error.code === "ENOENT") {
            await fsPromises.mkdir(dirPath, { recursive: true });
            ///console.log(`Directory ${dirPath} created.`);
        } else {
            throw error;
        }
    }
}
async function deleteAllFilesInDir(dirPath) {
    try {
        const files = await fsPromises.readdir(dirPath);

        for (const file of files) {
            const filePath = `${dirPath}/${file}`;
            await fsPromises.unlink(filePath);
            //console.log(`Deleted file: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error deleting files in ${dirPath}:`, error);
    }
}
async function downloadPDF(pdfUrl, outputLocationPath) {
    try {
        // Axios performs a GET request to fetch the PDF from the given URL
        const response = await axios({
            method: 'get',
            url: pdfUrl,
            responseType: 'stream',
        });

        // Pipe the result stream into a file on your local machine.
        const writeStream = fs.createWriteStream(outputLocationPath);
        response.data.pipe(writeStream);

        return new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
}

export default router;