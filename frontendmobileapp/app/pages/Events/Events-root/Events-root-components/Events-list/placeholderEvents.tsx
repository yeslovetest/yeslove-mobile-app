import eventImg1 from "../../../../../../assets/images/eventimg1.jpg";
import eventImg2 from "../../../../../../assets/images/eventimg2.jpg";
import eventImg3 from "../../../../../../assets/images/eventimg3.jpg";

export interface Event {
  name: string;
  location: string;
  dateShort: string;
  dateLong: string;
  time: string;
  year: number;
  address: string;
  extraInformation: string;
  image: any;
}

const eventPlaceholders = [
  {
    name: "Event name 1",
    location: "Venue, City",
    dateShort: "15th June",
    dateLong: "15th June, 2025",
    time: "5:00pm - 8:00pm",
    year: 2025,
    address: "1234 Maplewood Drive, Springfield, IL 62704, United States",
    extraInformation: "No extra information",
    image: eventImg1,
  },
  {
    name: "Event name 2",
    location: "Venue, City",
    dateShort: "18th Sep",
    dateLong: "18th September, 2025",
    time: "5:00pm - 8:00pm",
    year: 2025,
    address: "1234 Maplewood Drive, Springfield, IL 62704, United States",
    image: eventImg2,
  },
  {
    name: "Event name 3",
    location: "Venue, City",
    dateShort: "9th Aug",
    dateLong: "9th August, 2025",
    time: "5:00pm - 8:00pm",
    year: 2025,
    address: "1234 Maplewood Drive, Springfield, IL 62704, United States",
    image: eventImg3,
  },
] as Event[];

export default eventPlaceholders;
