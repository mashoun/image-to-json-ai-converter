import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI('AIzaSyC3z8gkGXX_t8KKpKGRzc5F12fp6yr6mOw');

var app = Vue.createApp({
    data() {
        return {
            schema: {
                "title": "",
                "description": "",
                "brand": "",
                "features": "",
                "category": "",
            },
            result: null,
            nextImage: null,
            spinner: false,
        }
    },
    methods: {

        copyJSON() {
            navigator.clipboard.writeText(this.schema)
            alert('JSON Copied!')
        },

        async convertToJSON() {
            // will make API request
            if (this.nextImage && confirm('Proceed?')) {
                try {
                    this.spinner = true
                    // For text-and-images input (multimodal), use the gemini-pro-vision model
                    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

                    const prompt = `response back with a direct json representation of this product image, the json should have these properties [${Object.keys(this.schema).toString()}] if they are available.`;
                    console.log(prompt);
                    const fileInputEl = document.querySelector("#imageInput");
                    const imageParts = await Promise.all(
                        [...fileInputEl.files].map(this.fileToGenerativePart)
                    );

                    const result = await model.generateContent([prompt, ...imageParts]);
                    const response = await result.response;
                    const text = await response.text();
                    console.log(text);
                    this.result = text.replaceAll('```json', '').replaceAll('```', '')
                    this.spinner = false

                } catch (err) {
                    console.log(err);

                    this.spinner = false
                }
            }
        },

        async fileToGenerativePart(file) {
            const base64EncodedDataPromise = new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(file);
            });
            return {
                inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
            };
        },

        async uploadImage(e) {
            console.log(e.target.files);
            const files64 = (path) => {
                return new Promise((res, rej) => {
                    try {

                        const reader = new FileReader()
                        reader.readAsDataURL(path)
                        reader.onload = () => {
                            res(reader.result)
                        }

                    } catch (err) {
                        rej(err)
                    }
                })
            }

            console.log(await files64(e.target.files[0]));
            this.nextImage = await files64(e.target.files[0])
        }

    }
})

app.mount('#root')