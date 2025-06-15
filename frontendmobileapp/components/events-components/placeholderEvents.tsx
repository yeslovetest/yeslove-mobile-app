import eventImg1 from "../../assets/images/eventimg1.jpg"
import eventImg2 from "../../assets/images/eventimg2.jpg"
import eventImg3 from "../../assets/images/eventimg3.jpg"

export interface Event{
    name: string;
    location: string;
    date: string;
    year: number;
    image: any;    
}

const eventPlaceholders = [{
    name: "Event name 1",
    location: "Venue, City",
    date: "15th June",
    year: 2025,
    image: eventImg1
}, 
{
    name: "Event name 2",
    location: "Venue, City",
    date: "18th Sep",
    year: 2025,
    image: eventImg2
},
{
    name: "Event name 3",
    location: "Venue, City",
    date: "9th Aug",
    year: 2025,
    image: eventImg3
},

] as Event[]

export default eventPlaceholders