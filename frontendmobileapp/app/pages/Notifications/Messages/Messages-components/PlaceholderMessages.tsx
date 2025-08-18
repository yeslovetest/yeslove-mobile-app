import profileImg1 from "../../../../../assets/images/profileImg1.jpg"
import profileImg2 from "../../../../../assets/images/profileImg2.jpg"
import profileImg3 from "../../../../../assets/images/profileImg3.jpg"
import profileImg4 from "../../../../../assets/images/profileImg4.jpg"
import profileImg5 from "../../../../../assets/images/profileImg5.jpg"
import profileImg6 from "../../../../../assets/images/profileImg6.jpg"
import { ImageSourcePropType } from 'react-native'

export interface Message {
    image: ImageSourcePropType;
    user: string; 
    message: string;
    timeReceived: string;
    opened: boolean;
}

const PlaceholderMessages: Message[] = [
    {
        image: profileImg1,
        user: "Susan",
        message: "Hi, how have you been feeling since our last session?",
        timeReceived: "30 mins ago",
        opened: false,
    },
    {
        image: profileImg2,
        user: "Stacey",
        message: "Remember to take a few deep breaths if you're feeling overwhelmed.",
        timeReceived: "2 hrs ago",
        opened: false,
    },
    {
        image: profileImg3,
        user: "James",
        message: "Would you like to try a quick mindfulness exercise now?",
        timeReceived: "22 hrs ago",
        opened: true,
    },
    {
        image: profileImg4,
        user: "Emily",
        message: "It's okay to take a break. Self-care is important.",
        timeReceived: "3 days ago",
        opened: true,
    },
    {
        image: profileImg5,
        user: "Rachel",
        message: "How did you sleep last night? Rest is key for mental health.",
        timeReceived: "3 days ago",
        opened: false,
    },
    {
        image: profileImg6,
        user: "Molly",
        message: "Remember, it's okay to feel anxious sometimes. You're not alone.",
        timeReceived: "5 days ago",
        opened: true,
    },
]

export default PlaceholderMessages
