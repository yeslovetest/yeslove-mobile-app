import blogimg1 from "../../assets/images/blogimg1.png"

export interface Blog{
    image: any;
    title: string; 
    author: string;
    datePosted: string;
    summary: string;
}

const blogPlaceholders = [{
    image: blogimg1,
    title: "Trapped by Tradition? How we can rethink love, safety, and culture together",
    author: "YesLove! Official",
    datePosted: "April 7, 2025",
    summary: "What if the reason someone stays in a toxic relationship isn’t love—but culture? 👀 The pressure, the silence, the shame… it’s deeper than you think. This article pulls back"
}, 

] as Blog[]

export default blogPlaceholders